import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Lost in the Void | Pixenox',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="notfound-page">
      {/* Ambient background effects */}
      <div className="notfound-aurora" aria-hidden="true" />
      <div className="notfound-aurora notfound-aurora--2" aria-hidden="true" />
      <div className="notfound-noise" aria-hidden="true" />

      {/* Giant watermark */}
      <h1 className="notfound-watermark" aria-hidden="true">404</h1>

      {/* Content */}
      <div className="notfound-content">
        <span className="notfound-label">SIGNAL_LOST</span>
        <h2 className="notfound-title">
          This route doesn&apos;t <em>exist.</em>
        </h2>
        <p className="notfound-desc">
          The coordinates you entered lead to uncharted void. 
          The system has no record of this path.
        </p>
        <Link href="/" className="notfound-cta">
          <span>Return to Base</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Floating particles canvas placeholder */}
      <div className="notfound-grid" aria-hidden="true">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="notfound-dot" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      <style>{`
        .notfound-page {
          min-height: 100vh;
          background: #030108;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif;
        }

        .notfound-aurora {
          position: absolute;
          top: -30%;
          right: -20%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: drift404 20s ease-in-out infinite alternate;
        }

        .notfound-aurora--2 {
          top: auto;
          bottom: -20%;
          left: -15%;
          right: auto;
          width: 40vw;
          height: 40vw;
          background: radial-gradient(circle, rgba(88, 28, 135, 0.08) 0%, transparent 70%);
          animation-direction: alternate-reverse;
          animation-duration: 25s;
        }

        @keyframes drift404 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 5%) scale(1.1); }
          100% { transform: translate(-5%, -5%) scale(0.95); }
        }

        .notfound-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.03;
          mix-blend-mode: overlay;
          pointer-events: none;
        }

        .notfound-watermark {
          position: absolute;
          font-size: clamp(15rem, 35vw, 40rem);
          font-weight: 900;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.03);
          line-height: 1;
          letter-spacing: -0.05em;
          user-select: none;
          pointer-events: none;
          margin: 0;
        }

        .notfound-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 600px;
          padding: 0 24px;
        }

        .notfound-label {
          display: inline-block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(168, 85, 247, 0.7);
          margin-bottom: 24px;
          padding: 6px 16px;
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 100px;
        }

        .notfound-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: #F6F6FD;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0 0 20px;
        }

        .notfound-title em {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
          color: #a78bfa;
        }

        .notfound-desc {
          font-size: 1.05rem;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.7;
          margin: 0 0 40px;
          font-weight: 300;
        }

        .notfound-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 32px;
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 100px;
          background: rgba(168, 85, 247, 0.06);
          color: #fff;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .notfound-cta:hover {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.12);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(168, 85, 247, 0.2);
        }

        .notfound-cta svg {
          transition: transform 0.3s ease;
        }

        .notfound-cta:hover svg {
          transform: translateX(4px);
        }

        /* Floating dots */
        .notfound-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .notfound-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(168, 85, 247, 0.3);
          border-radius: 50%;
          animation: floatDot linear infinite;
        }

        @keyframes floatDot {
          0% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-100px); }
        }
      `}</style>
    </div>
  );
}
