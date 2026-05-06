"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

const FEATURES = [
  { icon: "⚡", title: "AI-Powered Learning", desc: "Personalized paths built around your skill level" },
  { icon: "🗺️", title: "Smart Roadmaps", desc: "Step-by-step guides from beginner to expert" },
  { icon: "🎯", title: "Adaptive Quizzes", desc: "Tests that evolve as your knowledge grows" },
  { icon: "📈", title: "Track Progress", desc: "Visual dashboards to celebrate every milestone" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [typedText, setTypedText] = useState("");

  const headline = "Learn smarter, not harder.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(headline.slice(0, i + 1));
      i++;
      if (i >= headline.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveFeature((p) => (p + 1) % FEATURES.length), 2800);
    return () => clearInterval(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#111110", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --accent: #b5cc2e;
          --bg: #111110;
          --bg2: #191918;
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

        /* ── Right panel (hero) ── */
        .hero-panel {
          background: #0d0d0c;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
          position: relative;
          overflow: hidden;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }
        .hero-orb-1 {
          width: 420px; height: 420px;
          background: rgba(181,204,46,0.12);
          top: -100px; right: -80px;
          animation: drift1 9s ease-in-out infinite alternate;
        }
        .hero-orb-2 {
          width: 280px; height: 280px;
          background: rgba(181,204,46,0.07);
          bottom: -60px; left: -40px;
          animation: drift2 11s ease-in-out infinite alternate;
        }
        @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(30px,40px) scale(1.1); } }
        @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-20px,30px) scale(1.08); } }

        .hero-tag {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(181,204,46,0.1);
          border: 1px solid rgba(181,204,46,0.25);
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.06em;
          color: var(--accent);
          text-transform: uppercase;
          width: fit-content;
          margin-bottom: 32px;
        }

        .hero-headline {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(28px, 3.2vw, 42px);
          font-weight: 800;
          color: var(--text);
          letter-spacing: -1px;
          line-height: 1.15;
          margin-bottom: 16px;
          min-height: 2.4em;
        }

        .hero-cursor {
          display: inline-block;
          width: 3px; height: 1em;
          background: var(--accent);
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

        .hero-sub {
          font-size: 15px; font-weight: 300; color: var(--muted);
          line-height: 1.6; max-width: 380px;
          margin-bottom: 48px;
        }

        .feature-cards {
          display: flex; flex-direction: column; gap: 12px;
        }

        .feature-card {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
          transition: all 0.4s ease;
          opacity: 0.45;
          transform: translateX(-6px);
        }
        .feature-card.active {
          opacity: 1;
          border-color: rgba(181,204,46,0.3);
          background: rgba(181,204,46,0.05);
          transform: translateX(0);
        }
        .feature-icon {
          font-size: 22px; flex-shrink: 0;
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .feature-title {
          font-size: 14px; font-weight: 500; color: var(--text);
          margin-bottom: 3px;
        }
        .feature-desc { font-size: 12px; color: var(--muted); font-weight: 300; }

        .hero-dots {
          display: flex; gap: 6px; margin-top: 32px;
        }
        .hero-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--border);
          transition: all 0.3s;
        }
        .hero-dot.active { background: var(--accent); width: 20px; border-radius: 3px; }

        /* ── Left panel (form) ── */
        .form-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
        }

        .login-card { width: 100%; max-width: 380px; }

        .login-logo { text-align: center; margin-bottom: 40px; }
        .login-logo-name {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 24px; font-weight: 800;
          color: var(--text); letter-spacing: -0.5px;
          text-decoration: none;
          display: inline-block; margin-bottom: 8px;
        }
        .login-logo-sub { font-size: 13px; color: var(--muted); font-weight: 300; }

        .login-box {
          background: #161615;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px 28px;
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

        /* ── Responsive ── */
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

          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="hero-tag">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
              AI-Powered Platform
            </div>

            <h2 className="hero-headline">
              {typedText}
              <span className="hero-cursor" />
            </h2>

            <p className="hero-sub">
              DevPath AI builds a personalized roadmap just for you — adapting to your strengths and closing your gaps automatically.
            </p>

            <div className="feature-cards">
              {FEATURES.map((f, i) => (
                <div key={i} className={`feature-card${i === activeFeature ? " active" : ""}`}>
                  <div className="feature-icon">{f.icon}</div>
                  <div>
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-dots">
              {FEATURES.map((_, i) => (
                <div key={i} className={`hero-dot${i === activeFeature ? " active" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Left: Form panel ── */}
        <div className="form-panel">
          <div className="login-card">
            <div className="login-logo">
              <Link href="/" className="login-logo-name">DevPath AI</Link>
              <p className="login-logo-sub">Sign in to continue learning</p>
            </div>

            <div className="login-box">
              <h1 className="login-heading">Welcome back</h1>
              <p className="login-subheading">Enter your credentials to access your account</p>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="field-label">Email</label>
                  <input
                    type="email"
                    className="field-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Password</label>
                  <div className="pw-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      className="field-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading && <Loader2 size={15} className="spin" />}
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            </div>

            <div className="login-footer">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/auth/register">Create one free</Link>
              </p>
            </div>
            <Link href="/" className="back-link">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
