'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Loader2, Eye, EyeOff } from 'lucide-react'

const STATS = [
  { value: '10k+', label: 'Learners enrolled' },
  { value: '200+', label: 'Courses available' },
  { value: '95%', label: 'Completion rate' },
]

const STEPS = [
  { icon: '🎯', title: 'Take a quick assessment', desc: 'We gauge your current knowledge in minutes' },
  { icon: '🗺️', title: 'Get your roadmap', desc: 'AI crafts a personalized path just for you' },
  { icon: '🚀', title: 'Start learning', desc: 'Follow modules built around your level' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [typedText, setTypedText] = useState('')

  const headline = 'Your journey starts here.'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTypedText(headline.slice(0, i + 1))
      i++
      if (i >= headline.length) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveStep((p) => (p + 1) % STEPS.length), 2800)
    return () => clearInterval(t)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be 8+ characters'); return }

    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { toast.error(data.error || 'Registration failed'); return }

    toast.success('Account created! Please sign in.')
    router.push('/auth/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111110', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --accent: #b5cc2e;
          --bg: #111110;
          --border: rgba(255,255,255,0.08);
          --border-focus: rgba(255,255,255,0.22);
          --muted: #6b6b67;
          --text: #e2e2df;
        }

        .auth-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
        }

        /* ── Right hero ── */
        .hero-panel {
          background: #0d0d0c;
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
          position: relative; overflow: hidden;
        }
        .hero-orb {
          position: absolute; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
        }
        .hero-orb-1 {
          width: 400px; height: 400px;
          background: rgba(181,204,46,0.11);
          top: -80px; right: -60px;
          animation: drift1 9s ease-in-out infinite alternate;
        }
        .hero-orb-2 {
          width: 260px; height: 260px;
          background: rgba(181,204,46,0.07);
          bottom: -50px; left: -30px;
          animation: drift2 11s ease-in-out infinite alternate;
        }
        @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,40px) scale(1.1); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-20px,30px) scale(1.08); } }

        .hero-tag {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(181,204,46,0.1);
          border: 1px solid rgba(181,204,46,0.25);
          border-radius: 999px; padding: 5px 14px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.06em;
          color: var(--accent); text-transform: uppercase;
          width: fit-content; margin-bottom: 32px;
        }

        .hero-headline {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(28px, 3.2vw, 42px);
          font-weight: 800; color: var(--text);
          letter-spacing: -1px; line-height: 1.15;
          margin-bottom: 16px; min-height: 2.4em;
        }
        .hero-cursor {
          display: inline-block; width: 3px; height: 1em;
          background: var(--accent); margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }

        .hero-sub {
          font-size: 15px; font-weight: 300; color: var(--muted);
          line-height: 1.6; max-width: 380px; margin-bottom: 40px;
        }

        /* Stats row */
        .stats-row {
          display: flex; gap: 28px; margin-bottom: 44px;
        }
        .stat-item { }
        .stat-value {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 26px; font-weight: 800; color: var(--accent);
          letter-spacing: -0.5px;
        }
        .stat-label { font-size: 11px; color: var(--muted); font-weight: 300; margin-top: 2px; }

        /* Steps */
        .steps-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--muted); margin-bottom: 14px;
        }
        .step-cards { display: flex; flex-direction: column; gap: 10px; }
        .step-card {
          display: flex; align-items: center; gap: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 12px; padding: 14px 16px;
          transition: all 0.4s ease;
          opacity: 0.4; transform: translateX(-6px);
        }
        .step-card.active {
          opacity: 1;
          border-color: rgba(181,204,46,0.3);
          background: rgba(181,204,46,0.05);
          transform: translateX(0);
        }
        .step-num {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 500; color: var(--muted);
          flex-shrink: 0; transition: all 0.4s;
        }
        .step-card.active .step-num {
          background: rgba(181,204,46,0.15);
          border-color: rgba(181,204,46,0.4);
          color: var(--accent);
        }
        .step-icon { font-size: 18px; flex-shrink: 0; }
        .step-title { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 2px; }
        .step-desc { font-size: 11px; color: var(--muted); font-weight: 300; }

        .hero-dots { display: flex; gap: 6px; margin-top: 24px; }
        .hero-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); transition: all 0.3s; }
        .hero-dot.active { background: var(--accent); width: 20px; border-radius: 3px; }

        /* ── Left form ── */
        .form-panel {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px 48px;
        }
        .login-card { width: 100%; max-width: 380px; }

        .login-logo { text-align: center; margin-bottom: 36px; }
        .login-logo-name {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 24px; font-weight: 800;
          color: var(--text); letter-spacing: -0.5px;
          text-decoration: none; display: inline-block; margin-bottom: 8px;
        }
        .login-logo-sub { font-size: 13px; color: var(--muted); font-weight: 300; }

        .login-box {
          background: #161615; border: 1px solid var(--border);
          border-radius: 16px; padding: 32px 28px;
        }
        .login-heading {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 22px; font-weight: 800;
          color: var(--text); letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .login-subheading { font-size: 13px; color: var(--muted); font-weight: 300; margin-bottom: 28px; }

        .field { margin-bottom: 18px; }
        .field-label {
          display: block; font-size: 12px; font-weight: 500;
          color: rgba(226,226,223,0.6); letter-spacing: 0.02em; margin-bottom: 8px;
        }
        .field-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid var(--border); border-radius: 9px;
          padding: 11px 14px; font-size: 14px; color: var(--text);
          font-family: 'Inter', sans-serif; outline: none;
          transition: border-color 0.15s; -webkit-appearance: none;
        }
        .field-input::placeholder { color: var(--muted); }
        .field-input:focus { border-color: var(--border-focus); }

        .pw-wrap { position: relative; }
        .pw-wrap .field-input { padding-right: 44px; }
        .pw-toggle {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--muted); padding: 0;
          display: flex; align-items: center; transition: color 0.15s;
        }
        .pw-toggle:hover { color: var(--text); }

        .submit-btn {
          width: 100%; background: var(--text);
          color: #111; border: none; border-radius: 9px;
          padding: 12px 0; font-size: 14px; font-weight: 500;
          font-family: 'Inter', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s; margin-top: 8px;
        }
        .submit-btn:hover:not(:disabled) { background: #fff; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-footer { text-align: center; margin-top: 24px; }
        .login-footer p { font-size: 13px; color: var(--muted); }
        .login-footer a { color: var(--accent); text-decoration: none; font-weight: 500; transition: opacity 0.15s; }
        .login-footer a:hover { opacity: 0.8; }

        .back-link {
          display: block; text-align: center; margin-top: 16px;
          font-size: 12px; color: rgba(107,107,103,0.6);
          text-decoration: none; transition: color 0.15s;
        }
        .back-link:hover { color: var(--muted); }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .auth-grid { grid-template-columns: 1fr; }
          .hero-panel { display: none; }
          .form-panel { padding: 40px 24px; }
        }
      `}</style>

      <div className="auth-grid">
        {/* ── Right: Hero panel ── */}
        <div className="hero-panel">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="hero-tag">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Free to get started
            </div>

            <h2 className="hero-headline">
              {typedText}
              <span className="hero-cursor" />
            </h2>

            <p className="hero-sub">
              Join thousands of learners who levelled up with AI-crafted paths tailored to their exact skill level.
            </p>

            <div className="stats-row">
              {STATS.map((s, i) => (
                <div key={i} className="stat-item">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="steps-label">How it works</div>
            <div className="step-cards">
              {STEPS.map((s, i) => (
                <div key={i} className={`step-card${i === activeStep ? ' active' : ''}`}>
                  <div className="step-num">{i + 1}</div>
                  <div className="step-icon">{s.icon}</div>
                  <div>
                    <div className="step-title">{s.title}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-dots">
              {STEPS.map((_, i) => (
                <div key={i} className={`hero-dot${i === activeStep ? ' active' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Left: Form panel ── */}
        <div className="form-panel">
          <div className="login-card">
            <div className="login-logo">
              <Link href="/" className="login-logo-name">DevPath AI</Link>
              <p className="login-logo-sub">Create your free account</p>
            </div>

            <div className="login-box">
              <h1 className="login-heading">Get started</h1>
              <p className="login-subheading">Fill in the details below to create your account</p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">Full Name</label>
                  <input
                    type="text" className="field-input"
                    placeholder="Jane Smith" value={name}
                    onChange={(e) => setName(e.target.value)} required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Email</label>
                  <input
                    type="email" className="field-input"
                    placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Password</label>
                  <div className="pw-wrap">
                    <input
                      type={showPw ? 'text' : 'password'} className="field-input"
                      placeholder="Min. 8 characters" value={password}
                      onChange={(e) => setPassword(e.target.value)} required
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading && <Loader2 size={15} className="spin" />}
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </div>

            <div className="login-footer">
              <p>
                Already have an account?{' '}
                <Link href="/auth/login">Sign in</Link>
              </p>
            </div>
            <Link href="/" className="back-link">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
