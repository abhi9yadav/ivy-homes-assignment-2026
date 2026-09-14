import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.css'

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  if (!totalPages || totalPages <= 1) return null

  // Build visible page numbers
  const pages = []
  const delta = 2
  const left  = Math.max(1, page - delta)
  const right = Math.min(totalPages, page + delta)
  for (let i = left; i <= right; i++) pages.push(i)

  return (
    <nav className={styles.wrap} aria-label="Pagination">
      <button
        className={styles.btn}
        onClick={onPrev}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} strokeWidth={2} />
      </button>

      <div className={styles.pages}>
        {left > 1 && (
          <>
            <button className={styles.pageBtn} onClick={() => onPrev && onPrev(1)}>1</button>
            {left > 2 && <span className={styles.ellipsis}>…</span>}
          </>
        )}
        {pages.map(p => (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => {
              if (p < page) { for (let i = 0; i < page - p; i++) onPrev() }
              if (p > page) { for (let i = 0; i < p - page; i++) onNext() }
            }}
          >
            {p}
          </button>
        ))}
        {right < totalPages && (
          <>
            {right < totalPages - 1 && <span className={styles.ellipsis}>…</span>}
            <button className={styles.pageBtn} onClick={() => { for (let i = 0; i < totalPages - page; i++) onNext() }}>{totalPages}</button>
          </>
        )}
      </div>

      <button
        className={styles.btn}
        onClick={onNext}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </nav>
  )
}
