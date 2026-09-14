import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, BedDouble, Bath, Maximize2, Layers,
  CheckCircle2, MapPin, TrendingUp, ArrowUpRight
} from 'lucide-react'
import { useFavorites } from '../FavoritesContext.jsx'
import styles from './ListingCard.module.css'

/* ─── Image pool — 4 images per card slot ───────────────────────
   Each card gets its own "set" of 4 Unsplash photos derived from
   its base index, so every card shows different images.          */
const BASE_IMAGES = [
  ['photo-1600607687920-4e2a09cf159d', 'photo-1600566753190-17f0baa2a6c3', 'photo-1600585154340-be6161a56a0c', 'photo-1600047509807-ba8f99d2cdde'],
  ['photo-1512917774080-9991f1c4c750', 'photo-1600596542815-ffad4c1539a9', 'photo-1600210492486-724fe5c67fb0', 'photo-1560448204-e02f11c3d0e2'],
  ['photo-1580587771525-78b9dba3b914', 'photo-1545324418-cc1a3fa10c00', 'photo-1558618666-fcd25c85cd64', 'photo-1600607687939-ce8a6c25118c'],
  ['photo-1613977257363-707ba9348227', 'photo-1622015663319-e97e697503ee', 'photo-1486325212027-8081e485255e', 'photo-1600566752355-35792bedcfea'],
]

function getCardImages(index, w = 800) {
  const set = BASE_IMAGES[index % BASE_IMAGES.length]
  return set.map(s => `https://images.unsplash.com/${s}?auto=format&fit=crop&w=${w}&q=80`)
}

/* ─── Hook: rotate images on hover ─────────────────────────────── */
function useImageRotation(imgs, intervalMs = 900) {
  const [current, setCurrent] = useState(0)
  const [prev,    setPrev]    = useState(null)   // for crossfade
  const timerRef = useRef(null)

  const start = useCallback(() => {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setCurrent(i => {
        const next = (i + 1) % imgs.length
        setPrev(i)
        return next
      })
    }, intervalMs)
  }, [imgs.length, intervalMs])

  const stop = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = null
    setCurrent(0)
    setPrev(null)
  }, [])

  return { current, prev, start, stop }
}

