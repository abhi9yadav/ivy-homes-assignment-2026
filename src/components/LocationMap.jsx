import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './leaflet-overrides.css'

/* ── Fix Leaflet default icon ── */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',   import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

/* ── Custom green pin icon ── */
const greenPin = L.divIcon({
  html: `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C9.373 2 4 7.373 4 14c0 9.333 12 26 12 26S28 23.333 28 14C28 7.373 22.627 2 16 2z"
        fill="#1a6b4a" stroke="#0f3d2b" stroke-width="2"/>
      <circle cx="16" cy="14" r="5" fill="white" opacity="0.95"/>
    </svg>`,
  className: '',
  iconSize:   [32, 42],
  iconAnchor: [16, 42],
  popupAnchor:[0, -44],
})

/* ════════════════════════════════════════════════════════════════
   Single location map — for detail pages
   Shows one marker at the provided lat/lng
════════════════════════════════════════════════════════════════ */
export default function LocationMap({ latitude, longitude, name, locality }) {
  if (!latitude || !longitude) return null

  const position = [latitude, longitude]
  const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,.08)',
    }}>
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: 380, width: '100%' }}
        scrollWheelZoom={false}
        zoomControl
        dragging
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          maxZoom={19}
        />

        <Marker position={position} icon={greenPin}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', padding: '4px 6px' }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#0a0a0a' }}>
                {name || 'Property location'}
              </p>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                📍 {locality ? `${locality.charAt(0).toUpperCase() + locality.slice(1)}, Chennai` : 'Chennai'}
              </p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#1a6b4a',
                  textDecoration: 'none',
                  borderBottom: '1px solid #1a6b4a',
                }}
              >
                Open in Google Maps ↗
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Footer strip with coordinates + Google Maps link */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: '#f9fafb',
        borderTop: '1px solid #e2e8f0',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
      }}>
        <span style={{ color: '#6b7280', fontFamily: 'monospace' }}>
          {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </span>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#1a6b4a',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" transform="scale(0.58)"/>
            <circle cx="7" cy="5.8" r="2"/>
          </svg>
          Open in Google Maps
        </a>
      </div>
    </div>
  )
}
