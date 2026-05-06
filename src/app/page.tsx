import Link from "next/link";

const techLogos = [
  "MongoDB", "JavaScript", "React", "Node.js", "Python",
  "TypeScript", "Next.js", "PostgreSQL", "Docker", "GraphQL",
  "MongoDB", "JavaScript", "React", "Node.js", "Python",
  "TypeScript", "Next.js", "PostgreSQL", "Docker", "GraphQL",
];

const steps = [
  {
    num: "01",
    title: "Take the AI assessment",
    desc: "Answer a smart MCQ test. Claude figures out exactly where you stand — no guessing, no wasted time.",
  },
  {
    num: "02",
    title: "Get your roadmap",
    desc: "A custom 0-to-hero learning path built for your gaps and goals. Nobody gets the same roadmap.",
  },
  {
    num: "03",
    title: "Learn with AI content",
    desc: "Every lesson is generated fresh by Claude. Always relevant, always up to date.",
  },
  {
    num: "04",
    title: "Track your progress",
    desc: "See exactly where you are across every module. Know what's next, always.",
  },
];

const courses = [
  { emoji: "🍃", name: "MongoDB", tag: "Databases & NoSQL" },
  { emoji: "⚡", name: "JavaScript", tag: "Core Language" },
  { emoji: "⚛️", name: "React", tag: "UI Framework" },
];