/* ─── Helpers ───────────────────────────────────────────────────── */
function fmtPrice(p) {
  if (!p || p <= 0) return null
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`
  if (p >= 100000)   return `₹${(p / 100000).toFixed(1)} L`
  return `₹${p.toLocaleString('en-IN')}`
}
function fmtPpsf(price, area) {
  if (!price || !area || price <= 0 || area <= 0) return null
  return `₹${Math.round(price / area).toLocaleString('en-IN')}/ft²`
}

const FURNISH = {
  'fully-furnished': ['#dcfce7', '#166534'],
  'semi-furnished':  ['#fef3c7', '#92400e'],
  'unfurnished':     ['#f1f5f9', '#475569'],
}

/* ─── Image area (shared by both views) ─────────────────────────── */
function CardImage({ imgs, current, prev, badges, facing, favBtn, viewBtn }) {
  return (
    <>
      {/* Previous image (fades out) */}
      {prev !== null && (
        <img
          key={`prev-${prev}`}
          src={imgs[prev]}
          alt=""
          className={`${styles.img} ${styles.imgFadeOut}`}
          aria-hidden="true"
        />
      )}

      {/* Current image (fades in) */}
      <img
        key={`cur-${current}`}
        src={imgs[current]}
        alt=""
        className={`${styles.img} ${styles.imgFadeIn}`}
      />

      {/* Badges top-left */}
      <div className={styles.imgTop}>{badges}</div>

      {/* Dot indicators — only visible on hover */}
      <div className={styles.dotRow}>
        {imgs.map((_, i) => (
          <span key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`} />
        ))}
      </div>

      {/* Facing pill */}
      {facing && <span className={styles.facingPill}>{facing} facing</span>}

      {/* Hover view button */}
      {viewBtn}

      {/* Fav button */}
      {favBtn}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function ListingCard({ listing, index = 0, compact = false }) {
  const { toggle, isFavorite } = useFavorites()
  const {
    listing_id, apartment_name, locality, bedroom, bathroom, balcony,
    price, carpet_area, furnishing, floor, total_floors,
    is_live, is_verified, posted_by, property_type, posted_at, facing_direction,
  } = listing

  const [fbg, fcolor] = FURNISH[furnishing?.toLowerCase()] || FURNISH['unfurnished']
  const priceStr = fmtPrice(price)
  const ppsfStr  = fmtPpsf(price, carpet_area)
  const fav      = isFavorite(listing_id)

  const daysAgo = posted_at
    ? Math.floor((new Date('2026-09-10') - new Date(posted_at)) / 86400000)
    : null

  const imgs = getCardImages(index)
  const { current, prev, start, stop } = useImageRotation(imgs, 900)

  function handleFav(e) {
    e.preventDefault(); e.stopPropagation()
    toggle(listing)
  }

  /* Shared badge + button elements */
  const badges = (
    <>
      {is_live
        ? <span className={styles.liveBadge}><span className={styles.liveDot} />Live</span>
        : <span className={styles.offBadge}>Off market</span>
      }
      {is_verified && <span className={styles.verBadge}><CheckCircle2 size={10} />Verified</span>}
    </>
  )

  const favBtnEl = (
    <button
      className={`${styles.favBtn} ${fav ? styles.favActive : ''}`}
      onClick={handleFav}
      aria-label={fav ? 'Remove from saved' : 'Save property'}
    >
      <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
    </button>
  )

  /* ─── COMPACT / LIST VIEW ─────────────────────────────────────── */
  if (compact) {
    return (
      <Link
        to={`/listings/${listing_id}`}
        className={`${styles.card} ${styles.compact}`}
        style={{ animationDelay: `${Math.min(index, 7) * 40}ms` }}
        aria-label={`View ${apartment_name}`}
        onMouseEnter={start}
        onMouseLeave={stop}
      >
        {/* Large left image */}
        <div className={styles.imgWrap}>
          <CardImage
            imgs={imgs}
            current={current}
            prev={prev}
            badges={badges}
            facing={facing_direction}
            favBtn={favBtnEl}
            viewBtn={null}
          />
        </div>

        {/* Right content */}
        <div className={styles.body}>
          <div className={styles.compactTop}>
            <div className={styles.priceRow}>
              <span className={styles.price}>{priceStr || 'Price on request'}</span>
              {ppsfStr && <span className={styles.ppsf}><TrendingUp size={11} />{ppsfStr}</span>}
            </div>
            <span className={styles.propTypePill}>{property_type}</span>
          </div>

          <h3 className={styles.name}>{apartment_name}</h3>
          <p className={styles.loc}>
            <MapPin size={12} />
            {locality ? locality.charAt(0).toUpperCase() + locality.slice(1) : '—'}, Chennai
          </p>

          <div className={styles.specs}>
            <span className={styles.spec}><BedDouble size={13} />{bedroom} BHK</span>
            <span className={styles.specDot} />
            <span className={styles.spec}><Bath size={13} />{bathroom} Bath</span>
            {balcony > 0 && <><span className={styles.specDot} /><span className={styles.spec}>{balcony} Balc.</span></>}
            {carpet_area > 0 && <><span className={styles.specDot} /><span className={styles.spec}><Maximize2 size={12} />{carpet_area.toLocaleString()} ft²</span></>}
            {floor != null && <><span className={styles.specDot} /><span className={styles.spec}><Layers size={12} />Floor {floor}/{total_floors}</span></>}
          </div>

          <div className={styles.footer}>
            <span className={styles.furnTag} style={{ background: fbg, color: fcolor }}>
              {furnishing || 'Unfurnished'}
            </span>
            <div className={styles.meta}>
              {daysAgo !== null && (
                <span className={styles.ago}>
                  {daysAgo === 0 ? 'Today' : daysAgo < 30 ? `${daysAgo}d ago` : `${Math.floor(daysAgo / 30)}mo ago`}
                </span>
              )}
              <span className={styles.postedBy}>via {posted_by}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  /* ─── GRID VIEW ──────────────────────────────────────────────── */
  return (
    <Link
      to={`/listings/${listing_id}`}
      className={styles.card}
      style={{ animationDelay: `${Math.min(index, 7) * 50}ms` }}
      aria-label={`View ${apartment_name}`}
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      <div className={styles.imgWrap}>
        <CardImage
          imgs={imgs}
          current={current}
          prev={prev}
          badges={badges}
          facing={facing_direction}
          favBtn={favBtnEl}
          viewBtn={
            <span className={styles.viewBtn}>
              <ArrowUpRight size={14} />View
            </span>
          }
        />
      </div>

      <div className={styles.body}>
        <div className={styles.priceRow}>
          <span className={styles.price}>{priceStr || 'Price on request'}</span>
          {ppsfStr && <span className={styles.ppsf}><TrendingUp size={10} />{ppsfStr}</span>}
        </div>
        <h3 className={styles.name}>{apartment_name}</h3>
        <p className={styles.loc}>
          <MapPin size={11} />
          {locality ? locality.charAt(0).toUpperCase() + locality.slice(1) : '—'}, Chennai
        </p>

        <div className={styles.specs}>
          <span className={styles.spec}><BedDouble size={13} />{bedroom} BHK</span>
          <span className={styles.specDot} />
          <span className={styles.spec}><Bath size={13} />{bathroom} Bath</span>
          {balcony > 0 && <><span className={styles.specDot} /><span className={styles.spec}>{balcony} Balc.</span></>}
          {carpet_area > 0 && <><span className={styles.specDot} /><span className={styles.spec}><Maximize2 size={12} />{carpet_area.toLocaleString()} ft²</span></>}
          {floor != null && <><span className={styles.specDot} /><span className={styles.spec}><Layers size={12} />Flr {floor}/{total_floors}</span></>}
        </div>

        <div className={styles.footer}>
          <span className={styles.furnTag} style={{ background: fbg, color: fcolor }}>
            {furnishing || 'Unfurnished'}
          </span>
          <div className={styles.meta}>
            <span className={styles.propType}>{property_type}</span>
            {daysAgo !== null && (
              <span className={styles.ago}>
                {daysAgo === 0 ? 'Today' : daysAgo < 30 ? `${daysAgo}d ago` : `${Math.floor(daysAgo / 30)}mo ago`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
