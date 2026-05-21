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
          <h1 className="legal-title">Terms &amp; Conditions</h1>
          <p className="legal-updated">Last Updated: May 2026</p>
        </header>

        <div className="legal-content">
          {/* Intro */}
          <section className="legal-section">
            <p>
              These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the Pixenox website, services, proposals, communications, and digital platforms operated by Pixenox Solutions Pvt Ltd (&ldquo;Pixenox,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;).
            </p>
            <p>
              By accessing <a href="https://www.pixenox.com" className="legal-link" target="_blank" rel="noopener noreferrer">www.pixenox.com</a>, contacting Pixenox, submitting an inquiry, requesting a proposal, or using our services, you agree to these Terms. If you do not agree with these Terms, please do not use our website or services.
            </p>
            <p>
              These Terms apply in addition to any proposal, invoice, statement of work, service agreement, non-disclosure agreement, data processing agreement, or written contract between Pixenox and a client. If there is a conflict between these Terms and a signed written agreement, the signed written agreement will prevail for that specific project.
            </p>
          </section>

          {/* 1. About Pixenox */}
          <section className="legal-section">
            <h2>1. About Pixenox</h2>
            <p>
              Pixenox Solutions Pvt Ltd is a technology and business growth solutions company based in India.
            </p>
            <ul>
              <li><strong>Company Name:</strong> Pixenox Solutions Pvt Ltd</li>
              <li><strong>Website:</strong> <a href="https://www.pixenox.com" className="legal-link" target="_blank" rel="noopener noreferrer">www.pixenox.com</a></li>
              <li><strong>Email:</strong> <a href="mailto:connect@pixenox.com" className="legal-link">connect@pixenox.com</a></li>
              <li><strong>Registered Office:</strong> H NO 1 1,SREENU RAJA, MAIN ROAD PRATHIPADU, Siripuram, Prathipadu, East Godavari- 533432, Andhra Pradesh</li>
              <li><strong>CIN:</strong> U62091AP2026PTC125091</li>
            </ul>
            <p>
              Pixenox provides technology, design, development, consulting, automation, cloud, AI, analytics, optimization, and business growth-related services.
            </p>
          </section>

          {/* 2. Acceptance of Terms */}
          <section className="legal-section">
            <h2>2. Acceptance of Terms</h2>
            <p>By using our website or services, you confirm that:</p>
            <ul>
              <li>You have read and understood these Terms.</li>
              <li>You agree to be bound by these Terms.</li>
              <li>You are legally capable of entering into a binding agreement.</li>
              <li>If you represent a company or organization, you have authority to act on its behalf.</li>
              <li>The information you provide to Pixenox is accurate, lawful, and complete.</li>
            </ul>
            <p>If you do not agree, you must stop using our website and services.</p>
          </section>

          {/* 3. Services Provided by Pixenox */}
          <section className="legal-section">
            <h2>3. Services Provided by Pixenox</h2>
            <p>Pixenox may provide services including, but not limited to:</p>
            <ul>
              <li>Website design and development</li>
              <li>SaaS product development</li>
              <li>Custom software development</li>
              <li>Cloud infrastructure setup</li>
              <li>AI systems and automation</li>
              <li>CRM and business workflow solutions</li>
              <li>Data analytics and dashboards</li>
              <li>SEO, AEO, GEO, and digital optimization</li>
              <li>UI/UX design</li>
              <li>Branding and digital identity support</li>
              <li>Business growth technology consulting</li>
              <li>API integrations</li>
              <li>Internal tools and admin panels</li>
              <li>Digital transformation consulting</li>
              <li>Maintenance and technical support</li>
              <li>Strategic technology consulting</li>
            </ul>
            <p>
              The exact services, deliverables, timelines, pricing, responsibilities, and support terms for each project will be defined in a separate proposal, invoice, service agreement, statement of work, or written contract.
            </p>
          </section>

          {/* 4. Website Information */}
          <section className="legal-section">
            <h2>4. Website Information</h2>
            <p>
              The content on our website is provided for general informational and business communication purposes only.
            </p>
            <p>
              Although we try to keep information accurate and updated, we do not guarantee that all website content is always complete, current, error-free, or suitable for your specific business requirement.
            </p>
            <p>
              Pixenox may update, remove, modify, or replace website content at any time without prior notice.
            </p>
          </section>

          {/* 5. Project Proposals and Agreements */}
          <section className="legal-section">
            <h2>5. Project Proposals and Agreements</h2>
            <p>
              A project begins only when Pixenox and the client agree to the applicable scope, pricing, timeline, payment terms, and deliverables.
            </p>
            <p>This may be done through:</p>
            <ul>
              <li>Written proposal</li>
              <li>Quotation</li>
              <li>Invoice</li>
              <li>Email confirmation</li>
              <li>Statement of work</li>
              <li>Service agreement</li>
              <li>Signed contract</li>
              <li>Purchase order</li>
              <li>Any other written confirmation accepted by Pixenox</li>
            </ul>
            <p>
              Verbal discussions, informal calls, chats, or preliminary meetings do not automatically create a binding project commitment unless confirmed in writing.
            </p>
          </section>

          {/* 6. Scope of Work */}
          <section className="legal-section">
            <h2>6. Scope of Work</h2>
            <p>
              The scope of work for each project will be defined in the applicable proposal, service agreement, statement of work, or written communication.
            </p>
            <p>The scope may include:</p>
            <ul>
              <li>Deliverables</li>
              <li>Features</li>
              <li>Pages</li>
              <li>Modules</li>
              <li>Integrations</li>
              <li>Design requirements</li>
              <li>Content responsibilities</li>
              <li>Development tasks</li>
              <li>Testing requirements</li>
              <li>Deployment responsibility</li>
              <li>Support period</li>
              <li>Revision limits</li>
              <li>Timeline</li>
              <li>Client responsibilities</li>
              <li>Payment terms</li>
            </ul>
            <p>Anything not specifically included in the agreed scope will be considered outside scope.</p>
          </section>

          {/* 7. Scope Changes and Additional Work */}
          <section className="legal-section">
            <h2>7. Scope Changes and Additional Work</h2>
            <p>Any request outside the agreed scope will be treated as additional work.</p>
            <p>Additional work may include, but is not limited to:</p>
            <ul>
              <li>Additional pages</li>
              <li>Additional features</li>
              <li>New modules</li>
              <li>Extra design revisions</li>
              <li>Content changes after approval</li>
              <li>New integrations</li>
              <li>API changes</li>
              <li>Dashboard changes</li>
              <li>Automation changes</li>
              <li>CRM changes</li>
              <li>Database changes</li>
              <li>Hosting changes</li>
              <li>Deployment changes</li>
              <li>Security additions</li>
              <li>Performance optimization not originally agreed</li>
              <li>Rework caused by changed client requirements</li>
              <li>Rework caused by incorrect or incomplete client inputs</li>
            </ul>
            <p>Additional work may require additional fees and timeline extensions.</p>
            <p>Pixenox is not obligated to perform out-of-scope work unless both parties agree in writing.</p>
          </section>

          {/* 8. Client Responsibilities */}
          <section className="legal-section">
            <h2>8. Client Responsibilities</h2>
            <p>
              The client is responsible for providing accurate, complete, timely, and lawful information required for project execution.
            </p>
            <p>This may include:</p>
            <ul>
              <li>Business details</li>
              <li>Brand assets</li>
              <li>Logo files</li>
              <li>Website content</li>
              <li>Images</li>
              <li>Product/service details</li>
              <li>Domain access</li>
              <li>Hosting access</li>
              <li>API access</li>
              <li>CRM access</li>
              <li>Payment gateway details</li>
              <li>Third-party platform access</li>
              <li>Feedback</li>
              <li>Approvals</li>
              <li>Legal permissions</li>
              <li>Required documents</li>
              <li>Correct contact details</li>
              <li>Timely communication</li>
            </ul>
            <p>
              Pixenox is not responsible for delays, errors, or additional costs caused by incomplete, incorrect, delayed, or unlawful information provided by the client.
            </p>
          </section>

          {/* 9. Client Delays */}
          <section className="legal-section">
            <h2>9. Client Delays</h2>
            <p>Project timelines depend on timely client cooperation.</p>
            <p>Pixenox will not be responsible for delays caused by:</p>
            <ul>
              <li>Late client feedback</li>
              <li>Late approvals</li>
              <li>Missing content</li>
              <li>Missing credentials</li>
              <li>Pending payments</li>
              <li>Delayed access to tools</li>
              <li>Third-party approval delays</li>
              <li>Changes in client requirements</li>
              <li>Internal delays from the client&rsquo;s side</li>
              <li>Lack of response from the client</li>
            </ul>
            <p>
              If a project is delayed due to the client for a long period, Pixenox may pause the project, revise the timeline, revise pricing, or require a restart fee.
            </p>
          </section>

          {/* 10. Timelines and Delivery */}
          <section className="legal-section">
            <h2>10. Timelines and Delivery</h2>
            <p>Pixenox will make reasonable efforts to complete projects within the agreed timeline.</p>
            <p>However, timelines are estimates unless expressly stated as fixed in a written agreement.</p>
            <p>Timelines may change due to:</p>
            <ul>
              <li>Scope changes</li>
              <li>Client delays</li>
              <li>Third-party service issues</li>
              <li>Technical complexity</li>
              <li>Bugs or unexpected development issues</li>
              <li>Delayed approvals</li>
              <li>Payment delays</li>
              <li>Force majeure events</li>
              <li>Additional client requests</li>
            </ul>
            <p>Pixenox is not liable for delays caused by factors outside its reasonable control.</p>
          </section>

          {/* 11. Revisions */}
          <section className="legal-section">
            <h2>11. Revisions</h2>
            <p>The number of revisions included in a project will be mentioned in the proposal or agreement.</p>
            <p>
              If the proposal does not mention revision limits, Pixenox may provide reasonable minor revisions at its discretion.
            </p>
            <p>Revisions do not include:</p>
            <ul>
              <li>Complete redesigns</li>
              <li>New features</li>
              <li>New page structures</li>
              <li>Change in business model</li>
              <li>Change in project direction</li>
              <li>Major content rewriting</li>
              <li>New integrations</li>
              <li>Rework caused by late client changes</li>
              <li>Work outside the approved scope</li>
            </ul>
            <p>Additional revisions may be charged separately.</p>
          </section>

          {/* 12. Payments */}
          <section className="legal-section">
            <h2>12. Payments</h2>
            <p>Payment terms will be defined in the applicable proposal, invoice, agreement, or written communication.</p>
            <p>Pixenox may require:</p>
            <ul>
              <li>Advance payment</li>
              <li>Milestone-based payments</li>
              <li>Monthly retainers</li>
              <li>One-time project fees</li>
              <li>Maintenance fees</li>
              <li>Consultation fees</li>
              <li>Subscription fees</li>
              <li>Third-party cost reimbursement</li>
            </ul>
            <p>Unless otherwise agreed in writing, work may begin only after the required advance payment is received.</p>
          </section>

          {/* 13. Taxes and Charges */}
          <section className="legal-section">
            <h2>13. Taxes and Charges</h2>
            <p>All fees are exclusive of applicable taxes unless clearly stated otherwise.</p>
            <p>
              The client is responsible for paying applicable GST, taxes, government charges, transaction fees, currency conversion fees, bank charges, and payment gateway charges, unless otherwise agreed in writing.
            </p>
          </section>

          {/* 14. Late Payments */}
          <section className="legal-section">
            <h2>14. Late Payments</h2>
            <p>Late payments may result in:</p>
            <ul>
              <li>Project delay</li>
              <li>Suspension of work</li>
              <li>Suspension of support</li>
              <li>Withholding of deliverables</li>
              <li>Delay in deployment</li>
              <li>Additional restart charges</li>
              <li>Late payment charges, if mentioned in the agreement</li>
              <li>Termination of services</li>
            </ul>
            <p>
              Pixenox is not responsible for any loss, delay, downtime, or business impact caused by non-payment or delayed payment by the client.
            </p>
          </section>

          {/* 15. Refund and Cancellation Policy */}
          <section className="legal-section">
            <h2>15. Refund and Cancellation Policy</h2>
            <p>
              Payments made for completed work, consultation, discovery, strategy, planning, documentation, design, development, testing, deployment, or third-party costs are non-refundable unless expressly stated in writing.
            </p>
            <p>If a client cancels a project after work has started, Pixenox may charge for:</p>
            <ul>
              <li>Work completed</li>
              <li>Time spent</li>
              <li>Resources allocated</li>
              <li>Research completed</li>
              <li>Strategy created</li>
              <li>Design work completed</li>
              <li>Development work completed</li>
              <li>Third-party costs incurred</li>
              <li>Administrative effort</li>
              <li>Opportunity cost</li>
            </ul>
            <p>Refunds, if any, will be provided only according to the written proposal, invoice, or agreement.</p>
          </section>

          {/* 16. Third-Party Tools and Services */}
          <section className="legal-section">
            <h2>16. Third-Party Tools and Services</h2>
            <p>Projects may require third-party platforms, services, or tools, including:</p>
            <ul>
              <li>Hosting providers</li>
              <li>Domain registrars</li>
              <li>Cloud platforms</li>
              <li>APIs</li>
              <li>Payment gateways</li>
              <li>CRM systems</li>
              <li>Email services</li>
              <li>SMS/WhatsApp gateways</li>
              <li>AI APIs</li>
              <li>Analytics tools</li>
              <li>Plugins</li>
              <li>SaaS subscriptions</li>
              <li>Stock assets</li>
              <li>Fonts</li>
              <li>Security tools</li>
              <li>Automation tools</li>
            </ul>
            <p>Unless clearly included in the written proposal, third-party costs are the client&rsquo;s responsibility.</p>
            <p>
              Pixenox is not responsible for downtime, price changes, policy changes, suspension, rejection, data loss, API changes, integration failure, account bans, or service interruption caused by third-party providers.
            </p>
          </section>

          {/* 17. Hosting, Domains, and Accounts */}
          <section className="legal-section">
            <h2>17. Hosting, Domains, and Accounts</h2>
            <p>
              Unless otherwise agreed, the client is responsible for owning and maintaining their domain, hosting, cloud account, payment gateway account, email account, and third-party service accounts.
            </p>
            <p>
              Pixenox may assist in setup, configuration, or management, but ownership and payment responsibility remain with the client unless agreed otherwise.
            </p>
            <p>
              Clients should avoid giving unnecessary access and should change credentials after project completion if required.
            </p>
          </section>

          {/* 18. Content and Legal Compliance */}
          <section className="legal-section">
            <h2>18. Content and Legal Compliance</h2>
            <p>
              The client is responsible for ensuring that all content, materials, images, videos, documents, brand assets, logos, data, claims, testimonials, and information provided to Pixenox are accurate, lawful, properly licensed, and do not violate third-party rights.
            </p>
            <p>Pixenox is not responsible for legal issues arising from client-provided content, including:</p>
            <ul>
              <li>Copyright violation</li>
              <li>Trademark violation</li>
              <li>False claims</li>
              <li>Misleading advertisements</li>
              <li>Regulatory violations</li>
              <li>Unlicensed images</li>
              <li>Plagiarized content</li>
              <li>Illegal business activity</li>
              <li>Defamatory or harmful content</li>
            </ul>
            <p>
              The client agrees to indemnify Pixenox against claims arising from materials provided by the client.
            </p>
          </section>

          {/* 19. Intellectual Property — Website */}
          <section className="legal-section">
            <h2>19. Intellectual Property &mdash; Website</h2>
            <p>
              All content on the Pixenox website, including text, graphics, logos, layouts, visuals, UI elements, design, source code, brand assets, icons, animations, and written content, belongs to Pixenox Solutions Pvt Ltd unless otherwise stated.
            </p>
            <p>
              You may not copy, reproduce, modify, distribute, sell, or use Pixenox website content without written permission.
            </p>
          </section>

          {/* 20. Intellectual Property — Client Projects */}
          <section className="legal-section">
            <h2>20. Intellectual Property &mdash; Client Projects</h2>
            <p>
              Ownership of client project deliverables will be governed by the applicable proposal, invoice, service agreement, statement of work, or written contract.
            </p>
            <p>Unless expressly agreed otherwise:</p>
            <ul>
              <li>Client ownership of agreed final deliverables transfers only after full payment is received.</li>
              <li>Pixenox retains ownership of its pre-existing tools, frameworks, templates, reusable code, internal systems, libraries, workflows, methods, know-how, documentation structures, development processes, generic components, and background intellectual property.</li>
              <li>Pixenox may reuse general knowledge, skills, experience, ideas, methods, and non-client-specific components gained during project work.</li>
              <li>Source files, raw design files, editable files, internal documentation, code libraries, and backend systems are provided only if included in the agreed scope.</li>
            </ul>
          </section>

          {/* 21. Pre-Existing Materials */}
          <section className="legal-section">
            <h2>21. Pre-Existing Materials</h2>
            <p>
              Pixenox may use pre-existing materials, reusable components, frameworks, templates, code snippets, UI patterns, libraries, internal tools, automation workflows, and development processes to deliver projects efficiently.
            </p>
            <p>
              Such pre-existing materials remain the property of Pixenox or their respective owners unless expressly transferred in writing.
            </p>
            <p>
              The client receives only the rights specifically granted in the applicable project agreement.
            </p>
          </section>

          {/* 22. Open-Source and Third-Party Components */}
          <section className="legal-section">
            <h2>22. Open-Source and Third-Party Components</h2>
            <p>
              Projects may include open-source software, third-party libraries, frameworks, plugins, APIs, or tools.
            </p>
            <p>Such components are governed by their respective licenses and terms.</p>
            <p>
              Pixenox is not responsible for restrictions, vulnerabilities, license changes, or obligations imposed by third-party or open-source components beyond what is reasonably known during development.
            </p>
          </section>

          {/* 23. Portfolio and Case Study Usage */}
          <section className="legal-section">
            <h2>23. Portfolio and Case Study Usage</h2>
            <p>
              Unless restricted by a written agreement, Pixenox may mention completed work in its portfolio, website, proposals, social media, pitch decks, case studies, or marketing material.
            </p>
            <p>
              Pixenox will not publicly disclose sensitive data, private credentials, confidential business information, or protected client data.
            </p>
            <p>
              Clients may request confidentiality, white-label restrictions, or portfolio exclusion in writing before project commencement.
            </p>
          </section>

          {/* 24. Confidentiality */}
          <section className="legal-section">
            <h2>24. Confidentiality</h2>
            <p>
              Pixenox will treat client information, business discussions, project documents, credentials, technical details, and non-public project information as confidential.
            </p>
            <p>Confidential information does not include information that:</p>
            <ul>
              <li>Is publicly available</li>
              <li>Was already known before disclosure</li>
              <li>Is independently developed without using confidential information</li>
              <li>Is received from a third party legally</li>
              <li>Must be disclosed by law, court order, or government authority</li>
            </ul>
            <p>For highly sensitive projects, both parties should sign a separate Non-Disclosure Agreement.</p>
          </section>

          {/* 25. Privacy and Data Protection */}
          <section className="legal-section">
            <h2>25. Privacy and Data Protection</h2>
            <p>Pixenox handles personal information according to its Privacy Policy.</p>
            <p>
              For client projects involving customer data, user data, employee data, financial data, health data, or other regulated data, the client is responsible for informing Pixenox of applicable legal requirements before the project begins.
            </p>
            <p>Additional data protection agreements may be required for certain projects.</p>
          </section>

          {/* 26. AI and Automation Disclaimer */}
          <section className="legal-section">
            <h2>26. AI and Automation Disclaimer</h2>
            <p>
              Pixenox may provide AI systems, automation workflows, machine learning features, recommendation systems, chatbots, generative AI tools, analytics systems, or intelligent software solutions.
            </p>
            <p>
              AI-generated outputs, predictions, recommendations, classifications, summaries, insights, or automated decisions may not always be accurate, complete, unbiased, reliable, or suitable for every use case.
            </p>
            <p>
              Clients are responsible for reviewing, validating, and approving AI outputs before relying on them for business-critical, financial, medical, legal, compliance, hiring, insurance, lending, or safety-related decisions.
            </p>
            <p>
              Pixenox does not guarantee that AI systems will be error-free, bias-free, or suitable for every situation unless specifically agreed in writing with defined testing and acceptance criteria.
            </p>
          </section>

          {/* 27. SEO, AEO, GEO, Marketing, and Growth Disclaimer */}
          <section className="legal-section">
            <h2>27. SEO, AEO, GEO, Marketing, and Growth Disclaimer</h2>
            <p>
              Pixenox may provide SEO, AEO, GEO, optimization, digital marketing, growth consulting, analytics, or content-related services.
            </p>
            <p>Pixenox does not guarantee:</p>
            <ul>
              <li>Specific Google ranking</li>
              <li>AI search visibility</li>
              <li>Traffic increase</li>
              <li>Revenue growth</li>
              <li>Lead generation volume</li>
              <li>Sales conversion</li>
              <li>Funding approval</li>
              <li>Investor response</li>
              <li>Social media growth</li>
              <li>Platform approval</li>
              <li>Viral content performance</li>
              <li>Exact ROI</li>
            </ul>
            <p>
              Search engines, AI platforms, social media platforms, ad networks, and third-party systems are controlled by external companies. Their algorithms, policies, and results may change at any time.
            </p>
          </section>

          {/* 28. No Guarantee of Business Results */}
          <section className="legal-section">
            <h2>28. No Guarantee of Business Results</h2>
            <p>
              Pixenox provides technology, strategy, design, development, consulting, and optimization services.
            </p>
            <p>However, business results depend on many factors outside Pixenox&rsquo;s control, including:</p>
            <ul>
              <li>Market demand</li>
              <li>Client offer</li>
              <li>Pricing</li>
              <li>Sales process</li>
              <li>Brand trust</li>
              <li>Customer behavior</li>
              <li>Competition</li>
              <li>Ad budget</li>
              <li>Product quality</li>
              <li>Client operations</li>
              <li>External platform policies</li>
              <li>Economic conditions</li>
            </ul>
            <p>
              Pixenox does not guarantee specific revenue, profit, leads, funding, donations, user acquisition, ranking, or business success unless expressly agreed in writing.
            </p>
          </section>

          {/* 29. Website and Service Availability */}
          <section className="legal-section">
            <h2>29. Website and Service Availability</h2>
            <p>
              Pixenox aims to keep its website and services available, but we do not guarantee uninterrupted access.
            </p>
            <p>Website or service access may be affected by:</p>
            <ul>
              <li>Maintenance</li>
              <li>Hosting issues</li>
              <li>Third-party downtime</li>
              <li>Cyberattacks</li>
              <li>Technical failures</li>
              <li>Internet outages</li>
              <li>Software bugs</li>
              <li>Force majeure events</li>
              <li>Security updates</li>
            </ul>
            <p>Pixenox is not liable for temporary unavailability of the website or services.</p>
          </section>

          {/* 30. Security and Prohibited Access */}
          <section className="legal-section">
            <h2>30. Security and Prohibited Access</h2>
            <p>You must not attempt to:</p>
            <ul>
              <li>Access restricted areas</li>
              <li>Access admin panels</li>
              <li>Access APIs without permission</li>
              <li>Access databases</li>
              <li>Bypass authentication</li>
              <li>Test vulnerabilities without authorization</li>
              <li>Upload malware</li>
              <li>Perform brute-force attacks</li>
              <li>Scrape the website aggressively</li>
              <li>Interfere with website operations</li>
              <li>Reverse engineer systems</li>
              <li>Exploit bugs</li>
              <li>Copy protected content</li>
              <li>Use Pixenox systems for illegal purposes</li>
            </ul>
            <p>Unauthorized access or attempted access may result in legal action.</p>
          </section>

          {/* 31. User Conduct */}
          <section className="legal-section">
            <h2>31. User Conduct</h2>
            <p>When using our website or services, you agree not to:</p>
            <ul>
              <li>Provide false information</li>
              <li>Impersonate another person or company</li>
              <li>Submit harmful, illegal, abusive, defamatory, or misleading content</li>
              <li>Violate intellectual property rights</li>
              <li>Use our services for unlawful purposes</li>
              <li>Attempt to disrupt our systems</li>
              <li>Misuse communication channels</li>
              <li>Send spam or malicious files</li>
              <li>Share credentials unlawfully</li>
              <li>Use Pixenox deliverables for illegal activities</li>
            </ul>
          </section>

          {/* 32. Client Approval and Acceptance */}
          <section className="legal-section">
            <h2>32. Client Approval and Acceptance</h2>
            <p>A deliverable may be considered accepted if:</p>
            <ul>
              <li>The client gives written approval</li>
              <li>The client uses the deliverable publicly</li>
              <li>The client deploys the deliverable</li>
              <li>The client fails to provide feedback within the agreed review period</li>
              <li>The client makes payment for the related milestone</li>
              <li>The client requests further work based on the deliverable</li>
            </ul>
            <p>After approval, major changes may be treated as additional work.</p>
          </section>

          {/* 33. Maintenance and Support */}
          <section className="legal-section">
            <h2>33. Maintenance and Support</h2>
            <p>
              Maintenance, updates, bug fixes, backups, monitoring, security patches, and technical support are included only if mentioned in the proposal or agreement.
            </p>
            <p>If maintenance is not included, Pixenox is not responsible for:</p>
            <ul>
              <li>Future bugs caused by third-party updates</li>
              <li>Hosting issues</li>
              <li>Domain expiry</li>
              <li>Plugin conflicts</li>
              <li>API changes</li>
              <li>Security patches</li>
              <li>Content updates</li>
              <li>Platform changes</li>
              <li>User errors</li>
              <li>Data loss after handover</li>
              <li>Website downtime after completion</li>
            </ul>
            <p>Ongoing support may require a separate maintenance plan or retainer.</p>
          </section>

          {/* 34. Handover */}
          <section className="legal-section">
            <h2>34. Handover</h2>
            <p>Final handover may include agreed deliverables such as:</p>
            <ul>
              <li>Website access</li>
              <li>Source code</li>
              <li>Design files</li>
              <li>Documentation</li>
              <li>Deployment details</li>
              <li>Admin credentials</li>
              <li>Hosting guidance</li>
              <li>Basic usage instructions</li>
            </ul>
            <p>Only the deliverables specifically included in the agreed scope will be handed over.</p>
            <p>
              Pixenox may withhold final deliverables, source files, credentials, or deployment until full payment is received.
            </p>
          </section>

          {/* 35. Backups and Data Loss */}
          <section className="legal-section">
            <h2>35. Backups and Data Loss</h2>
            <p>
              Unless specifically included in a maintenance agreement, the client is responsible for maintaining backups after project handover.
            </p>
            <p>Pixenox is not responsible for data loss caused by:</p>
            <ul>
              <li>Client actions</li>
              <li>Hosting failure</li>
              <li>Third-party service failure</li>
              <li>Expired accounts</li>
              <li>Unpaid subscriptions</li>
              <li>Deleted files</li>
              <li>Unauthorized access</li>
              <li>Weak passwords</li>
              <li>Lack of backups</li>
              <li>Post-handover changes by others</li>
            </ul>
          </section>

          {/* 36. Suspension of Services */}
          <section className="legal-section">
            <h2>36. Suspension of Services</h2>
            <p>Pixenox may suspend services if:</p>
            <ul>
              <li>Payment is delayed</li>
              <li>The client violates these Terms</li>
              <li>The client misuses services</li>
              <li>The client provides unlawful content</li>
              <li>The client fails to cooperate</li>
              <li>The project remains inactive due to client delay</li>
              <li>Continuing work may create legal, security, or ethical risk</li>
              <li>Third-party services are unavailable or unpaid</li>
            </ul>
            <p>Pixenox is not liable for losses caused by suspension due to client default or violation.</p>
          </section>

          {/* 37. Termination */}
          <section className="legal-section">
            <h2>37. Termination</h2>
            <p>Either party may terminate a project according to the applicable agreement.</p>
            <p>Pixenox may terminate or refuse service if:</p>
            <ul>
              <li>The client violates these Terms</li>
              <li>Payment is not made</li>
              <li>The client requests illegal or unethical work</li>
              <li>The client abuses Pixenox team members</li>
              <li>The client provides false or misleading information</li>
              <li>The client repeatedly delays approvals or inputs</li>
              <li>The project becomes legally, technically, or commercially unviable</li>
              <li>The client uses Pixenox work for harmful activities</li>
            </ul>
            <p>
              Upon termination, the client must pay for work completed, time spent, resources used, and third-party costs incurred up to the termination date.
            </p>
          </section>

          {/* 38. Limitation of Liability */}
          <section className="legal-section">
            <h2>38. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Pixenox Solutions Pvt Ltd will not be liable for:</p>
            <ul>
              <li>Indirect damages</li>
              <li>Incidental damages</li>
              <li>Special damages</li>
              <li>Consequential damages</li>
              <li>Loss of revenue</li>
              <li>Loss of profit</li>
              <li>Loss of business</li>
              <li>Loss of data</li>
              <li>Loss of goodwill</li>
              <li>Loss caused by third-party services</li>
              <li>Loss caused by client delay</li>
              <li>Loss caused by misuse of deliverables</li>
              <li>Loss caused by unauthorized changes after handover</li>
              <li>Loss caused by external platform changes</li>
            </ul>
            <p>
              Pixenox&rsquo;s total liability for any claim will not exceed the amount actually paid by the client to Pixenox for the specific service giving rise to the claim.
            </p>
          </section>

          {/* 39. Indemnity */}
          <section className="legal-section">
            <h2>39. Indemnity</h2>
            <p>
              The client agrees to indemnify and hold Pixenox, its directors, employees, contractors, partners, and affiliates harmless from claims, losses, damages, penalties, expenses, and legal costs arising from:
            </p>
            <ul>
              <li>Client-provided content</li>
              <li>Client-provided data</li>
              <li>Client-provided materials</li>
              <li>Violation of third-party rights</li>
              <li>Misuse of Pixenox deliverables</li>
              <li>Illegal business activity</li>
              <li>False or misleading claims</li>
              <li>Breach of these Terms</li>
              <li>Non-payment</li>
              <li>Unauthorized use of third-party tools</li>
              <li>Regulatory violations by the client</li>
              <li>Client&rsquo;s failure to obtain required permissions, licenses, or approvals</li>
            </ul>
          </section>

          {/* 40. Warranties Disclaimer */}
          <section className="legal-section">
            <h2>40. Warranties Disclaimer</h2>
            <p>Pixenox provides its website and services on a reasonable-effort basis.</p>
            <p>Except as expressly stated in writing, Pixenox does not provide warranties that:</p>
            <ul>
              <li>Services will be error-free</li>
              <li>Services will be uninterrupted</li>
              <li>Results will meet every expectation</li>
              <li>AI outputs will always be accurate</li>
              <li>Search rankings will improve</li>
              <li>Revenue will increase</li>
              <li>Leads will be generated</li>
              <li>Funding will be approved</li>
              <li>Any third-party platform will approve or maintain access</li>
              <li>The website or service will be free from all vulnerabilities</li>
            </ul>
          </section>

          {/* 41. Compliance Responsibility */}
          <section className="legal-section">
            <h2>41. Compliance Responsibility</h2>
            <p>
              The client is responsible for ensuring that their business, website, application, content, data handling, marketing claims, payment flows, and user-facing policies comply with applicable laws and regulations.
            </p>
            <p>
              Pixenox may assist with technical implementation, but Pixenox does not provide legal, tax, financial, medical, or regulatory advice unless expressly agreed in writing with qualified professionals.
            </p>
          </section>

          {/* 42. Force Majeure */}
          <section className="legal-section">
            <h2>42. Force Majeure</h2>
            <p>
              Pixenox will not be liable for delays or failure to perform caused by events beyond reasonable control, including:
            </p>
            <ul>
              <li>Natural disasters</li>
              <li>Internet outages</li>
              <li>Hosting failures</li>
              <li>Cyberattacks</li>
              <li>Government actions</li>
              <li>War</li>
              <li>Strikes</li>
              <li>Pandemics</li>
              <li>Power failures</li>
              <li>Third-party service failures</li>
              <li>Legal restrictions</li>
              <li>Platform outages</li>
            </ul>
          </section>

          {/* 43. Independent Contractor Relationship */}
          <section className="legal-section">
            <h2>43. Independent Contractor Relationship</h2>
            <p>Pixenox acts as an independent contractor.</p>
            <p>
              Nothing in these Terms creates an employment relationship, partnership, joint venture, agency relationship, franchise relationship, or legal representative relationship between Pixenox and the client unless expressly agreed in writing.
            </p>
          </section>

          {/* 44. No Exclusivity */}
          <section className="legal-section">
            <h2>44. No Exclusivity</h2>
            <p>
              Unless agreed in writing, Pixenox may provide services to other clients, including clients in similar industries.
            </p>
            <p>
              Pixenox will not misuse confidential client information, but general skills, experience, methods, and knowledge may be used across projects.
            </p>
          </section>

          {/* 45. Communication */}
          <section className="legal-section">
            <h2>45. Communication</h2>
            <p>Official communication may occur through:</p>
            <ul>
              <li>Email</li>
              <li>Project management tools</li>
              <li>Video meetings</li>
              <li>Written proposals</li>
              <li>Invoices</li>
              <li>Shared documents</li>
              <li>Approved messaging platforms</li>
            </ul>
            <p>
              Important project decisions, approvals, changes, scope confirmations, and payment matters should be confirmed in writing.
            </p>
          </section>

          {/* 46. Electronic Records */}
          <section className="legal-section">
            <h2>46. Electronic Records</h2>
            <p>
              Emails, electronic signatures, online approvals, project management records, invoices, and written digital communication may be treated as valid records of communication and agreement between Pixenox and the client.
            </p>
          </section>

          {/* 47. Changes to Terms */}
          <section className="legal-section">
            <h2>47. Changes to Terms</h2>
            <p>Pixenox may update these Terms from time to time.</p>
            <p>Changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date.</p>
            <p>
              Continued use of the website or services after changes are published means you accept the updated Terms.
            </p>
            <p>
              For active signed agreements, changes to these website Terms will not automatically override specific written project terms unless legally applicable or mutually agreed.
            </p>
          </section>

          {/* 48. Severability */}
          <section className="legal-section">
            <h2>48. Severability</h2>
            <p>
              If any part of these Terms is found invalid, illegal, or unenforceable, the remaining sections will continue to remain valid and enforceable.
            </p>
          </section>

          {/* 49. Waiver */}
          <section className="legal-section">
            <h2>49. Waiver</h2>
            <p>
              If Pixenox does not enforce any right or provision under these Terms immediately, it does not mean Pixenox waives that right.
            </p>
            <p>Any waiver must be in writing to be effective.</p>
          </section>

          {/* 50. Governing Law and Jurisdiction */}
          <section className="legal-section">
            <h2>50. Governing Law and Jurisdiction</h2>
            <p>These Terms are governed by the laws of India.</p>
            <p>
              Subject to applicable law, the courts located in East Godavari, Andhra Pradesh, India shall have exclusive jurisdiction over disputes arising from these Terms, the website, or Pixenox services.
            </p>
            <p>
              Before initiating formal legal action, both parties agree to attempt good-faith negotiation to resolve disputes.
            </p>
          </section>

          {/* 51. Contact */}
          <section className="legal-section">
            <h2>51. Contact</h2>
            <p>For questions about these Terms, contact:</p>
            <ul>
              <li><strong>Pixenox Solutions Pvt Ltd</strong></li>
              <li>Email: <a href="mailto:connect@pixenox.com" className="legal-link">connect@pixenox.com</a></li>
              <li>Website: <a href="https://www.pixenox.com" className="legal-link" target="_blank" rel="noopener noreferrer">www.pixenox.com</a></li>
              <li>Registered Office: H NO 1 1,SREENU RAJA, MAIN ROAD PRATHIPADU, Siripuram, Prathipadu, East Godavari- 533432, Andhra Pradesh</li>
              <li>CIN: U62091AP2026PTC125091</li>
            </ul>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link href="/privacy" className="legal-nav-link">Privacy Policy &rarr;</Link>
          <Link href="/" className="legal-nav-link">&larr; Back to Home</Link>
        </div>
      </div>
    </article>
  );
}
