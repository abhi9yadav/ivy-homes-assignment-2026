import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import styles from './LoginPage.module.css'

const DEMO = [
  { email: 'demo1@ivy.homes', label: 'Demo 1', initials: 'D1' },
  { email: 'demo2@ivy.homes', label: 'Demo 2', initials: 'D2' },
  { email: 'demo3@ivy.homes', label: 'Demo 3', initials: 'D3' },
]
const PWD = '0c77c313b3'

const STATS = [
  { value: '3,759', label: 'Active listings' },
  { value: '422',   label: 'Projects' },
  { value: '10',    label: 'Localities' },
]

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [focused,  setFocused]  = useState('')

  if (isAuthenticated) { navigate('/listings', { replace: true }); return null }

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/listings', { replace: true }) }
    catch (err) { setError(err.message || 'Invalid credentials. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.page}>
      {/* ── Left panel ── */}
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.brand}>
            <div className={styles.logoMark}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:22,height:22}}>
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
              </svg>
            </div>
            <span className={styles.brandName}>Ivy Homes</span>
          </div>

          <div className={styles.leftHeadline}>
            <h1 className={styles.leftH1}>
              Your next home<br />
              <em>starts here.</em>
            </h1>
            <p className={styles.leftSub}>
              Browse thousands of verified properties across Chennai's most sought-after neighbourhoods.
            </p>
          </div>

          <div className={styles.statsRow}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statItem}>
                <span className={styles.statVal}>{s.value}</span>
                <span className={styles.statLbl}>{s.label}</span>
              </div>
            ))}
          </div>

          <ul className={styles.features}>
            {['Real-time property data', 'Verified listings only', 'All Chennai localities'].map(f => (
              <li key={f} className={styles.feature}>
                <CheckCircle2 size={15} className={styles.featureIcon} />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* decorative circles */}
        <div className={styles.deco1} />
        <div className={styles.deco2} />
        <div className={styles.deco3} />
      </div>

      {/* ── Right panel ── */}
      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Sign in</h2>
          <p className={styles.cardSub}>Welcome back — enter your details below.</p>

          {/* Demo quick-fill */}
          <div className={styles.demoBox}>
            <span className={styles.demoLabel}>Quick demo access</span>
            <div className={styles.demoBtns}>
              {DEMO.map(d => (
                <button
                  key={d.email}
                  type="button"
                  className={`${styles.demoBtn} ${email === d.email ? styles.demoBtnOn : ''}`}
                  onClick={() => { setEmail(d.email); setPassword(PWD); setError('') }}
                >
                  <span className={styles.demoAv}>{d.initials}</span>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sep}><span>or enter manually</span></div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={`${styles.field} ${focused === 'e' ? styles.fieldOn : ''}`}>
              <label className={styles.label} htmlFor="email">Email address</label>
              <div className={styles.inputWrap}>
                <Mail size={15} className={styles.inputIcon} />
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('e')}
                  onBlur={() => setFocused('')}
                  placeholder="you@ivy.homes"
                  required autoComplete="email"
                />
              </div>
            </div>

            <div className={`${styles.field} ${focused === 'p' ? styles.fieldOn : ''}`}>
              <label className={styles.label} htmlFor="pass">Password</label>
              <div className={styles.inputWrap}>
                <Lock size={15} className={styles.inputIcon} />
                <input
                  id="pass"
                  className={styles.input}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('p')}
                  onBlur={() => setFocused('')}
                  placeholder="••••••••••"
                  required autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className={styles.errorMsg} role="alert">
                <span className={styles.errorDot} />
                {error}
              </div>
            )}

            <button className={styles.submit} type="submit" disabled={loading}>
              {loading
                ? <span className={styles.spinner} aria-hidden />
                : <><span>Sign in</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className={styles.hint}>
            Demo password: <code className={styles.code}>{PWD}</code>
          </p>
        </div>
      </div>
    </div>
  )
}
