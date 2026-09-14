import { useEffect, useState, lazy, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { getProject, getListingsByProject } from '../api.js'
import ListingCard from '../components/ListingCard.jsx'
import {
  ArrowLeft, Building2, Layers, CalendarClock, CheckCircle2,
  MapPin, Tag, Home, TrendingUp, ExternalLink, Hash,
  LayoutTemplate, Calendar, Maximize2, Shield
} from 'lucide-react'
import styles from './ProjectDetailPage.module.css'

const LocationMap = lazy(() => import('../components/LocationMap.jsx'))

// Same pool of Unsplash images used in ProjectsPage
const PROJECT_IMGS = [
  'photo-1545324418-cc1a3fa10c00',
  'photo-1512917774080-9991f1c4c750',
  'photo-1580587771525-78b9dba3b914',
  'photo-1600596542815-ffad4c1539a9',
  'photo-1558618666-fcd25c85cd64',
  'photo-1600607687939-ce8a6c25118c',
  'photo-1600210492486-724fe5c67fb0',
  'photo-1600047509807-ba8f99d2cdde',
  'photo-1613977257363-707ba9348227',
  'photo-1622015663319-e97e697503ee',
  'photo-1486325212027-8081e485255e',
  'photo-1560448204-e02f11c3d0e2',
]

const STATUS_META = {
  'ready to move':      { bg: '#dcfce7', color: '#166534', dot: '#16a34a', label: 'Ready to Move' },
  'under construction': { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', label: 'Under Construction' },
  'new launch':         { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6', label: 'New Launch' },
}

// Deterministic image selection based on project_id hash
function pickImage(projectId) {
  let hash = 0
  for (let i = 0; i < projectId.length; i++) hash = (hash * 31 + projectId.charCodeAt(i)) & 0xffff
  return PROJECT_IMGS[hash % PROJECT_IMGS.length]
}

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return d }
}

export default function ProjectDetailPage() {
  const { id }    = useParams()
  const { token } = useAuth()

  const [project,  setProject]  = useState(null)
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [imgIdx,   setImgIdx]   = useState(0)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getProject(token, id),
      getListingsByProject(token, id),
    ])
      .then(([proj, lstData]) => {
        setProject(proj)
        setListings(lstData.results || [])
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, token])

  if (loading) return (
    <div className={styles.loadState}>
      <div className={styles.spinner} />
      <p>Loading project…</p>
    </div>
  )
  if (error) return (
    <div className={styles.errState}>
      <p>⚠ {error}</p>
      <Link to="/projects" className={styles.backLink}><ArrowLeft size={14} /> Back to projects</Link>
    </div>
  )
  if (!project) return null

  const st = STATUS_META[project.project_status?.toLowerCase()] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8', label: project.project_status }
  const slug = pickImage(id)

  // Build 4 gallery images — same base image with slight Unsplash variations
  const galleryImgs = [
    `https://images.unsplash.com/${slug}?auto=format&fit=crop&w=1400&q=85`,
    `https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80`,
    `https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80`,
    `https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80`,
  ]

  const priceRange = project.price_min && project.price_max && project.price_max > 10
    ? `₹${project.price_min.toFixed(1)} L – ₹${project.price_max.toFixed(1)} L`
    : null

  const cleanAmenities = (project.amenities || []).filter(a => typeof a === 'string' && a.length < 30)

  return (
    <div className={styles.page}>
      {/* ── Back bar ── */}
      <div className={styles.topBar}>
        <Link to="/projects" className={styles.backLink}>
          <ArrowLeft size={15} /> Back to Projects
        </Link>
        <a href={project.project_url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
          <ExternalLink size={14} /> View on Ivy Homes
        </a>
      </div>

      {/* ── Gallery ── */}
      <div className={styles.gallery}>
        <div className={styles.galleryMain}>
          <img src={galleryImgs[imgIdx]} alt={project.apartment_name} className={styles.galleryMainImg} />

          {/* Overlay info */}
          <div className={styles.galleryOverlay}>
            <div className={styles.galleryBadges}>
              <span className={styles.statusBadge} style={{ background: st.bg, color: st.color }}>
                <span className={styles.statusDot} style={{ background: st.dot }} />
                {st.label}
              </span>
              {project.rera_number && (
                <span className={styles.reraBadge}><Shield size={11} />RERA Registered</span>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        <div className={styles.thumbRow}>
          {galleryImgs.map((src, i) => (
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

      {/* ── Two-column layout ── */}
      <div className={styles.layout}>

        {/* ════ LEFT / MAIN ════ */}
        <div className={styles.main}>

          {/* Header */}
          <div className={styles.headerCard}>
            <p className={styles.developerLabel}>by {project.developer_name}</p>
            <h1 className={styles.title}>{project.apartment_name}</h1>
            <p className={styles.locality}>
              <MapPin size={14} strokeWidth={1.8} />
              {project.locality ? project.locality.charAt(0).toUpperCase() + project.locality.slice(1) : '—'}, Chennai
            </p>

            {priceRange && (
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Starting from</span>
                <span className={styles.price}>{priceRange}</span>
              </div>
            )}
          </div>

          {/* Key facts strip */}
          <div className={styles.factsStrip}>
            <Fact icon={Home}          label="Listings"     value={project.total_listings} />
            <Fact icon={Layers}        label="Total Units"  value={project.total_units?.toLocaleString('en-IN')} />
            <Fact icon={Building2}     label="Towers"       value={project.total_towers} />
            <Fact icon={LayoutTemplate} label="Floors"      value={project.total_floors} />
            <Fact icon={Maximize2}     label="Area Range"
              value={project.min_area_sqft ? `${project.min_area_sqft}–${project.max_area_sqft} ft²` : null} />
          </div>

          {/* Project Details */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Project Details</h2>
            <div className={styles.detailGrid}>
              <Detail label="Developer"        value={project.developer_name} />
              <Detail label="Locality"         value={project.locality ? project.locality.charAt(0).toUpperCase() + project.locality.slice(1) : null} />
              <Detail label="Status"           value={st.label} />
              <Detail label="Total Units"      value={project.total_units?.toLocaleString('en-IN')} />
              <Detail label="Total Towers"     value={project.total_towers} />
              <Detail label="Total Floors"     value={project.total_floors} />
              <Detail label="Min Area"         value={project.min_area_sqft ? `${project.min_area_sqft} sq.ft` : null} />
              <Detail label="Max Area"         value={project.max_area_sqft ? `${project.max_area_sqft} sq.ft` : null} />
              <Detail label="Launch Date"      value={fmtDate(project.launch_date)} />
              <Detail label="Possession Date"  value={fmtDate(project.possession_date)} />
              <Detail label="RERA Number"      value={project.rera_number} mono />
              <Detail label="Project ID"       value={project.project_id} mono />
            </div>
          </section>

          {/* Amenities */}
          {cleanAmenities.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Amenities</h2>
              <div className={styles.amenitiesGrid}>
                {cleanAmenities.map((a, i) => (
                  <div key={i} className={styles.amenityItem}>
                    <span className={styles.amenityDot} />
                    {a}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Listings inside this project */}
          {listings.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                Available Listings
                <span className={styles.listingsBadge}>{listings.length}</span>
              </h2>
              <div className={styles.listingsGrid}>
                {listings.map((l, i) => (
                  <ListingCard key={l.listing_id} listing={l} index={i} />
                ))}
              </div>
            </section>
          )}

          {listings.length === 0 && !loading && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Available Listings</h2>
              <div className={styles.noListings}>
                <Home size={28} strokeWidth={1.2} className={styles.noListingsIcon} />
                <p>No active listings found for this project right now.</p>
                <Link to="/listings" className={styles.browseBtn}>Browse all listings →</Link>
              </div>
            </section>
          )}

          {/* Map */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Location</h2>
            {project.latitude && project.longitude ? (
              <Suspense fallback={<div style={{ height: 380, background: '#f1f5f9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>Loading map…</div>}>
                <LocationMap
                  latitude={project.latitude}
                  longitude={project.longitude}
                  name={project.project_name}
                  locality={project.locality}
                />
              </Suspense>
            ) : (
              <div className={styles.mapCard}>
                <MapPin size={30} className={styles.mapPin} />
                <p>Location not available</p>
              </div>
            )}
          </section>
        </div>

        {/* ════ RIGHT / SIDEBAR ════ */}
        <aside className={styles.sidebar}>

          {/* Price card */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Pricing</h3>
            {priceRange ? (
              <div className={styles.priceBig}>{priceRange}</div>
            ) : (
              <p className={styles.priceNA}>Price on request</p>
            )}
            {project.min_area_sqft && (
              <p className={styles.priceNote}>
                {project.min_area_sqft} – {project.max_area_sqft} sq.ft carpet area
              </p>
            )}
          </div>

          {/* Quick facts */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Quick Facts</h3>
            <div className={styles.quickFacts}>
              <QFact icon={CalendarClock} label="Possession" value={fmtDate(project.possession_date)} />
              <QFact icon={Calendar}      label="Launched"   value={fmtDate(project.launch_date)} />
              <QFact icon={Hash}          label="RERA"       value={project.rera_number} mono small />
              <QFact icon={TrendingUp}    label="Price/unit" value={priceRange || '—'} />
              <QFact icon={Home}          label="Listings"   value={`${project.total_listings} active`} />
            </div>
          </div>

          {/* Status card */}
          <div className={styles.sideCard} style={{ borderLeft: `3px solid ${st.dot}` }}>
            <div className={styles.statusCard}>
              <span className={styles.statusBadgeLarge} style={{ background: st.bg, color: st.color }}>
                <span className={styles.statusDot} style={{ background: st.dot }} />
                {st.label}
              </span>
              {project.rera_number && (
                <div className={styles.reraRow}>
                  <CheckCircle2 size={14} className={styles.reraIcon} />
                  <div>
                    <p className={styles.reraLabel}>RERA Registered</p>
                    <p className={styles.reraNum}>{project.rera_number}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Developer card */}
          <div className={styles.sideCard}>
            <h3 className={styles.sideTitle}>Developer</h3>
            <div className={styles.devRow}>
              <div className={styles.devAvatar}>
                {project.developer_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className={styles.devName}>{project.developer_name}</p>
                <p className={styles.devSub}>Registered Developer</p>
              </div>
            </div>
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.devBtn}
            >
              <ExternalLink size={14} /> View on Ivy Homes
            </a>
          </div>

        </aside>
      </div>
    </div>
  )
}

/* ── Sub-components ────────────────────── */
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

function Detail({ label, value, mono = false }) {
  if (!value && value !== 0) return null
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={`${styles.detailValue} ${mono ? styles.detailMono : ''}`}>{String(value)}</span>
    </div>
  )
}

function QFact({ icon: Icon, label, value, mono = false, small = false }) {
  return (
    <div className={styles.qFact}>
      <Icon size={13} className={styles.qFactIcon} />
      <span className={styles.qFactLabel}>{label}</span>
      <span className={`${styles.qFactValue} ${mono ? styles.qFactMono : ''} ${small ? styles.qFactSmall : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}
