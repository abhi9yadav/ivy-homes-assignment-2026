import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { useFavorites } from '../FavoritesContext.jsx'
import {
  Home, Building2, Heart, LogOut, ChevronDown,
  Search, X, Menu, Key
} from 'lucide-react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout }   = useAuth()
  const { count }          = useFavorites()
  const navigate           = useNavigate()
  const { pathname }       = useLocation()
  const [menuOpen, setMenu]      = useState(false)
  const [mobileOpen, setMobile]  = useState(false)
  const [search, setSearch]      = useState('')
  const dropRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) { navigate(`/listings?q=${encodeURIComponent(search.trim())}`); setSearch('') }
  }

  function handleLogout() { logout(); navigate('/login'); setMenu(false) }

  const initials = user?.email?.[0]?.toUpperCase() ?? '?'

  const navLinks = [
    { to: '/listings',  label: 'Buy',      icon: Home },
    { to: '/rentals',   label: 'Rent',     icon: Key },
    { to: '/projects',  label: 'Projects', icon: Building2 },
    { to: '/favorites', label: 'Saved',    icon: Heart, badge: count },
  ]

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.inner}>

          {/* Brand */}
          <Link to="/listings" className={styles.brand}>
            <div className={styles.logoMark}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
              </svg>
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>Ivy Homes</span>
              <span className={styles.brandCity}>Chennai</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className={styles.links}>
            {navLinks.map(({ to, label, icon: Icon, badge }) => (
              <Link
                key={to}
                to={to}
                className={`${styles.link} ${pathname === to ? styles.linkActive : ''}`}
              >
                <Icon size={15} strokeWidth={1.8} />
                <span>{label}</span>
                {badge > 0 && <span className={styles.badge}>{badge}</span>}
              </Link>
            ))}
          </div>

          {/* Search */}
          <form className={styles.searchForm} onSubmit={handleSearch} role="search">
            <Search size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search properties…"
              aria-label="Search properties"
            />
            {search && (
              <button type="button" className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </form>

          {/* User menu */}
          <div className={styles.userWrap} ref={dropRef}>
            <button
              className={styles.userBtn}
              onClick={() => setMenu(o => !o)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <div className={styles.avatar}>{initials}</div>
              <span className={styles.userEmail}>{user?.email}</span>
              <ChevronDown size={13} className={`${styles.chevron} ${menuOpen ? styles.chevronOpen : ''}`} />
            </button>

            {menuOpen && (
              <div className={styles.dropdown} role="menu">
                <div className={styles.dropHeader}>
                  <div className={styles.dropAvatar}>{initials}</div>
                  <div>
                    <p className={styles.dropEmail}>{user?.email}</p>
                    <p className={styles.dropRole}>Demo Account</p>
                  </div>
                </div>
                <div className={styles.dropDivider} />
                <Link to="/favorites" className={styles.dropItem} onClick={() => setMenu(false)} role="menuitem">
                  <Heart size={14} /> Saved properties
                  {count > 0 && <span className={styles.dropBadge}>{count}</span>}
                </Link>
                <div className={styles.dropDivider} />
                <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout} role="menuitem">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className={styles.hamburger} onClick={() => setMobile(o => !o)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className={styles.mobileNav}>
            {navLinks.map(({ to, label, icon: Icon, badge }) => (
              <Link key={to} to={to} className={styles.mobileLink} onClick={() => setMobile(false)}>
                <Icon size={16} />
                {label}
                {badge > 0 && <span className={styles.badge}>{badge}</span>}
              </Link>
            ))}
            <div className={styles.mobileDivider} />
            <button className={styles.mobileLogout} onClick={handleLogout}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}
