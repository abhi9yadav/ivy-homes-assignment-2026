import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { getProjects } from '../api.js'
import Pagination from '../components/Pagination.jsx'
import {
  Building2, Home, Layers, CalendarClock,
  Tag, Search, X, ArrowUpRight, MapPin,
  CheckCircle2, TrendingUp
} from 'lucide-react'
import styles from './ProjectsPage.module.css'

const PAGE_SIZE = 20
const STATUS_OPTS = ['all', 'ready to move', 'under construction', 'new launch']

const STATUS_META = {
  'ready to move':      { bg: '#dcfce7', color: '#166534', dot: '#16a34a' },
  'under construction': { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  'new launch':         { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
}

// Curated Unsplash project images — cycling by index
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

export default function ProjectsPage() {
  const { token } = useAuth()
  const [projects,  setProjects]  = useState([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [search,    setSearch]    = useState('')
  const [status,    setStatus]    = useState('all')

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const doFetch = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await getProjects(token, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })
      setProjects(data.results || [])
      setTotal(data.total || 0)
    } catch (e) { setError(e.message) }
    finally     { setLoading(false) }
  }, [token, page])

  useEffect(() => { doFetch() }, [doFetch])

  const filtered = projects.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      p.apartment_name?.toLowerCase().includes(q) ||
      p.developer_name?.toLowerCase().includes(q) ||
      p.locality?.toLowerCase().includes(q)
    const matchStatus = status === 'all' || p.project_status?.toLowerCase() === status
    return matchSearch && matchStatus
  })

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Chennai real estate</span>
          <h1 className={styles.h1}>Premium <em>Projects</em></h1>
          <p className={styles.sub}>
            {total.toLocaleString('en-IN')} residential developments by Chennai's top builders
          </p>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>{total}</span>
            <span className={styles.heroStatLbl}>Projects</span>
          </div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>
              {projects.filter(p => p.project_status?.toLowerCase() === 'ready to move').length}
            </span>
            <span className={styles.heroStatLbl}>Ready to move</span>
          </div>
          <div className={styles.heroStatDiv} />
          <div className={styles.heroStat}>
            <span className={styles.heroStatVal}>
              {projects.filter(p => p.project_status?.toLowerCase() === 'under construction').length}
            </span>
            <span className={styles.heroStatLbl}>Under construction</span>
          </div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIco} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by project, builder or locality…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}><X size={12} /></button>
          )}
        </div>

        <div className={styles.statusTabs}>
          {STATUS_OPTS.map(s => (
            <button
              key={s}
              className={`${styles.statusTab} ${status === s ? styles.statusTabActive : ''}`}
              onClick={() => setStatus(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <span className={styles.resultCount}>
          <strong>{filtered.length}</strong> shown
        </span>
      </div>

      {/* ── Loading skeletons ── */}
      {loading && (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`${styles.skelCard} skeleton-box`} style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      )}

      {error && <div className={styles.errBox}>⚠ {error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.empty}>
          <Building2 size={48} strokeWidth={1} className={styles.emptyIcon} />
          <h3>No projects found</h3>
          <p>Try changing your search or status filter</p>
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((p, i) => (
            <ProjectCard key={p.project_id} project={p} index={i} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => { setPage(n => Math.max(1, n - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        onNext={() => { setPage(n => Math.min(totalPages, n + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
      />
    </div>
  )
}

function ProjectCard({ project: p, index }) {
  const st = STATUS_META[p.project_status?.toLowerCase()] || { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' }
  const imgUrl = `https://images.unsplash.com/${PROJECT_IMGS[index % PROJECT_IMGS.length]}?auto=format&fit=crop&w=800&q=75`

  const priceRange = p.price_min && p.price_max && p.price_max > 10
    ? `₹${p.price_min.toFixed(1)} L – ₹${p.price_max.toFixed(1)} L`
    : null

  const cleanAmenities = (p.amenities || []).filter(a => typeof a === 'string' && a.length < 30)

  return (
    <Link
      to={`/projects/${p.project_id}`}
      className={styles.card}
      style={{ animationDelay: `${Math.min(index, 7) * 55}ms` }}
      aria-label={`View ${p.apartment_name}`}
    >
      {/* ── Cover image ── */}
      <div className={styles.cardImg}>
        <img src={imgUrl} alt={p.apartment_name} className={styles.cardImgEl} loading="lazy" />

        {/* Status badge on image */}
        <div className={styles.imgBadgeRow}>
          <span className={styles.statusPill} style={{ background: st.bg, color: st.color }}>
            <span className={styles.statusDot} style={{ background: st.dot }} />
            {p.project_status}
          </span>
          {p.rera_number && (
            <span className={styles.reraPill}><CheckCircle2 size={10} />RERA</span>
          )}
        </div>

        {/* View overlay */}
        <span className={styles.viewOverlay}><ArrowUpRight size={14} />View Project</span>
      </div>

      {/* ── Card body ── */}
      <div className={styles.cardBody}>
        {/* Name + developer */}
        <div className={styles.cardHeader}>
          <h3 className={styles.cardName}>{p.apartment_name}</h3>
          <span className={styles.cardDev}>by {p.developer_name}</span>
        </div>

        {/* Location */}
        <p className={styles.cardLoc}>
          <MapPin size={11} strokeWidth={2} />
          {p.locality ? p.locality.charAt(0).toUpperCase() + p.locality.slice(1) : '—'}, Chennai
        </p>

        {/* Key specs row */}
        <div className={styles.specsRow}>
          {p.total_units > 0 && (
            <div className={styles.spec}>
              <Layers size={13} strokeWidth={1.8} />
              <span>{p.total_units.toLocaleString()}</span>
              <span className={styles.specLbl}>units</span>
            </div>
          )}
          {p.total_towers > 0 && (
            <div className={styles.spec}>
              <Building2 size={13} strokeWidth={1.8} />
              <span>{p.total_towers}</span>
              <span className={styles.specLbl}>towers</span>
            </div>
          )}
          {p.total_floors > 0 && (
            <div className={styles.spec}>
              <Layers size={13} strokeWidth={1.8} />
              <span>{p.total_floors}</span>
              <span className={styles.specLbl}>floors</span>
            </div>
          )}
          {p.min_area_sqft > 0 && (
            <div className={styles.spec}>
              <TrendingUp size={13} strokeWidth={1.8} />
              <span>{p.min_area_sqft}–{p.max_area_sqft}</span>
              <span className={styles.specLbl}>ft²</span>
            </div>
          )}
        </div>

        {/* Price + listings footer */}
        <div className={styles.cardFooter}>
          <div className={styles.priceBlock}>
            {priceRange
              ? <span className={styles.price}>{priceRange}</span>
              : <span className={styles.priceNA}>Price on request</span>
            }
          </div>
          <span className={styles.listingsCount}>
            <Home size={11} />
            {p.total_listings} listing{p.total_listings !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Amenities */}
        {cleanAmenities.length > 0 && (
          <div className={styles.amenities}>
            {cleanAmenities.slice(0, 4).map((a, i) => (
              <span key={i} className={styles.amenity}>{a}</span>
            ))}
            {cleanAmenities.length > 4 && (
              <span className={styles.amenityMore}>+{cleanAmenities.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
