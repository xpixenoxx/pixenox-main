import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — Pixenox Solutions Pvt Ltd',
  description: 'Terms and conditions governing the use of Pixenox Solutions Pvt Ltd services and website.',
  alternates: { canonical: '/terms' },
};

export default function TermsOfServicePage() {
  return (
    <article className="legal-page section">
      <div className="container legal-container">
        <header className="legal-header">
          <span className="legal-tag">// LEGAL</span>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-updated">Last updated: April 2026</p>
        </header>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Pixenox website (pixenox.com) and services, you agree to be bound by these Terms of Service. This agreement is entered into with Pixenox Solutions Pvt Ltd, a registered private limited company incorporated under the laws of India. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Services</h2>
            <p>
              Pixenox Solutions Pvt Ltd provides technology services including but not limited to: autonomous AI systems, web architecture, unified optimization (SEO/AEO/GEO), insight engines, bio intelligence, growth intelligence, custom software engineering, and strategic technology consulting.
            </p>
            <p>
              Specific deliverables, timelines, and pricing for individual projects are defined in separate project agreements between Pixenox and the client.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, design elements, and code, is the intellectual property of Pixenox Solutions Pvt Ltd unless otherwise stated.
            </p>
            <p>
              For client projects: Intellectual property ownership and licensing terms are defined in individual project contracts. Upon full payment, clients typically receive full ownership rights to deliverables as specified in their agreement.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. User Responsibilities</h2>
            <p>When using our website and services, you agree to:</p>
            <ul>
              <li>Provide accurate information in all forms and communications</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not use our services for any illegal or harmful purpose</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Project Engagements</h2>
            <p>
              Project engagements are governed by separate agreements that outline scope, deliverables, timelines, payment terms, and other project-specific details. These Terms of Service apply in addition to any project-specific agreements.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Payment Terms</h2>
            <p>
              Payment terms, including amounts, schedules, and methods, are defined in individual project proposals and contracts. Late payments may result in project delays or suspension of services.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Limitation of Liability</h2>
            <p>
              Pixenox Solutions Pvt Ltd shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website or services. Our total liability for any claim shall not exceed the amount paid by the client for the specific service in question.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Confidentiality</h2>
            <p>
              We treat all client information and project details as confidential. We will not disclose client information to third parties without explicit consent, except as required by law.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Termination</h2>
            <p>
              Either party may terminate a project engagement as specified in the project agreement. Pixenox reserves the right to refuse or terminate service to any client for violations of these terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Governing Law</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India, and parties agree to attempt resolution through good-faith negotiation before pursuing formal legal action.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Contact</h2>
            <p>
              For questions about these Terms of Service, contact us at{' '}
              <a href="mailto:contact@pixenox.com" className="legal-link">contact@pixenox.com</a>.
            </p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link href="/privacy" className="legal-nav-link">Privacy Policy →</Link>
          <Link href="/" className="legal-nav-link">← Back to Home</Link>
        </div>
      </div>
    </article>
  );
}
