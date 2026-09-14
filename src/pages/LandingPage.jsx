import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Home, TrendingUp, MapPin, Shield, Sparkles,
  ArrowRight, Check, Star, Users, Building2, Award,
  ChevronRight, Play, Heart, Filter, Zap
} from 'lucide-react'
import styles from './LandingPage.module.css'

/* ── Animated counter hook ── */
function useCounter(end, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!startCounting) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, startCounting])
  return count
}

/* ══════════════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statsVisible, setStatsVisible] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const properties = useCounter(3759, 2000, statsVisible)
  const projects = useCounter(250, 2000, statsVisible)
  const customers = useCounter(12000, 2000, statsVisible)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    const el = document.getElementById('stats-section')
    if (el) observer.observe(el)
    return () => { if (el) observer.unobserve(el) }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(i => (i + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const features = [
    { icon: Search, title: 'Smart Search', desc: 'Find your dream home with AI-powered filters and instant results', color: '#1a6b4a' },
    { icon: MapPin, title: 'Interactive Maps', desc: 'Explore properties on dynamic maps with real-time location data', color: '#2563eb' },
    { icon: Shield, title: 'Verified Listings', desc: 'All properties are verified by our team for authenticity', color: '#7c3aed' },
    { icon: TrendingUp, title: 'Price Analytics', desc: 'Get insights on market trends and property value predictions', color: '#dc2626' },
    { icon: Heart, title: 'Save Favorites', desc: 'Bookmark properties and get alerts when prices change', color: '#ec4899' },
    { icon: Zap, title: 'Instant Alerts', desc: 'Never miss out — get notified when new properties match your criteria', color: '#f59e0b' },
  ]

  const steps = [
    { num: '01', title: 'Search & Filter', desc: 'Use advanced filters to narrow down properties by location, price, BHK, and more', icon: Filter },
    { num: '02', title: 'Explore Listings', desc: 'Browse detailed property pages with photos, specs, maps, and pricing', icon: Building2 },
    { num: '03', title: 'Save Favorites', desc: 'Create a personalized shortlist of properties you love', icon: Heart },
    { num: '04', title: 'Connect & Visit', desc: 'Contact verified agents and schedule property visits easily', icon: Users },
  ]

  const testimonials = [
    { name: 'Priya Sharma', role: 'Homebuyer', city: 'Chennai', text: 'Found my dream 3BHK in Adyar within a week! The map view and filters made it so easy to compare properties.', rating: 5, img: 'https://i.pravatar.cc/150?img=1' },
    { name: 'Rajesh Kumar', role: 'Investor', city: 'Chennai', text: 'Best real estate platform in Chennai. The price analytics helped me make an informed investment decision.', rating: 5, img: 'https://i.pravatar.cc/150?img=13' },
    { name: 'Anita Desai', role: 'First-time Buyer', city: 'Chennai', text: 'The verified listings gave me confidence. No fake properties or hidden fees. Highly recommend!', rating: 5, img: 'https://i.pravatar.cc/150?img=5' },
  ]

  return (
    <div className={styles.page}>

      {/* ══════════════════════════════════════
          SECTION 1: HERO
      ══════════════════════════════════════ */}
      <section className={styles.hero}>
        {/* Hero background image */}
        <div className={styles.heroImageBg}>
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85" 
            alt="Luxury property"
            className={styles.heroBgImg}
          />
        </div>
        <div className={styles.heroOverlay} />
        
        {/* Animated background grid */}
        <div className={styles.heroGrid}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={styles.gridCell} style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>3,750+ Premium Properties</span>
          </div>

          <h1 className={styles.heroTitle}>
            Find Your Dream Home in <span className={styles.highlight}>Chennai</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Discover verified properties, explore neighborhoods on interactive maps,
            and connect with trusted developers — all in one place.
          </p>

          {/* Search bar */}
          <div className={styles.heroSearch}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Search by locality, project, or builder..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <Link to={`/listings?q=${searchQuery}`} className={styles.searchBtn}>
              Search <ArrowRight size={16} />
            </Link>
          </div>

          {/* Quick filters */}
          <div className={styles.quickFilters}>
            <span className={styles.filterLabel}>Popular:</span>
            {['Adyar', 'Velachery', 'Porur', 'T Nagar'].map(loc => (
              <Link key={loc} to={`/listings?locality=${loc.toLowerCase()}`} className={styles.filterChip}>
                {loc}
              </Link>
            ))}
          </div>
        </div>

        {/* Floating cards */}
        <div className={styles.floatingCards}>
          <div className={`${styles.floatCard} ${styles.floatCard1}`}>
            <div className={styles.floatIcon} style={{ background: '#dcfce7' }}>
              <Home size={20} color="#166534" />
            </div>
            <div>
              <p className={styles.floatLabel}>New Listing</p>
              <p className={styles.floatValue}>₹1.2 Cr</p>
            </div>
          </div>

          <div className={`${styles.floatCard} ${styles.floatCard2}`}>
            <div className={styles.floatIcon} style={{ background: '#dbeafe' }}>
              <TrendingUp size={20} color="#1e40af" />
            </div>
            <div>
              <p className={styles.floatLabel}>Avg. Price</p>
              <p className={styles.floatValue}>₹8,500/ft²</p>
            </div>
          </div>

          <div className={`${styles.floatCard} ${styles.floatCard3}`}>
            <div className={styles.floatIcon} style={{ background: '#fef3c7' }}>
              <MapPin size={20} color="#92400e" />
            </div>
            <div>
              <p className={styles.floatLabel}>Prime Area</p>
              <p className={styles.floatValue}>Adyar</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollDot} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2: STATS
      ══════════════════════════════════════ */}
      <section className={styles.stats} id="stats-section">
        <div className={styles.container}>
          <div className={styles.statGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#166534' }}>
                <Building2 size={28} />
              </div>
              <h3 className={styles.statNumber}>{properties.toLocaleString('en-IN')}+</h3>
              <p className={styles.statLabel}>Verified Properties</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#dbeafe', color: '#1e40af' }}>
                <Home size={28} />
              </div>
              <h3 className={styles.statNumber}>{projects}+</h3>
              <p className={styles.statLabel}>Premium Projects</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#92400e' }}>
                <Users size={28} />
              </div>
              <h3 className={styles.statNumber}>{(customers / 1000).toFixed(1)}K+</h3>
              <p className={styles.statLabel}>Happy Customers</p>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#f3e8ff', color: '#6b21a8' }}>
                <Award size={28} />
              </div>
              <h3 className={styles.statNumber}>4.8★</h3>
              <p className={styles.statLabel}>Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3: FEATURES
      ══════════════════════════════════════ */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Features</span>
            <h2 className={styles.sectionTitle}>Why Choose Ivy Homes?</h2>
            <p className={styles.sectionSubtitle}>
              Everything you need to find, compare, and secure your perfect property in Chennai
            </p>
          </div>

          <div className={styles.featureGrid}>
            {features.map((f, i) => (
              <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.featureIcon} style={{ background: `${f.color}15`, color: f.color }}>
                  <f.icon size={24} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3.5: PROPERTY SHOWCASE
      ══════════════════════════════════════ */}
      <section className={styles.showcase}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Gallery</span>
            <h2 className={styles.sectionTitle}>Featured Properties</h2>
            <p className={styles.sectionSubtitle}>
              Handpicked premium properties from our exclusive collection
            </p>
          </div>

          <div className={styles.showcaseGrid}>
            {/* Large featured card */}
            <div className={`${styles.showcaseCard} ${styles.showcaseLarge}`}>
              <img 
                src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80" 
                alt="Luxury Villa"
                className={styles.showcaseImg}
              />
              <div className={styles.showcaseOverlay}>
                <div className={styles.showcaseContent}>
                  <span className={styles.showcaseType}>Luxury Villa</span>
                  <h3 className={styles.showcaseTitle}>Modern 4 BHK Villa</h3>
                  <p className={styles.showcaseLocation}><MapPin size={14} /> Adyar, Chennai</p>
                  <div className={styles.showcasePrice}>₹3.5 Cr</div>
                </div>
              </div>
            </div>

            {/* Grid of smaller cards */}
            <div className={styles.showcaseCard}>
              <img 
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80" 
                alt="Apartment"
                className={styles.showcaseImg}
              />
              <div className={styles.showcaseOverlay}>
                <div className={styles.showcaseContent}>
                  <span className={styles.showcaseType}>Apartment</span>
                  <h3 className={styles.showcaseTitle}>3 BHK Premium</h3>
                  <p className={styles.showcaseLocation}><MapPin size={14} /> Velachery</p>
                  <div className={styles.showcasePrice}>₹1.2 Cr</div>
                </div>
              </div>
            </div>

            <div className={styles.showcaseCard}>
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" 
                alt="Penthouse"
                className={styles.showcaseImg}
              />
              <div className={styles.showcaseOverlay}>
                <div className={styles.showcaseContent}>
                  <span className={styles.showcaseType}>Penthouse</span>
                  <h3 className={styles.showcaseTitle}>Sky Villa 5 BHK</h3>
                  <p className={styles.showcaseLocation}><MapPin size={14} /> T Nagar</p>
                  <div className={styles.showcasePrice}>₹5.8 Cr</div>
                </div>
              </div>
            </div>

            <div className={styles.showcaseCard}>
              <img 
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80" 
                alt="Villa"
                className={styles.showcaseImg}
              />
              <div className={styles.showcaseOverlay}>
                <div className={styles.showcaseContent}>
                  <span className={styles.showcaseType}>Villa</span>
                  <h3 className={styles.showcaseTitle}>Garden Villa 3 BHK</h3>
                  <p className={styles.showcaseLocation}><MapPin size={14} /> Porur</p>
                  <div className={styles.showcasePrice}>₹2.1 Cr</div>
                </div>
              </div>
            </div>

            <div className={styles.showcaseCard}>
              <img 
                src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=600&q=80" 
                alt="Apartment"
                className={styles.showcaseImg}
              />
              <div className={styles.showcaseOverlay}>
                <div className={styles.showcaseContent}>
                  <span className={styles.showcaseType}>Apartment</span>
                  <h3 className={styles.showcaseTitle}>2 BHK Cozy</h3>
                  <p className={styles.showcaseLocation}><MapPin size={14} /> Anna Nagar</p>
                  <div className={styles.showcasePrice}>₹85 L</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/listings" className={styles.showcaseBtn}>
              View All Properties <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4: HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Process</span>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>Four simple steps to your dream home</p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((s, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNumber}>{s.num}</div>
                <div className={styles.stepIconWrap}>
                  <s.icon size={32} className={styles.stepIcon} />
                </div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
                {i < steps.length - 1 && <ChevronRight className={styles.stepArrow} size={24} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5: TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>Reviews</span>
            <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          </div>

          <div className={styles.testimonialSlider}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`${styles.testimonialCard} ${i === activeTestimonial ? styles.testimonialActive : ''}`}
              >
                <div className={styles.testimonialStars}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <img src={t.img} alt={t.name} className={styles.testimonialImg} />
                  <div>
                    <p className={styles.testimonialName}>{t.name}</p>
                    <p className={styles.testimonialRole}>{t.role} • {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className={styles.testimonialDots}>
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === activeTestimonial ? styles.dotActive : ''}`}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6: CTA
      ══════════════════════════════════════ */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Find Your Perfect Home?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of happy homeowners who found their dream property with Ivy Homes
          </p>
          <div className={styles.ctaButtons}>
            <Link to="/listings" className={styles.ctaPrimary}>
              Browse Properties <ArrowRight size={18} />
            </Link>
            <Link to="/projects" className={styles.ctaSecondary}>
              View Projects
            </Link>
          </div>

          <div className={styles.ctaFeatures}>
            <div className={styles.ctaFeature}>
              <Check size={18} />
              <span>No hidden charges</span>
            </div>
            <div className={styles.ctaFeature}>
              <Check size={18} />
              <span>100% verified listings</span>
            </div>
            <div className={styles.ctaFeature}>
              <Check size={18} />
              <span>Free property consultation</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