export default function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#111110",
      color: "#e2e2df",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --accent: #b5cc2e;
          --bg: #111110;
          --bg2: #191918;
          --border: rgba(255,255,255,0.08);
          --muted: #6b6b67;
          --text: #e2e2df;
        }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: center;
          gap: 36px;
          padding: 20px 40px;
          background: rgba(17,17,16,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .nav-logo {
          position: absolute; left: 40px;
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 17px; font-weight: 800;
          color: var(--text); text-decoration: none;
          letter-spacing: -0.4px;
        }
        .nav-link {
          font-size: 13px; color: var(--muted);
          text-decoration: none; transition: color 0.15s;
        }
        .nav-link:hover { color: var(--text); }
        .nav-right {
          position: absolute; right: 40px;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-ghost {
          font-size: 13px; color: var(--muted);
          text-decoration: none; padding: 7px 16px;
          border: 1px solid var(--border); border-radius: 8px;
          transition: all 0.15s;
        }
        .btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.18); }
        .btn-solid {
          font-size: 13px; font-weight: 500; color: #111;
          background: var(--text); text-decoration: none;
          padding: 7px 16px; border-radius: 8px;
          transition: background 0.15s;
        }
        .btn-solid:hover { background: #fff; }

        /* HERO */
        .hero {
          padding: 180px 24px 100px;
          max-width: 720px; margin: 0 auto;
          text-align: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--muted); margin-bottom: 44px;
        }
        .hero-badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent); flex-shrink: 0;
        }
        .hero-h1 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(52px, 9vw, 96px);
          font-weight: 800; line-height: 1.0;
          letter-spacing: -3px; color: #f0f0ee;
          margin-bottom: 28px;
        }
        .hero-h1 .hl {
          background: var(--accent);
          color: #181800;
          padding: 0 10px 4px;
          border-radius: 6px;
        }
        .hero-sub {
          font-size: 16px; color: var(--muted);
          line-height: 1.7; font-weight: 300;
          max-width: 480px; margin: 0 auto 48px;
        }
        .email-row {
          display: flex; align-items: center;
          max-width: 360px; margin: 0 auto 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 5px 5px 5px 16px;
          transition: border-color 0.15s;
        }
        .email-row:focus-within { border-color: rgba(255,255,255,0.22); }
        .email-input {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 14px; color: var(--text); min-width: 0;
          font-family: 'Inter', sans-serif;
        }
        .email-input::placeholder { color: var(--muted); }
        .email-go {
          width: 34px; height: 34px; border-radius: 7px;
          background: var(--text); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; text-decoration: none; color: #111;
          transition: background 0.15s;
        }
        .email-go:hover { background: #fff; }
        .hero-hint {
          font-size: 12px; color: var(--muted); text-align: center;
        }
        .hero-hint a { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }

        /* TICKER */
        .ticker {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 14px 0;
          overflow: hidden; white-space: nowrap;
          background: rgba(255,255,255,0.018);
        }
        .ticker-track {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .ticker-item {
          display: inline-flex; align-items: center; gap: 24px;
          padding-right: 24px;
          font-size: 13px; font-weight: 500; color: var(--muted);
        }
        .ticker-dot {
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(255,255,255,0.15); flex-shrink: 0;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* SECTIONS */
        .section {
          max-width: 860px; margin: 0 auto;
          padding: clamp(80px, 10vw, 120px) 24px;
        }
        .section-lbl {
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.1em; color: var(--muted);
          text-align: center; margin-bottom: 14px;
        }
        .section-ttl {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(30px, 5vw, 48px); font-weight: 800;
          letter-spacing: -1.5px; color: #f0f0ee;
          text-align: center; margin-bottom: 56px; line-height: 1.05;
        }

        /* STEPS */
        .steps-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: var(--border);
          border: 1px solid var(--border);
          border-radius: 14px; overflow: hidden;
        }
        .step {
          background: var(--bg); padding: 40px 36px;
          transition: background 0.2s;
        }
        .step:hover { background: var(--bg2); }
        .step-num { font-size: 11px; color: var(--muted); letter-spacing: 0.1em; margin-bottom: 28px; }
        .step-title {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 20px; font-weight: 700;
          color: #f0f0ee; margin-bottom: 10px; letter-spacing: -0.3px;
        }
        .step-desc { font-size: 14px; color: var(--muted); line-height: 1.65; font-weight: 300; }

        /* COURSES */
        .courses-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
        }
        .course-card {
          background: var(--bg2);
          border: 1px solid var(--border); border-radius: 14px;
          padding: 32px 28px; text-decoration: none;
          display: block; transition: all 0.2s;
        }
        .course-card:hover {
          border-color: rgba(255,255,255,0.16);
          background: #1e1e1c; transform: translateY(-2px);
        }
        .course-emoji { font-size: 36px; display: block; margin-bottom: 18px; line-height: 1; }
        .course-name {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 24px; font-weight: 800;
          letter-spacing: -0.5px; color: var(--accent); margin-bottom: 4px;
        }
        .course-tag { font-size: 12px; color: var(--muted); margin-bottom: 28px; font-weight: 300; }
        .course-arrow { font-size: 20px; color: rgba(255,255,255,0.18); transition: all 0.15s; }
        .course-card:hover .course-arrow { color: var(--accent); transform: translate(3px,-3px); }

        /* CTA */
        .cta-wrap {
          max-width: 640px; margin: 0 auto;
          padding: clamp(40px, 8vw, 80px) 24px clamp(80px, 10vw, 120px);
          text-align: center;
        }
        .cta-h2 {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: clamp(36px, 6vw, 64px); font-weight: 800;
          letter-spacing: -2px; line-height: 1.0;
          color: #f0f0ee; margin-bottom: 18px;
        }
        .cta-h2 .hl { background: var(--accent); color: #181800; padding: 0 10px 4px; border-radius: 6px; }
        .cta-sub { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 40px; font-weight: 300; }
        .cta-btns { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
        .btn-lg {
          font-size: 14px; font-weight: 500; color: #111;
          background: var(--text); text-decoration: none;
          padding: 13px 28px; border-radius: 10px;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.15s;
        }
        .btn-lg:hover { background: #fff; }
        .btn-lg-ghost {
          font-size: 14px; color: var(--muted);
          text-decoration: none; padding: 13px 28px;
          border-radius: 10px; border: 1px solid var(--border);
          transition: all 0.15s;
        }
        .btn-lg-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.18); }

        /* FOOTER */
        .footer-inner {
          border-top: 1px solid var(--border);
          max-width: 860px; margin: 0 auto;
          padding: 36px 24px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .footer-brand {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 15px; font-weight: 800;
          color: var(--text); text-decoration: none;
        }
        .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        .footer-link {
          font-size: 13px; color: var(--muted);
          text-decoration: none; transition: color 0.15s;
        }
        .footer-link:hover { color: var(--text); }
        .footer-copy { font-size: 12px; color: rgba(107,107,103,0.55); }

        /* RESPONSIVE */
        @media (max-width: 680px) {
          .nav-link { display: none; }
          .nav-logo { position: static; }
          .nav { justify-content: space-between; padding: 16px 20px; }
          .nav-right { position: static; }
          .steps-grid { grid-template-columns: 1fr; }
          .courses-grid { grid-template-columns: 1fr; }
          .footer-inner { flex-direction: column; align-items: flex-start; }
        }
        @media (min-width: 680px) and (max-width: 960px) {
          .courses-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <Link href="/" className="nav-logo">DevPath AI</Link>
        <Link href="#how-it-works" className="nav-link">How it works</Link>
        <Link href="#courses" className="nav-link">Courses</Link>
        <Link href="#faq" className="nav-link">FAQ</Link>
        <div className="nav-right">
          <Link href="/auth/login" className="btn-ghost">Sign in</Link>
          <Link href="/auth/register" className="btn-solid">Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          AI-powered developer learning
        </div>
        <h1 className="hero-h1">
          Level up your<br />
          dev skills <span className="hl">faster.</span>
        </h1>
        <p className="hero-sub">
          DevPath AI assesses your level, builds a personalized roadmap, and generates fresh lessons with Claude — all tailored to you.
        </p>

        <div className="email-row">
          <input className="email-input" type="email" placeholder="Email for early access" />
          <Link href="/auth/register" className="email-go" aria-label="Get started">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <p className="hero-hint">
          Already have an account?{" "}
          <Link href="/auth/login">Sign in</Link>
        </p>
      </div>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">
          {techLogos.map((logo, i) => (
            <span className="ticker-item" key={i}>
              {logo}
              <span className="ticker-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section" id="how-it-works">
        <div className="section-lbl">How it works</div>
        <h2 className="section-ttl">Four steps to mastery</h2>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* COURSES */}
      <div className="section" id="courses" style={{ paddingTop: 0 }}>
        <div className="section-lbl">Courses</div>
        <h2 className="section-ttl">Pick your track</h2>
        <div className="courses-grid">
          {courses.map((c, i) => (
            <Link href="/auth/register" className="course-card" key={i}>
              <span className="course-emoji">{c.emoji}</span>
              <div className="course-name">{c.name}</div>
              <div className="course-tag">{c.tag}</div>
              <div className="course-arrow">↗</div>
            </Link>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="cta-wrap">
        <div className="section-lbl">Ready?</div>
        <h2 className="cta-h2">
          Learn the<br />
          <span className="hl">smart way</span>
        </h2>
        <p className="cta-sub">
          Join thousands of developers learning smarter with AI. Free to start — no credit card needed.
        </p>
        <div className="cta-btns">
          <Link href="/auth/register" className="btn-lg">
            Create free account
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/auth/login" className="btn-lg-ghost">Sign in</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <Link href="/" className="footer-brand">DevPath AI</Link>
          <div className="footer-links">
            <Link href="/auth/login" className="footer-link">Sign in</Link>
            <Link href="/auth/register" className="footer-link">Register</Link>
            <Link href="/privacy" className="footer-link">Privacy</Link>
            <Link href="/terms" className="footer-link">Terms</Link>
          </div>
          <span className="footer-copy">© 2026 DevPath AI</span>
        </div>
      </footer>
    </div>
  );
}
