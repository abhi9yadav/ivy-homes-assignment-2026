import { useFavorites } from '../FavoritesContext.jsx'
import ListingCard from '../components/ListingCard.jsx'
import { Heart, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './FavoritesPage.module.css'

export default function FavoritesPage() {
  const { list, count } = useFavorites()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}><Heart size={12} /> Saved properties</p>
          <h1 className={styles.h1}>Your saved <em>homes</em></h1>
          <p className={styles.sub}>{count} {count === 1 ? 'property' : 'properties'} saved</p>
        </div>
      </div>

      {count === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyHeart}><Heart size={40} strokeWidth={1.2} /></div>
          <h2>No saved properties yet</h2>
          <p>Click the heart icon on any property to save it here for later.</p>
          <Link to="/" className={styles.browseBtn}>
            Browse listings <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {list.map((l, i) => (
            <ListingCard key={l.listing_id} listing={l} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
