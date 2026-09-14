import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { getRentals, getLocalities } from '../api.js'
import ListingCard from '../components/ListingCard.jsx'
import Pagination from '../components/Pagination.jsx'
import {
  Search, X, LayoutGrid, List, Map, ChevronDown, ArrowUpDown,
  MapPin, RotateCcw, SlidersHorizontal, IndianRupee, Home
} from 'lucide-react'
import styles from './RentalsPage.module.css'

/* Lazy-load the map so Leaflet CSS only loads when map view is opened */
const ListingsMap = lazy(() => import('../components/ListingsMap.jsx'))

const PAGE_SIZE = 20

/* ── Price slider config (for rentals: monthly rent) ──────────────── */
const PRICE_MIN   = 5000         // ₹5k/month
const PRICE_MAX   = 150000       // ₹1.5L/month
const PRICE_STEP  = 5000         // ₹5k steps

const PRICE_PRESETS = [
  { label: 'Any',      min: PRICE_MIN,  max: PRICE_MAX  },
  { label: '< 20k',    min: PRICE_MIN,  max: 20000    },
  { label: '20-40k',   min: 20000,      max: 40000   },
  { label: '40-80k',   min: 40000,      max: 80000   },
  { label: '80k+',     min: 80000,      max: PRICE_MAX  },
]

function fmtPriceShort(v) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)} L`
  if (v >= 1000)   return `₹${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
  return `₹${v}`
}

/* ── Sort / type config ───────────────── */
const PROPERTY_TYPES = ['All', 'Apartment', 'Villa', 'Plot', 'Builder Floor', 'Independent House']
const SORT_OPTIONS = [
  { value: '',           label: 'Relevance'         },
  { value: 'price_asc',  label: 'Rent: Low → High' },
  { value: 'price_desc', label: 'Rent: High → Low' },
  { value: 'area_desc',  label: 'Largest Area'      },
  { value: 'newest',     label: 'Newest First'      },
]

function sortListings(arr, key) {
  const a = [...arr]
  if (key === 'price_asc')  return a.sort((x, y) => (x.price || 0) - (y.price || 0))
  if (key === 'price_desc') return a.sort((x, y) => (y.price || 0) - (x.price || 0))
  if (key === 'area_desc')  return a.sort((x, y) => (y.carpet_area || 0) - (x.carpet_area || 0))
  if (key === 'newest')     return a.sort((x, y) => new Date(y.posted_at || 0) - new Date(x.posted_at || 0))
  return a
}

