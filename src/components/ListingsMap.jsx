import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'

/* ── plain CSS imports — must NOT be CSS modules ── */
import 'leaflet/dist/leaflet.css'
import './leaflet-overrides.css'

/* ── Fix Leaflet's broken default icon URLs under Vite ── */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',   import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

/* ── Custom SVG price-label marker ─────────────────────────── */
function makePriceIcon(price, isLive, isActive) {
  const bg = isActive ? '#1e40af' : isLive ? '#1a6b4a' : '#dc2626'
  const label = price && price > 0
    ? (price >= 10000000
        ? `₹${(price / 10000000).toFixed(1)}Cr`
        : `₹${(price / 100000).toFixed(0)}L`)
    : '—'

  const html = `
    <div style="
      background:${bg};
      color:#fff;
      font-family:'Inter',sans-serif;
      font-size:11px;
      font-weight:700;
      padding:4px 8px;
      border-radius:20px;
      white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,.3);
      border:2px solid rgba(255,255,255,.9);
      position:relative;
    ">
      ${label}
      <div style="
        position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);
        width:0;height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:7px solid ${bg};
      "></div>
    </div>`

  return L.divIcon({
    html,
    className: '',
    iconSize:   [null, null],
    iconAnchor: [0, 36],
    popupAnchor:[40, -36],
  })
}

/* ── Auto-fit map bounds whenever listings change ─── */
function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [52, 52], maxZoom: 14, animate: true })
  }, [points, map])
  return null
}

/* ── Price formatter for popup ─── */
function fmtPrice(p) {
  if (!p || p <= 0) return 'Price N/A'
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`
  if (p >= 100000)   return `₹${(p / 100000).toFixed(1)} L`
  return `₹${p.toLocaleString('en-IN')}`
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
export default function ListingsMap({ listings, activeId, onMarkerClick }) {
  const geoListings = useMemo(
    () => listings.filter(l => l.latitude && l.longitude),
    [listings]
  )

  const points = useMemo(
    () => geoListings.map(l => [l.latitude, l.longitude]),
    [geoListings]
  )

  const liveCount = geoListings.filter(l => l.is_live).length
  const offCount  = geoListings.length - liveCount

  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>

      {/* ── Info strip ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 16px', background: '#fff',
        borderBottom: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'Inter, sans-serif',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
          {liveCount} live
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151', fontWeight: 500 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
          {offCount} off market
        </span>
        <span style={{ marginLeft: 'auto', color: '#6b7280', fontWeight: 500 }}>
          {geoListings.length} of {listings.length} mapped
        </span>
      </div>

      {/* ── Map ── */}
      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={11}
        style={{ height: 620, width: '100%' }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        {points.length > 0 && <FitBounds points={points} />}

        {geoListings.map(l => (
          <Marker
            key={l.listing_id}
            position={[l.latitude, l.longitude]}
            icon={makePriceIcon(l.price, l.is_live, l.listing_id === activeId)}
            eventHandlers={{ click: () => onMarkerClick?.(l.listing_id) }}
          >
            <Popup minWidth={260} maxWidth={268}>
              {/* Popup content — inline styles to avoid CSS Module scope issues */}
              <div style={{ fontFamily: 'Inter, sans-serif', width: 260, margin: -1 }}>
                {/* Image */}
                <div style={{ height: 138, overflow: 'hidden', background: '#f1f5f9', position: 'relative' }}>
                  <img
                    src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=400&q=70"
                    alt={l.apartment_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <span style={{
                    position: 'absolute', top: 8, left: 8,
                    background: l.is_live ? '#dcfce7' : '#fee2e2',
                    color: l.is_live ? '#166534' : '#991b1b',
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 9px', borderRadius: 20,
                  }}>
                    {l.is_live ? '● Live' : '○ Off market'}
                  </span>
                </div>

                {/* Body */}
                <div style={{ padding: '12px 14px 14px' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-0.03em', marginBottom: 3 }}>
                    {fmtPrice(l.price)}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#24292f', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {l.apartment_name}
                  </p>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                    📍 {l.locality?.charAt(0).toUpperCase() + l.locality?.slice(1)}, Chennai
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: '#374151', marginBottom: 12 }}>
                    <span>🛏 {l.bedroom} BHK</span>
                    <span>🚿 {l.bathroom} Bath</span>
                    {l.carpet_area > 0 && <span>📐 {l.carpet_area.toLocaleString()} ft²</span>}
                    {l.floor != null && <span>🏢 Floor {l.floor}</span>}
                  </div>
                  <Link
                    to={`/listings/${l.listing_id}`}
                    style={{
                      display: 'block', width: '100%', padding: '9px 0',
                      textAlign: 'center', background: '#1a6b4a', color: '#fff',
                      borderRadius: 9, fontSize: 13, fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
