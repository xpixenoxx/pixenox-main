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
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last Updated: May 2026</p>
        </header>

        <div className="legal-content">
          {/* Intro */}
          <section className="legal-section">
            <p>
              Pixenox Solutions Pvt Ltd (&ldquo;Pixenox,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, protect, disclose, retain, and manage your information when you visit <a href="https://www.pixenox.com" className="legal-link" target="_blank" rel="noopener noreferrer">www.pixenox.com</a>, submit a form, contact us, or interact with our website and related digital channels.
            </p>
            <p>
              This Privacy Policy applies only to information collected through our website and related online communication channels. If you become a client of Pixenox, additional privacy, confidentiality, data-processing, non-disclosure, and contractual terms may apply depending on the nature of the project.
            </p>
            <p>
              By using our website or submitting information to us, you agree to the practices described in this Privacy Policy.
            </p>
          </section>

          {/* 1. About Pixenox */}
          <section className="legal-section">
            <h2>1. About Pixenox</h2>
            <p>
              Pixenox Solutions Pvt Ltd is a technology and business growth solutions company based in India. We provide services such as website development, SaaS development, cloud infrastructure, AI systems, automation, analytics, CRM solutions, digital transformation, optimization systems, and custom software development.
            </p>
            <ul>
              <li><strong>Company Name:</strong> Pixenox Solutions Pvt Ltd</li>
              <li><strong>Country:</strong> India</li>
              <li><strong>Website:</strong> <a href="https://www.pixenox.com" className="legal-link" target="_blank" rel="noopener noreferrer">www.pixenox.com</a></li>
              <li><strong>Contact:</strong> <a href="mailto:connect@pixenox.com" className="legal-link">connect@pixenox.com</a></li>
              <li><strong>Registered Office:</strong> H NO 1 1,SREENU RAJA, MAIN ROAD PRATHIPADU, Siripuram, Prathipadu, East Godavari- 533432, Andhra Pradesh</li>
              <li><strong>CIN:</strong> U62091AP2026PTC125091</li>
            </ul>
          </section>

          {/* 2. Scope of This Privacy Policy */}
          <section className="legal-section">
            <h2>2. Scope of This Privacy Policy</h2>
            <p>This Privacy Policy applies to:</p>
            <ul>
              <li>Visitors of <a href="https://www.pixenox.com" className="legal-link" target="_blank" rel="noopener noreferrer">www.pixenox.com</a></li>
              <li>Users who submit contact or inquiry forms</li>
              <li>Users who communicate with Pixenox through website-linked channels</li>
              <li>Prospective clients who share project details</li>
              <li>Business representatives who contact Pixenox for services</li>
              <li>Individuals who interact with Pixenox&rsquo;s online presence</li>
            </ul>
            <p>
              This Privacy Policy does not automatically apply to third-party websites, external links, third-party tools, social media platforms, or client systems unless specifically stated.
            </p>
          </section>

          {/* 3. Information We Collect */}
          <section className="legal-section">
            <h2>3. Information We Collect</h2>
            <p>We collect only limited personal information that you voluntarily provide to us. This may include:</p>
            <ul>
              <li>Your name</li>
              <li>Email address</li>
              <li>Phone number, if submitted</li>
              <li>Company or organization name, if submitted</li>
              <li>Website URL, if submitted</li>
              <li>Project details or inquiry message</li>
              <li>Service requirements shared by you</li>
              <li>Communication history with Pixenox</li>
              <li>Business documents voluntarily shared by you</li>
              <li>Screenshots, files, references, or attachments voluntarily submitted</li>
              <li>Any other information you choose to provide during communication</li>
            </ul>
            <p>
              We do not intentionally collect sensitive personal information through our public website forms, such as financial account passwords, OTPs, government identity documents, health records, biometric data, religious beliefs, political opinions, or private personal data that is not required for business communication.
            </p>
            <p>
              Please do not submit confidential, sensitive, or legally restricted information through public website forms unless Pixenox specifically requests it through a secure and agreed process.
            </p>
          </section>

          {/* 4. Information Collected Automatically */}
          <section className="legal-section">
            <h2>4. Information Collected Automatically</h2>
            <p>
              At present, we do not use tracking cookies, analytics cookies, advertising cookies, retargeting pixels, invisible trackers, or fingerprinting technologies for behavioral advertising.
            </p>
            <p>
              However, like most websites, certain technical information may be processed automatically by our hosting, security, infrastructure, and backend providers. This may include:
            </p>
            <ul>
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device type</li>
              <li>Operating system</li>
              <li>Date and time of access</li>
              <li>Pages visited</li>
              <li>Referrer information</li>
              <li>Server logs</li>
              <li>Security logs</li>
              <li>Error logs</li>
              <li>Basic diagnostic information</li>
            </ul>
            <p>
              This information may be used for website functionality, security, debugging, performance monitoring, abuse prevention, and protection against unauthorized access.
            </p>
          </section>

          {/* 5. Cookies and Similar Technologies */}
          <section className="legal-section">
            <h2>5. Cookies and Similar Technologies</h2>
            <p>We do not currently use tracking cookies or advertising cookies.</p>
            <p>We may use strictly necessary cookies only for:</p>
            <ul>
              <li>Admin panel authentication</li>
              <li>Security protection</li>
              <li>CSRF protection</li>
              <li>Session management</li>
              <li>Website functionality</li>
              <li>Abuse prevention</li>
            </ul>
            <p>These cookies are not used to track your browsing behavior for advertising purposes.</p>
            <p>
              If we introduce analytics, advertising, heatmaps, CRM tracking, retargeting pixels, remarketing tools, or similar technologies in the future, we will update this Privacy Policy and, where required, obtain appropriate consent.
            </p>
          </section>

          {/* 6. How We Use Your Information */}
          <section className="legal-section">
            <h2>6. How We Use Your Information</h2>
            <p>We may use the information you provide for the following purposes:</p>
            <ul>
              <li>To respond to your inquiry</li>
              <li>To understand your project or service requirement</li>
              <li>To schedule meetings or consultations</li>
              <li>To prepare proposals, estimates, quotations, or project plans</li>
              <li>To provide requested services</li>
              <li>To communicate about ongoing or potential work</li>
              <li>To improve our website, services, and client experience</li>
              <li>To maintain internal business records</li>
              <li>To prevent spam, fraud, abuse, misuse, or unauthorized access</li>
              <li>To protect our website, systems, business, and users</li>
              <li>To comply with legal, regulatory, contractual, or tax obligations</li>
              <li>To resolve disputes or enforce agreements</li>
              <li>To maintain communication history for business continuity</li>
            </ul>
            <p>We do not sell, rent, or trade your personal information.</p>
          </section>

          {/* 7. Legal Basis for Processing */}
          <section className="legal-section">
            <h2>7. Legal Basis for Processing</h2>
            <p>We process your personal information only when there is a lawful and reasonable basis to do so. This may include:</p>
            <ul>
              <li>Your consent when you submit a form or contact us</li>
              <li>Our legitimate business interest in responding to inquiries</li>
              <li>Pre-contractual communication before entering into a service agreement</li>
              <li>Performance of a contract, proposal, invoice, or project agreement</li>
              <li>Compliance with applicable legal obligations</li>
              <li>Protection of our website, systems, business, and users from misuse</li>
              <li>Record keeping for tax, legal, accounting, or business purposes</li>
            </ul>
            <p>
              You may withdraw your consent where processing is based on consent. However, withdrawal of consent may affect our ability to respond to your inquiry or provide certain services.
            </p>
          </section>

          {/* 8. Data Minimization */}
          <section className="legal-section">
            <h2>8. Data Minimization</h2>
            <p>
              Pixenox aims to collect only the information that is necessary for business communication, inquiry handling, service delivery, security, and legal compliance.
            </p>
            <p>
              We do not intentionally collect unnecessary personal information through our website. Users are advised not to submit sensitive or unrelated personal details unless required for a specific service engagement.
            </p>
          </section>

          {/* 9. Third-Party Service Providers */}
          <section className="legal-section">
            <h2>9. Third-Party Service Providers</h2>
            <p>We may use trusted third-party service providers to operate our website, manage infrastructure, handle backend services, provide communication tools, and secure our systems.</p>
            <p>These may include:</p>
            <ul>
              <li><strong>Vercel</strong> &mdash; website hosting and deployment</li>
              <li><strong>Supabase</strong> &mdash; database, authentication, and backend infrastructure</li>
              <li><strong>Google Fonts</strong> &mdash; typography delivery, if loaded externally</li>
              <li><strong>Email and communication tools</strong> &mdash; business communication</li>
              <li><strong>Security and infrastructure tools</strong> &mdash; website protection</li>
              <li>Domain, DNS, and hosting service providers</li>
              <li>Cloud storage or project management tools, if required for client work</li>
            </ul>
            <p>These providers may process limited personal or technical information only as necessary to provide their services.</p>
            <p>We do not allow third-party providers to use your personal information for their independent marketing or advertising purposes.</p>
          </section>

          {/* 10. Google Fonts and External Resources */}
          <section className="legal-section">
            <h2>10. Google Fonts and External Resources</h2>
            <p>
              Our website may use Google Fonts or similar typography services. If fonts are loaded directly from external servers, your browser may send limited technical information such as IP address, browser details, and request metadata to that provider.
            </p>
            <p>Where possible, Pixenox aims to serve fonts and static assets in a privacy-conscious manner.</p>
            <p style={{ fontStyle: 'italic', opacity: 0.6, fontSize: '0.9rem', marginTop: '12px' }}>
              *Recommended improvement: Pixenox should self-host fonts to reduce third-party browser requests and improve privacy control.
            </p>
          </section>

          {/* 11. Data Storage */}
          <section className="legal-section">
            <h2>11. Data Storage</h2>
            <p>Information submitted through our website may be stored using secure cloud-based infrastructure and database services.</p>
            <p>
              Pixenox may use Supabase for data management and Vercel for website hosting and deployment. Depending on provider configuration, data may be stored or processed in India or other jurisdictions.
            </p>
            <p>
              By using our website or submitting information to us, you understand that your information may be processed through third-party infrastructure providers that maintain their own security and compliance standards.
            </p>
          </section>

          {/* 12. International Data Processing */}
          <section className="legal-section">
            <h2>12. International Data Processing</h2>
            <p>
              Some of our service providers may operate servers, infrastructure, support systems, or processing facilities outside India. This means your information may be stored, transferred, or processed in countries other than your country of residence.
            </p>
            <p>
              Where such processing occurs, we take reasonable steps to ensure that your information is handled securely and only for the purposes described in this Privacy Policy.
            </p>
          </section>

          {/* 13. Data Retention */}
          <section className="legal-section">
            <h2>13. Data Retention</h2>
            <p>We retain personal information only for as long as necessary for the purpose for which it was collected.</p>
            <p>Generally:</p>
            <ul>
              <li>Website inquiry data may be retained for up to 12 months from the last communication.</li>
              <li>Business communication records may be retained for the duration of the business relationship and a reasonable period after completion.</li>
              <li>Client communication, proposal, invoice, and contract records may be retained as required for legal, accounting, tax, or dispute-resolution purposes.</li>
              <li>Security logs may be retained for a limited period for fraud prevention, debugging, website protection, and system security.</li>
              <li>Project-related data may be retained according to the relevant project agreement, NDA, service agreement, or written contract.</li>
            </ul>
            <p>
              If you request deletion of your personal information, we will delete or anonymize it unless we are legally required or reasonably permitted to retain it.
            </p>
          </section>

          {/* 14. Data Security */}
          <section className="legal-section">
            <h2>14. Data Security</h2>
            <p>We take reasonable technical and organizational measures to protect your personal information from unauthorized access, misuse, loss, alteration, disclosure, or destruction.</p>
            <p>Our security measures may include:</p>
            <ul>
              <li>HTTPS encryption</li>
              <li>Secure hosting infrastructure</li>
              <li>Access-controlled admin systems</li>
              <li>Role-based access controls</li>
              <li>Supabase row-level security policies, where applicable</li>
              <li>Restricted access to inquiry data</li>
              <li>Secure authentication for authorized administrators</li>
              <li>CSRF protection</li>
              <li>Database access restrictions</li>
              <li>Regular review of website forms and admin access</li>
              <li>Use of trusted cloud service providers</li>
              <li>Internal access limitation based on business need</li>
            </ul>
            <p>
              However, no method of internet transmission or electronic storage is completely secure. While we take reasonable steps to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* 15. Admin Panel and Internal Access */}
          <section className="legal-section">
            <h2>15. Admin Panel and Internal Access</h2>
            <p>
              Pixenox may maintain an admin panel for authorized internal users to manage website inquiries, content, project data, or operational information.
            </p>
            <p>
              Access to admin systems is restricted to authorized personnel only. Admin access should be protected using strong passwords, secure authentication, access controls, and, where possible, multi-factor authentication.
            </p>
            <p>
              Visitors, users, clients, and third parties are not permitted to access or attempt to access any admin panel, backend system, database, server, API, source code, authentication system, or restricted area of the website.
            </p>
          </section>

          {/* 16. Data Sharing */}
          <section className="legal-section">
            <h2>16. Data Sharing</h2>
            <p>We may share your information only in limited circumstances:</p>
            <ul>
              <li>With internal team members who need the information to respond to you</li>
              <li>With trusted service providers that help us operate the website or deliver services</li>
              <li>With consultants, developers, designers, or contractors working under confidentiality obligations</li>
              <li>With legal, regulatory, tax, government, or law enforcement authorities if required</li>
              <li>With professional advisors such as lawyers, auditors, or accountants</li>
              <li>In connection with business restructuring, merger, acquisition, transfer, or sale, if applicable</li>
              <li>To protect the rights, property, security, or safety of Pixenox, our users, clients, or others</li>
            </ul>
            <p>We do not sell your personal information.</p>
          </section>

          {/* 17. Client Project Data */}
          <section className="legal-section">
            <h2>17. Client Project Data</h2>
            <p>This Privacy Policy mainly covers website visitor and inquiry data.</p>
            <p>
              If Pixenox works with you as a client, we may process additional business, technical, operational, or project-related data. This may include:
            </p>
            <ul>
              <li>Website credentials</li>
              <li>Hosting details</li>
              <li>Domain details</li>
              <li>Business documents</li>
              <li>CRM data</li>
              <li>Analytics data</li>
              <li>Application data</li>
              <li>Design files</li>
              <li>Source code</li>
              <li>API credentials</li>
              <li>Cloud infrastructure details</li>
              <li>User data provided by the client</li>
              <li>Brand assets</li>
              <li>Marketing data</li>
              <li>Internal business process information</li>
            </ul>
            <p>
              Such data will be governed by the applicable proposal, service agreement, NDA, data processing agreement, or written contract between Pixenox and the client.
            </p>
            <p>
              Clients should not share production credentials, private keys, API secrets, customer databases, or sensitive business data through public website forms.
            </p>
          </section>

          {/* 18. Confidentiality */}
          <section className="legal-section">
            <h2>18. Confidentiality</h2>
            <p>We treat business inquiries, project discussions, and client information with reasonable confidentiality.</p>
            <p>
              However, submitting information through the website does not automatically create a client relationship, NDA, attorney-client relationship, fiduciary relationship, or confidential advisory relationship unless separately agreed in writing.
            </p>
            <p>
              For highly confidential projects, please request a Non-Disclosure Agreement before sharing sensitive information.
            </p>
          </section>

          {/* 19. Your Rights */}
          <section className="legal-section">
            <h2>19. Your Rights</h2>
            <p>Subject to applicable law, you may have the right to:</p>
            <ul>
              <li>Request access to personal information we hold about you</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Ask how your data is being used</li>
              <li>Request that we stop using your data for certain purposes</li>
              <li>Raise a grievance regarding data handling</li>
            </ul>
            <p>To exercise your rights, contact us at:</p>
            <p>
              Email: <a href="mailto:connect@pixenox.com" className="legal-link">connect@pixenox.com</a>
            </p>
            <p>We may need to verify your identity before processing certain requests.</p>
          </section>

          {/* 20. Response Timeline */}
          <section className="legal-section">
            <h2>20. Response Timeline</h2>
            <p>We aim to respond to privacy-related requests within 30 days.</p>
            <p>
              In some cases, we may require additional time if the request is complex, repetitive, legally sensitive, technically difficult, or requires identity verification.
            </p>
            <p>If we are unable to fulfill your request, we will explain the reason where legally permitted.</p>
          </section>

          {/* 21. Withdrawal of Consent */}
          <section className="legal-section">
            <h2>21. Withdrawal of Consent</h2>
            <p>
              If you have provided consent for us to process your personal information, you may withdraw that consent by contacting us.
            </p>
            <p>
              After withdrawal, we will stop processing your information for the relevant purpose unless we have another lawful reason to continue, such as legal compliance, dispute resolution, fraud prevention, contractual necessity, or legitimate business records.
            </p>
          </section>

          {/* 22. Children's Privacy */}
          <section className="legal-section">
            <h2>22. Children&apos;s Privacy</h2>
            <p>
              Our website and services are intended for businesses, professionals, startups, organizations, and individuals aged 18 years and above.
            </p>
            <p>
              We do not knowingly collect personal information from children. If we become aware that a child has submitted personal information through our website without appropriate consent, we will take reasonable steps to delete that information.
            </p>
          </section>

          {/* 23. Data Breach Handling */}
          <section className="legal-section">
            <h2>23. Data Breach Handling</h2>
            <p>
              In the event of a personal data breach, unauthorized access, accidental disclosure, or security incident involving personal information, we will take reasonable steps to:
            </p>
            <ul>
              <li>Identify and contain the issue</li>
              <li>Assess the type and impact of data involved</li>
              <li>Secure affected systems</li>
              <li>Notify affected users where required</li>
              <li>Notify authorities where required by applicable law</li>
              <li>Improve safeguards to reduce future risk</li>
            </ul>
          </section>

          {/* 24. Links to Other Websites */}
          <section className="legal-section">
            <h2>24. Links to Other Websites</h2>
            <p>Our website may contain links to third-party websites, social media pages, tools, platforms, or resources.</p>
            <p>
              We are not responsible for the privacy practices, security, content, or policies of third-party websites. You should review the privacy policies of any third-party websites you visit.
            </p>
          </section>

          {/* 25. Social Media Links */}
          <section className="legal-section">
            <h2>25. Social Media Links</h2>
            <p>Our website may link to Pixenox&rsquo;s social media profiles such as LinkedIn, X, Instagram, or other platforms.</p>
            <p>
              When you interact with Pixenox on social media, your activity may also be governed by the privacy policy and terms of that social media platform.
            </p>
          </section>

          {/* 26. Marketing Communication */}
          <section className="legal-section">
            <h2>26. Marketing Communication</h2>
            <p>
              At present, we do not use your website inquiry data for automated advertising, retargeting, or third-party marketing.
            </p>
            <p>
              If you contact us, we may reply to your inquiry or send essential business communication related to your request.
            </p>
            <p>
              If we introduce newsletters, marketing emails, CRM campaigns, retargeting, advertising pixels, or promotional communication in the future, we will update this Privacy Policy and provide an option to unsubscribe or opt out where required.
            </p>
          </section>

          {/* 27. Accuracy of Information */}
          <section className="legal-section">
            <h2>27. Accuracy of Information</h2>
            <p>You are responsible for ensuring that the information you submit to us is accurate, complete, and lawful.</p>
            <p>
              If your information changes or you believe the data we hold is incorrect, you may contact us to request correction.
            </p>
          </section>

          {/* 28. Do Not Submit Sensitive Credentials */}
          <section className="legal-section">
            <h2>28. Do Not Submit Sensitive Credentials</h2>
            <p>For your own security, please do not submit the following through our public website forms:</p>
            <ul>
              <li>Passwords</li>
              <li>OTPs</li>
              <li>Private keys</li>
              <li>API secrets</li>
              <li>Payment card details</li>
              <li>Bank account credentials</li>
              <li>Production database access</li>
              <li>Government identification documents</li>
              <li>Confidential client data</li>
              <li>Sensitive personal information</li>
              <li>Access tokens</li>
              <li>Admin credentials</li>
            </ul>
            <p>If such information is required for a project, Pixenox will provide a safer method of sharing it.</p>
          </section>

          {/* 29. Security Recommendations for Users */}
          <section className="legal-section">
            <h2>29. Security Recommendations for Users</h2>
            <p>When communicating with Pixenox, we recommend that you:</p>
            <ul>
              <li>Use official Pixenox email addresses only</li>
              <li>Avoid sharing passwords over email or website forms</li>
              <li>Verify payment or bank details before making payments</li>
              <li>Request an official proposal or invoice before starting paid work</li>
              <li>Report suspicious communication claiming to be from Pixenox</li>
              <li>Avoid sharing confidential production credentials without an NDA or secure process</li>
            </ul>
          </section>

          {/* 30. Changes to This Privacy Policy */}
          <section className="legal-section">
            <h2>30. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our services, technology, security practices, legal obligations, or business operations.
            </p>
            <p>When we update this policy, we will revise the &ldquo;Last Updated&rdquo; date at the top of this page.</p>
            <p>Continued use of our website after changes are published means you acknowledge the updated policy.</p>
          </section>

          {/* 31. Contact Us */}
          <section className="legal-section">
            <h2>31. Contact Us</h2>
            <p>If you have any questions, concerns, requests, or complaints regarding this Privacy Policy or how we handle personal information, contact us at:</p>
            <ul>
              <li><strong>Pixenox Solutions Pvt Ltd</strong></li>
              <li>Email: <a href="mailto:connect@pixenox.com" className="legal-link">connect@pixenox.com</a></li>
              <li>Website: <a href="https://www.pixenox.com" className="legal-link" target="_blank" rel="noopener noreferrer">www.pixenox.com</a></li>
              <li>Country: India</li>
              <li>Registered Office: H NO 1 1,SREENU RAJA, MAIN ROAD PRATHIPADU, Siripuram, Prathipadu, East Godavari- 533432, Andhra Pradesh</li>
              <li>CIN: U62091AP2026PTC125091</li>
            </ul>
          </section>

          {/* 32. Grievance Contact */}
          <section className="legal-section">
            <h2>32. Grievance Contact</h2>
            <p>For privacy-related complaints or grievances, please contact:</p>
            <p>
              <strong>Grievance / Privacy Contact</strong><br />
              Pixenox Solutions Pvt Ltd<br />
              Email: <a href="mailto:connect@pixenox.com" className="legal-link">connect@pixenox.com</a><br />
              Response Timeline: We aim to respond within 30 days.
            </p>
            <p>
              If you are not satisfied with our response, you may have rights under applicable data protection laws to approach the appropriate authority or Data Protection Board, where applicable.
            </p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link href="/terms" className="legal-nav-link">Terms of Service &rarr;</Link>
          <Link href="/" className="legal-nav-link">&larr; Back to Home</Link>
        </div>
      </div>
    </article>
  );
}
