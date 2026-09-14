import { useEffect, useState, lazy, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { useFavorites } from '../FavoritesContext.jsx'
import { getListing, getSimilarListings } from '../api.js'
import {
  ArrowLeft, Heart, Share2, ExternalLink,
  BedDouble, Bath, Maximize2, Layers, Compass, Car,
  Sofa, CheckCircle2, Calendar, Phone, Globe,
  Tag, Building2, MapPin, TrendingUp
} from 'lucide-react'
import styles from './ListingDetailPage.module.css'

const LocationMap = lazy(() => import('../components/LocationMap.jsx'))
const ListingCard = lazy(() => import('../components/ListingCard.jsx'))

function fmtPrice(p) {
  if (!p || p <= 0) return 'Price on request'
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`
  if (p >= 100000)   return `₹${(p / 100000).toFixed(1)} L`
  return `₹${p.toLocaleString('en-IN')}`
}

function fmtNum(n) {
  if (!n && n !== 0) return '—'
  return typeof n === 'number' ? n.toLocaleString('en-IN') : n
}

const IMAGES = [
  'photo-1600607687920-4e2a09cf159d',
  'photo-1600566753190-17f0baa2a6c3',
  'photo-1600585154340-be6161a56a0c',
  'photo-1600047509807-ba8f99d2cdde',
]

export default function ListingDetailPage() {
  const { id }   = useParams()
  const { token } = useAuth()
  const { toggle, isFavorite } = useFavorites()

  const [listing,  setListing]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [imgIdx,   setImgIdx]   = useState(0)
  const [copied,   setCopied]   = useState(false)
  const [similar,  setSimilar]  = useState([])

  useEffect(() => {
    setLoading(true)
    getListing(token, id)
      .then(setListing)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, token])

  useEffect(() => {
    if (listing?.listing_id) {
      getSimilarListings(token, listing.listing_id)
        .then(data => setSimilar(data.results || []))
        .catch(() => setSimilar([]))
    }
  }, [listing?.listing_id, token])

  if (loading) return (
    <div className={styles.loadState}>
      <div className={styles.spinner} />
      <p>Loading property…</p>
    </div>
  )
  if (error) return (
    <div className={styles.errState}>
      <p>⚠ {error}</p>
      <Link to="/listings" className={styles.backLink}><ArrowLeft size={14} /> Back to listings</Link>
    </div>
  )
  if (!listing) return null

  const fav = isFavorite(listing.listing_id)
  const ppsf = listing.price > 0 && listing.carpet_area > 0
    ? `₹${Math.round(listing.price / listing.carpet_area).toLocaleString('en-IN')}/ft²` : null
  const loadingPct = listing.carpet_area && listing.super_built_up_area
    ? Math.round((listing.super_built_up_area / listing.carpet_area - 1) * 100) : null

  const postedDate = listing.posted_at
    ? new Date(listing.posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  async function handleShare() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { /* ignore */ }
  }

  const imgs = IMAGES.map(s => `https://images.unsplash.com/${s}?auto=format&fit=crop&w=1200&q=80`)

  return (
    <div className={styles.page}>
      {/* ── Back + Actions ── */}
      <div className={styles.topBar}>
        <Link to="/listings" className={styles.backLink}><ArrowLeft size={15} />Back to listings</Link>
        <div className={styles.topActions}>
          <button className={styles.actionBtn} onClick={handleShare}>
            <Share2 size={15} />
            {copied ? 'Copied!' : 'Share'}
          </button>
          <button
            className={`${styles.actionBtn} ${fav ? styles.favActive : ''}`}
            onClick={() => toggle(listing)}
          >
            <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
            {fav ? 'Saved' : 'Save'}
          </button>
          <a href={listing.listing_url} target="_blank" rel="noopener noreferrer" className={styles.actionBtn}>
            <ExternalLink size={15} /> View source
          </a>
        </div>
      </div>

      {/* ── Gallery ── */}
      <div className={styles.gallery}>
        <div className={styles.galleryMain}>
          <img src={imgs[imgIdx]} alt={listing.apartment_name} className={styles.galleryImg} />
          {listing.is_live && (
            <span className={styles.livePill}><span className={styles.liveDot} />Live</span>
          )}
          {listing.is_verified && (
            <span className={styles.verPill}><CheckCircle2 size={11} />Verified</span>
          )}
        </div>
        <div className={styles.thumbRow}>
          {imgs.map((src, i) => (
            <button
              key={i}
              className={`${styles.thumb} ${imgIdx === i ? styles.thumbActive : ''}`}
              onClick={() => setImgIdx(i)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className={styles.layout}>
        {/* ── Left / Main ── */}
        <div className={styles.main}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <span className={styles.propTypePill}>{listing.property_type}</span>
              <span className={styles.websitePill}>{listing.website}</span>
            </div>
            <h1 className={styles.title}>{listing.apartment_name}</h1>
            <p className={styles.locality}>
              <MapPin size={14} strokeWidth={1.8} />
              {listing.locality?.charAt(0).toUpperCase() + listing.locality?.slice(1)}, Chennai
            </p>
            <div className={styles.priceRow}>
              <span className={styles.price}>{fmtPrice(listing.price)}</span>
              {ppsf && <span className={styles.ppsf}><TrendingUp size={12} />{ppsf}</span>}
            </div>
          </div>

          {/* Key facts strip */}
          <div className={styles.factsStrip}>
            <Fact icon={BedDouble} label="Bedrooms"   value={`${listing.bedroom} BHK`} />
            <Fact icon={Bath}      label="Bathrooms"  value={listing.bathroom} />
            <Fact icon={Maximize2} label="Carpet Area" value={listing.carpet_area ? `${fmtNum(listing.carpet_area)} ft²` : null} />
            <Fact icon={Layers}    label="Floor"      value={listing.floor != null ? `${listing.floor} of ${listing.total_floors}` : null} />
            <Fact icon={Compass}   label="Facing"     value={listing.facing_direction} />
            <Fact icon={Car}       label="Parking"    value={listing.covered_parking} />
          </div>

          {/* Details card */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Property Details</h2>
            <div className={styles.detailGrid}>
              <Detail label="Property Type"   value={listing.property_type} />
              <Detail label="Furnishing"      value={listing.furnishing} />
              <Detail label="Balconies"       value={listing.balcony} />
              <Detail label="Carpet Area"     value={listing.carpet_area ? `${fmtNum(listing.carpet_area)} sq.ft` : null} />
              <Detail label="Super Built-up"  value={listing.super_built_up_area ? `${fmtNum(listing.super_built_up_area)} sq.ft` : null} />
              <Detail label="Loading %"       value={loadingPct != null ? `~${loadingPct}%` : null} />
              <Detail label="Floor"           value={listing.floor != null ? `${listing.floor} / ${listing.total_floors}` : null} />
              <Detail label="Facing"          value={listing.facing_direction} />
              <Detail label="Covered Parking" value={listing.covered_parking} />
              <Detail label="Status"          value={listing.is_live ? 'Live / Active' : 'Off market'} />
              <Detail label="Verified"        value={listing.is_verified ? 'Yes' : 'No'} />
              <Detail label="Source"          value={listing.website} />
            </div>
          </section>

          {/* Description */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>About this property</h2>
            <p className={styles.description}>{listing.description || 'No description available.'}</p>
          </section>

          {/* Map */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Location</h2>
            {listing.latitude && listing.longitude ? (
              <Suspense fallback={<div style={{ height: 380, background: '#f1f5f9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>Loading map…</div>}>
                <LocationMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  name={listing.apartment_name}
                  locality={listing.locality}
                />
              </Suspense>
            ) : (
              <div className={styles.mapPlaceholder}>
                <MapPin size={28} className={styles.mapPin} />
                <p className={styles.mapText}>Location not available</p>
              </div>
            )}
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          {/* Contact card */}
          <div className={styles.contactCard}>
            <h3 className={styles.contactTitle}>Contact Agent</h3>
            <div className={styles.agentRow}>
              <div className={styles.agentAvatar}>
                {listing.posted_by_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className={styles.agentInfo}>
                <p className={styles.agentName}>{listing.posted_by_name}</p>
                <p className={styles.agentType}>{listing.posted_by}</p>
              </div>
            </div>
            <a href={`tel:${listing.posted_by_contact}`} className={styles.callBtn}>
              <Phone size={16} /> {listing.posted_by_contact}
            </a>
            <button className={styles.msgBtn} onClick={handleShare}>
              <Share2 size={15} /> Share this property
            </button>
          </div>

          {/* Meta card */}
          <div className={styles.metaCard}>
            <h3 className={styles.metaTitle}>Listing Info</h3>
            <div className={styles.metaList}>
              <MetaRow icon={Tag}       label="Listing ID"  value={<code className={styles.code}>{listing.listing_id}</code>} />
              <MetaRow icon={Building2} label="Project ID"  value={<code className={styles.code}>{listing.project_id || '—'}</code>} />
              <MetaRow icon={Globe}     label="Portal"      value={listing.website} />
              <MetaRow icon={Calendar}  label="Posted"      value={postedDate} />
            </div>
          </div>

          {/* Price breakdown */}
          <div className={styles.priceCard}>
            <h3 className={styles.metaTitle}>Price Analysis</h3>
            <div className={styles.priceAnalysis}>
              <div className={styles.priceRow2}>
                <span>Total price</span>
                <strong>{fmtPrice(listing.price)}</strong>
              </div>
              {ppsf && (
                <div className={styles.priceRow2}>
                  <span>Per sq.ft (carpet)</span>
                  <strong>{ppsf}</strong>
                </div>
              )}
              {listing.super_built_up_area > 0 && listing.price > 0 && (
                <div className={styles.priceRow2}>
                  <span>Per sq.ft (SBA)</span>
                  <strong>₹{Math.round(listing.price / listing.super_built_up_area).toLocaleString('en-IN')}/ft²</strong>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Similar Listings ── */}
      {similar.length > 0 && (
        <section className={styles.similarSection}>
          <h2 className={styles.similarTitle}>Similar Properties</h2>
          <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-5)' }}>Loading...</div>}>
            <div className={styles.similarGrid}>
              {similar.slice(0, 4).map((l, i) => (
                <ListingCard key={l.listing_id} listing={l} index={i} />
              ))}
            </div>
          </Suspense>
        </section>
      )}
    </div>
  )
}

function Fact({ icon: Icon, label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className={styles.fact}>
      <div className={styles.factIcon}><Icon size={16} strokeWidth={1.8} /></div>
      <span className={styles.factLabel}>{label}</span>
      <span className={styles.factValue}>{value}</span>
    </div>
  )
}

function Detail({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{String(value)}</span>
    </div>
  )
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className={styles.metaRow}>
      <Icon size={13} className={styles.metaIcon} />
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{value ?? '—'}</span>
    </div>
  )
}
