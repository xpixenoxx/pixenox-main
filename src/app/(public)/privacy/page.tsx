import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Pixenox Solutions Pvt Ltd',
  description: 'Learn how Pixenox Solutions Pvt Ltd handles your data. We do not use tracking cookies or analytics cookies. Privacy-first approach.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPolicyPage() {
  return (
    <article className="legal-page section">
      <div className="container legal-container">
        <header className="legal-header">
          <span className="legal-tag">// LEGAL</span>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated: April 2026</p>
        </header>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              Pixenox Solutions Pvt Ltd (&ldquo;Pixenox,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is a registered private limited company based in India. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website at pixenox.com.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. No Tracking Cookies</h2>
            <p>
              <strong>We do not use tracking cookies, analytics cookies, or any third-party advertising cookies.</strong> Your browsing activity on our site is not tracked, profiled, or shared with any third party for advertising purposes.
            </p>
            <p>
              We may use essential, strictly necessary cookies solely for:
            </p>
            <ul>
              <li>Admin panel authentication sessions (applicable only to authorized administrators)</li>
              <li>Security protections (CSRF prevention)</li>
            </ul>
            <p>
              These essential cookies are not used for tracking and contain no personal browsing data.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Information We Collect</h2>
            <p>We collect information only when you voluntarily provide it through our contact or inquiry forms:</p>
            <ul>
              <li><strong>Name</strong> — to address you properly</li>
              <li><strong>Email address</strong> — to respond to your inquiry</li>
              <li><strong>Website URL</strong> — if provided, to understand your project needs</li>
              <li><strong>Message content</strong> — to understand how we can help</li>
            </ul>
            <p>We do not collect data passively through invisible trackers, pixels, or fingerprinting technologies.</p>
          </section>

          <section className="legal-section">
            <h2>4. How We Use Your Information</h2>
            <p>Information submitted through our forms is used exclusively to:</p>
            <ul>
              <li>Respond to your inquiry or project request</li>
              <li>Provide the services you requested</li>
              <li>Send essential communications related to our engagement</li>
            </ul>
            <p>We will never sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section className="legal-section">
            <h2>5. Data Storage &amp; Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption and access controls. We use Supabase (hosted on AWS) for secure data management with row-level security policies.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Third-Party Services</h2>
            <p>We use the following third-party services, strictly for functionality:</p>
            <ul>
              <li><strong>Supabase</strong> — Database and authentication infrastructure</li>
              <li><strong>Google Fonts</strong> — Typography delivery (no tracking)</li>
              <li><strong>Vercel</strong> — Website hosting and deployment</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Request access to any personal data we hold about you</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:contact@pixenox.com" className="legal-link">contact@pixenox.com</a>.</p>
          </section>

          <section className="legal-section">
            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Contact</h2>
            <p>
              For any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:contact@pixenox.com" className="legal-link">contact@pixenox.com</a>.
            </p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link href="/terms" className="legal-nav-link">Terms of Service →</Link>
          <Link href="/" className="legal-nav-link">← Back to Home</Link>
        </div>
      </div>
    </article>
  );
}