export default function RentalsPage() {
  const { token } = useAuth()
  const [params]  = useSearchParams()

  const [listings,   setListings]   = useState([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [localities, setLocalities] = useState([])
  const [filters,    setFilters]    = useState({
    locality: '', bedroom: '', live: '', propType: '',
    search:   params.get('q') || '',
    priceMin: PRICE_MIN,
    priceMax: PRICE_MAX,
  })
  const [sort,     setSort]     = useState('')
  const [view,     setView]     = useState('grid')  // 'grid' | 'list' | 'map'
  const [activeMarkerId, setActiveMarkerId] = useState(null)
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef   = useRef(null)

  /* price slider drag state */
  const sliderRef   = useRef(null)
  const dragging    = useRef(null)  // 'min' | 'max' | null

  useEffect(() => {
    getLocalities(token).then(d => setLocalities(d.results || [])).catch(() => {})
  }, [token])

  useEffect(() => {
    function h(e) { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  /* ── Fetch ── */
  const fetchListings = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const data = await getRentals(token, {
        limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE,
        locality: filters.locality,
        bedroom:  filters.bedroom,
      })
      let results = data.results || []
      if (filters.live === 'live')     results = results.filter(l => l.is_live)
      if (filters.live === 'inactive') results = results.filter(l => !l.is_live)
      if (filters.propType && filters.propType !== 'All')
        results = results.filter(l => l.property_type?.toLowerCase() === filters.propType.toLowerCase())
      if (filters.search)
        results = results.filter(l =>
          l.apartment_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          l.locality?.toLowerCase().includes(filters.search.toLowerCase())
        )
      /* price filter — client side */
      const pMin = filters.priceMin
      const pMax = filters.priceMax
      const priceActive = pMin > PRICE_MIN || pMax < PRICE_MAX
      if (priceActive)
        results = results.filter(l => l.price > 0 && l.price >= pMin && l.price <= pMax)

      setListings(sortListings(results, sort))
      setTotal(data.total || 0)
    } catch (e) { setError(e.message) }
    finally     { setLoading(false) }
  }, [token, page, filters, sort])

  useEffect(() => { fetchListings() }, [fetchListings])

  function setF(key, val) { setFilters(f => ({ ...f, [key]: val })); setPage(1) }
  function reset() {
    setFilters({ locality: '', bedroom: '', live: '', propType: '', search: '', priceMin: PRICE_MIN, priceMax: PRICE_MAX })
    setSort(''); setPage(1)
  }

  /* ── Dual range slider logic ── */
  function pctToPrice(pct) {
    const raw = PRICE_MIN + (PRICE_MAX - PRICE_MIN) * pct
    return Math.round(raw / PRICE_STEP) * PRICE_STEP
  }
  function priceToPct(price) {
    return (price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)
  }

  function handleSliderPointerDown(e, thumb) {
    e.preventDefault()
    dragging.current = thumb
    window.addEventListener('pointermove', handleSliderMove)
    window.addEventListener('pointerup', handleSliderUp)
  }
  function handleSliderMove(e) {
    if (!dragging.current || !sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const val  = pctToPrice(pct)
    if (dragging.current === 'min') {
      setFilters(f => ({ ...f, priceMin: Math.min(val, f.priceMax - PRICE_STEP) }))
    } else {
      setFilters(f => ({ ...f, priceMax: Math.max(val, f.priceMin + PRICE_STEP) }))
    }
    setPage(1)
  }
  function handleSliderUp() {
    dragging.current = null
    window.removeEventListener('pointermove', handleSliderMove)
    window.removeEventListener('pointerup', handleSliderUp)
  }

  const leftPct  = priceToPct(filters.priceMin) * 100
  const rightPct = priceToPct(filters.priceMax) * 100
  const priceActive = filters.priceMin > PRICE_MIN || filters.priceMax < PRICE_MAX
  const hasFilters = filters.locality || filters.bedroom || filters.live || filters.propType || filters.search || sort || priceActive

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const sortLabel  = SORT_OPTIONS.find(s => s.value === sort)?.label || 'Sort'

  return (
    <div className={styles.pageRoot}>

      {/* ══════════════════════════════════
          LEFT — sticky filter sidebar
      ══════════════════════════════════ */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>

          <div className={styles.sidebarHead}>
            <span className={styles.sidebarTitle}>
              <SlidersHorizontal size={15} strokeWidth={2} /> Filters
            </span>
            {hasFilters && (
              <button className={styles.resetBtn} onClick={reset}>
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          {/* Search */}
          <div className={styles.filterBlock}>
            <span className={styles.filterLabel}>Search</span>
            <div className={styles.searchWrap}>
              <Search size={13} className={styles.searchIco} />
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Project or locality…"
                value={filters.search}
                onChange={e => setF('search', e.target.value)}
              />
              {filters.search && (
                <button className={styles.searchClear} onClick={() => setF('search', '')}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* ── Budget / Price range ── */}
          <div className={styles.filterBlock}>
            <div className={styles.priceLabelRow}>
              <span className={styles.filterLabel}><IndianRupee size={11} /> Budget</span>
              {priceActive && (
                <button className={styles.priceClear} onClick={() => { setF('priceMin', PRICE_MIN); setF('priceMax', PRICE_MAX) }}>
                  <X size={10} />
                </button>
              )}
            </div>

            {/* Range display */}
            <div className={styles.priceDisplay}>
              <span className={`${styles.priceVal} ${priceActive ? styles.priceValActive : ''}`}>
                {fmtPriceShort(filters.priceMin)}
              </span>
              <span className={styles.priceSep}>–</span>
              <span className={`${styles.priceVal} ${priceActive ? styles.priceValActive : ''}`}>
                {filters.priceMax >= PRICE_MAX ? '₹1.5L+' : fmtPriceShort(filters.priceMax)}
              </span>
            </div>

            {/* Dual-handle slider */}
            <div className={styles.sliderTrackWrap} ref={sliderRef}>
              {/* filled track */}
              <div
                className={styles.sliderFill}
                style={{ left: `${leftPct}%`, width: `${rightPct - leftPct}%` }}
              />
              {/* min thumb */}
              <div
                className={`${styles.sliderThumb} ${styles.sliderThumbMin}`}
                style={{ left: `${leftPct}%` }}
                onPointerDown={e => handleSliderPointerDown(e, 'min')}
                role="slider"
                aria-valuemin={PRICE_MIN}
                aria-valuemax={PRICE_MAX}
                aria-valuenow={filters.priceMin}
                aria-label="Minimum price"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'ArrowRight') setFilters(f => ({ ...f, priceMin: Math.min(f.priceMin + PRICE_STEP, f.priceMax - PRICE_STEP) }))
                  if (e.key === 'ArrowLeft')  setFilters(f => ({ ...f, priceMin: Math.max(f.priceMin - PRICE_STEP, PRICE_MIN) }))
                }}
              />
              {/* max thumb */}
              <div
                className={`${styles.sliderThumb} ${styles.sliderThumbMax}`}
                style={{ left: `${rightPct}%` }}
                onPointerDown={e => handleSliderPointerDown(e, 'max')}
                role="slider"
                aria-valuemin={PRICE_MIN}
                aria-valuemax={PRICE_MAX}
                aria-valuenow={filters.priceMax}
                aria-label="Maximum price"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'ArrowRight') setFilters(f => ({ ...f, priceMax: Math.min(f.priceMax + PRICE_STEP, PRICE_MAX) }))
                  if (e.key === 'ArrowLeft')  setFilters(f => ({ ...f, priceMax: Math.max(f.priceMax - PRICE_STEP, f.priceMin + PRICE_STEP) }))
                }}
              />
            </div>

            {/* Preset chips */}
            <div className={styles.pricePresets}>
              {PRICE_PRESETS.map(p => {
                const isActive = filters.priceMin === p.min && filters.priceMax === p.max
                return (
                  <button
                    key={p.label}
                    className={`${styles.presetChip} ${isActive ? styles.presetChipActive : ''}`}
                    onClick={() => { setFilters(f => ({ ...f, priceMin: p.min, priceMax: p.max })); setPage(1) }}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Locality */}
          <div className={styles.filterBlock}>
            <span className={styles.filterLabel}>Locality</span>
            <div className={styles.localityList}>
              <button
                className={`${styles.localityItem} ${!filters.locality ? styles.localityItemActive : ''}`}
                onClick={() => setF('locality', '')}
              >
                <span>All localities</span>
                <span className={styles.localityCount}>{total || ''}</span>
              </button>
              {localities.map(l => (
                <button
                  key={l.locality}
                  className={`${styles.localityItem} ${filters.locality === l.locality ? styles.localityItemActive : ''}`}
                  onClick={() => setF('locality', filters.locality === l.locality ? '' : l.locality)}
                >
                  <span>{l.locality.charAt(0).toUpperCase() + l.locality.slice(1)}</span>
                  <span className={styles.localityCount}>{l.listing_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BHK */}
          <div className={styles.filterBlock}>
            <span className={styles.filterLabel}>BHK Type</span>
            <div className={styles.chipGrid}>
              {['', '1', '2', '3', '4'].map(n => (
                <button
                  key={n}
                  className={`${styles.chip} ${filters.bedroom === n ? styles.chipActive : ''}`}
                  onClick={() => setF('bedroom', n)}
                >
                  {n === '' ? 'Any' : `${n} BHK`}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className={styles.filterBlock}>
            <span className={styles.filterLabel}>Listing Status</span>
            <div className={styles.chipGrid}>
              {[['', 'All'], ['live', 'Live'], ['inactive', 'Inactive']].map(([v, l]) => (
                <button
                  key={v}
                  className={`${styles.chip} ${filters.live === v ? styles.chipActive : ''}`}
                  onClick={() => setF('live', v)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Property type */}
          <div className={styles.filterBlock}>
            <span className={styles.filterLabel}>Property Type</span>
            <div className={styles.typeList}>
              {PROPERTY_TYPES.map(pt => (
                <button
                  key={pt}
                  className={`${styles.typeItem} ${(filters.propType || 'All') === pt ? styles.typeItemActive : ''}`}
                  onClick={() => setF('propType', pt === 'All' ? '' : pt)}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

        </div>
      </aside>

      {/* ══════════════════════════════════
          RIGHT — content
      ══════════════════════════════════ */}
      <div className={styles.content}>

        {/* Sticky top bar */}
        <div className={styles.topBar}>
          <p className={styles.resultCount}>
            {loading ? 'Loading…' : (
              <><strong>{listings.length}</strong> of {total.toLocaleString('en-IN')} rentals</>
            )}
          </p>

          <div className={styles.topBarRight}>
            <div className={styles.sortWrap} ref={sortRef}>
              <button className={styles.toolBtn} onClick={() => setSortOpen(o => !o)}>
                <ArrowUpDown size={13} />
                <span>{sortLabel}</span>
                <ChevronDown size={11} className={sortOpen ? styles.chevronOpen : ''} />
              </button>
              {sortOpen && (
                <div className={styles.sortMenu}>
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      className={`${styles.sortItem} ${sort === o.value ? styles.sortItemActive : ''}`}
                      onClick={() => { setSort(o.value); setSortOpen(false) }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.viewToggle}>
              <button className={`${styles.viewBtn} ${view === 'grid' ? styles.viewBtnActive : ''}`} onClick={() => setView('grid')} aria-label="Grid view"><LayoutGrid size={15} /></button>
              <button className={`${styles.viewBtn} ${view === 'list' ? styles.viewBtnActive : ''}`} onClick={() => setView('list')} aria-label="List view"><List size={15} /></button>
              <button className={`${styles.viewBtn} ${view === 'map'  ? styles.viewBtnActive : ''}`} onClick={() => setView('map')}  aria-label="Map view"  title="Map view"><Map size={15} /></button>
            </div>
          </div>
        </div>

        {loading && (
          <div className={view === 'list' ? styles.listGrid : styles.cardGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${styles.skelCard} skeleton-box`} />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className={styles.errBox}>
            <span>⚠ {error}</span>
            <button className={styles.retryBtn} onClick={fetchListings}>Retry</button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🏠</span>
            <h3>No rentals found</h3>
            <p>Try broadening your search or adjusting the budget</p>
            <button className={styles.resetBtnLg} onClick={reset}>Clear all filters</button>
          </div>
        )}

        {/* ── MAP VIEW ── */}
        {view === 'map' && (
          <Suspense fallback={<div className={`${styles.skelCard} skeleton-box`} style={{ height: 620 }} />}>
            <ListingsMap
              listings={listings}
              activeId={activeMarkerId}
              onMarkerClick={setActiveMarkerId}
            />
          </Suspense>
        )}

        {/* ── GRID / LIST VIEW ── */}
        {!loading && listings.length > 0 && view !== 'map' && (
          <div className={view === 'list' ? styles.listGrid : styles.cardGrid}>
            {listings.map((l, i) => (
              <ListingCard key={l.listing_id} listing={l} index={i} compact={view === 'list'} />
            ))}
          </div>
        )}

        {view !== 'map' && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            onNext={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          />
        )}
      </div>
    </div>
  )
}
