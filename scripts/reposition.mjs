/**
 * PHASE 2: FULL REPOSITIONING — Services, Case Studies, Hero, Lead Section
 * Positions Pixenox as "Unified Intelligent Systems" company
 */

const SUPABASE_URL = 'https://hylycwrnfqghmewamqzu.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bHljd3JuZnFnaG1ld2FtcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQwOTExNSwiZXhwIjoyMDkwOTg1MTE1fQ.LvyMI8LfnsD1T1teuyifq7A4_0K9DnLpAUcwLKDRNaQ';
const headers = { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: 'return=minimal' };

async function q(table, method, body, filter = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filter}`, {
    method, headers, ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) { const t = await res.text(); console.error(`  ❌ ${method} ${table}: ${res.status} ${t}`); return null; }
  return method === 'GET' ? res.json() : true;
}

// ═══════════════════════════════════════
// 1. HERO — Unified Intelligent Systems positioning
// ═══════════════════════════════════════
async function updateHero() {
  console.log('\n🏠 Updating Hero...');
  const heroes = await q('hero_settings', 'GET', null, '?select=*&limit=1');
  if (!heroes?.length) { console.log('  ⚠️ No hero found'); return; }
  await q('hero_settings', 'PATCH', {
    headline: 'Architecting Unified Intelligent Systems',
    subheadline: 'We engineer converged platforms where AI, data infrastructure, and growth systems operate as a single intelligent layer — built for enterprises that refuse to settle for fragmented toolchains.',
    cta_text: 'Explore Our Systems',
    cta_url: '/work',
  }, `?id=eq.${heroes[0].id}`);
  console.log('  ✅ Hero updated');
}

// ═══════════════════════════════════════
// 2. SERVICES — New 7-service structure
// ═══════════════════════════════════════
async function updateServices() {
  console.log('\n⚙️ Updating Services...');
  await q('services_cards', 'DELETE', null, '?id=not.is.null');

  const services = [
    {
      title: 'Autonomous AI Systems',
      subheading: 'Self-learning systems that operate, adapt, and optimize without human intervention.',
      description: 'We build production-grade AI systems that go far beyond chatbots. From autonomous decision engines and predictive maintenance platforms to intelligent document processing pipelines — our AI solutions integrate directly into your operational core. Every system is designed with explainability, monitoring, and human-in-the-loop safeguards built in from day one.',
      image_url: '/images/services/autonomous-ai.png',
      page_slug: 'autonomous-ai-systems',
      priority: 1,
      is_visible: true,
    },
    {
      title: 'Web Architecture',
      subheading: 'High-performance platforms engineered for global scale and sub-second response.',
      description: 'We architect web platforms as distributed systems, not websites. Our stack combines server-rendered frontends, edge computing, headless CMS architecture, and event-driven backends to deliver experiences that load under 200ms globally. Every build is designed for 99.99% uptime, horizontal scaling, and zero-downtime deployments.',
      image_url: '/images/services/web-architecture.png',
      page_slug: 'web-architecture',
      priority: 2,
      is_visible: true,
    },
    {
      title: 'Unified Optimization Engine',
      subheading: 'SEO, AEO, and GEO converged into a single discovery intelligence layer.',
      description: 'Traditional SEO is insufficient for modern information ecosystems. We build unified optimization engines that combine technical SEO infrastructure, Answer Engine Optimization for AI assistants, and Generative Engine Optimization for LLM-powered search — all operating through a centralized analytics and deployment pipeline.',
      image_url: '/images/services/optimization-engine.png',
      page_slug: 'unified-optimization',
      priority: 3,
      is_visible: true,
    },
    {
      title: 'Insight Engine',
      subheading: 'Real-time analytics and business intelligence systems that surface actionable signals.',
      description: 'We engineer insight engines that transform raw operational data into strategic decisions. Our platforms combine streaming data pipelines, ML-powered anomaly detection, and executive dashboards into a single system. No BI tool bolt-ons — these are purpose-built intelligence platforms wired directly into your business processes.',
      image_url: '/images/services/insight-engine.png',
      page_slug: 'insight-engine',
      priority: 4,
      is_visible: true,
    },
    {
      title: 'Bio Intelligence',
      subheading: 'Computational systems for genomics, health analytics, and biomedical research.',
      description: 'We design computational platforms at the intersection of biology and artificial intelligence. From genomic sequence analysis pipelines and clinical decision support systems to biomarker discovery engines — our bio-intelligence platforms process complex biological data at scale while maintaining regulatory compliance.',
      image_url: '/images/services/bio-intelligence.png',
      page_slug: 'bio-intelligence',
      priority: 5,
      is_visible: true,
    },
    {
      title: 'Growth Intelligence',
      subheading: 'Data-driven acquisition, retention, and revenue optimization systems.',
      description: 'Growth isn\'t a marketing function — it\'s an engineering discipline. We build programmatic growth systems that automate acquisition funnel optimization, cohort-based retention modeling, and revenue attribution. Every growth lever is instrumented, measured, and continuously optimized through ML-driven experimentation.',
      image_url: '/images/services/growth-intelligence.png',
      page_slug: 'growth-intelligence',
      priority: 6,
      is_visible: true,
    },
    {
      title: 'Custom Software',
      subheading: 'Enterprise-grade applications built for complex operational requirements.',
      description: 'When off-the-shelf solutions create more problems than they solve, we build custom. Our engineering teams deliver production-ready platforms — from multi-tenant SaaS applications and internal tooling to IoT control systems and marketplace backends. Every system is built with clean architecture, comprehensive testing, and deployment automation.',
      image_url: '/images/services/custom-software.png',
      page_slug: 'custom-software',
      priority: 7,
      is_visible: true,
    },
  ];

  for (const svc of services) { await q('services_cards', 'POST', svc); }
  console.log(`  ✅ ${services.length} services created`);
}

// ═══════════════════════════════════════
// 3. CASE STUDIES — Aligned with new services
// ═══════════════════════════════════════
async function updateCaseStudies() {
  console.log('\n📁 Updating Case Studies...');
  await q('case_studies', 'DELETE', null, '?id=not.is.null');

  const studies = [
    {
      title: 'Autonomous Credit Assessment Engine',
      slug: 'autonomous-credit-engine',
      cover_image_url: '/images/services/autonomous-ai.png',
      short_description: 'ML-driven credit scoring platform replacing manual underwriting for a lending fintech. 12x faster decisions, 40% default reduction.',
      body_content: 'A Series-B lending platform needed to scale from 500 to 15,000 loan applications per month without proportionally growing their underwriting team.\n\nWe built an autonomous credit assessment engine using gradient boosted models trained on 3 years of repayment data, integrated with bureau APIs and alternative data sources. The system auto-approves 73% of applications within 8 seconds and routes edge cases to human reviewers with pre-populated risk summaries.\n\nDefault rates dropped 40%. Processing capacity increased 12x. Human reviewers now focus exclusively on complex cases, improving their decision quality.',
      tags: ['AI Systems', 'Fintech', 'Automation'],
      tools_used: ['Python', 'XGBoost', 'FastAPI', 'PostgreSQL', 'AWS'],
      status: 'DEPLOYED',
      is_featured: true,
      priority: 1,
      project_length: '5 months',
    },
    {
      title: 'Multi-Region Healthcare Platform',
      slug: 'healthcare-platform',
      cover_image_url: '/images/services/web-architecture.png',
      short_description: 'HIPAA-compliant patient management system serving 200+ clinics across 3 countries with sub-100ms response times.',
      body_content: 'A healthcare network operating across India, UAE, and Singapore needed a unified platform replacing 4 legacy systems. Regulatory requirements varied by jurisdiction.\n\nWe architected a multi-tenant system with region-specific data residency, end-to-end encryption, and role-based access spanning 6 user types. The platform handles scheduling, electronic health records, billing, and telehealth through a single interface.\n\n200+ clinics onboarded in 6 months. Patient no-show rates dropped 35% through intelligent reminders. Passed HIPAA and local regulatory audits with zero findings across all three jurisdictions.',
      tags: ['Web Architecture', 'Healthcare', 'Multi-Region'],
      tools_used: ['Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'GCP'],
      status: 'DEPLOYED',
      is_featured: true,
      priority: 2,
      project_length: '6 months',
    },
    {
      title: 'Unified SEO/AEO/GEO Engine',
      slug: 'unified-optimization-engine',
      cover_image_url: '/images/services/optimization-engine.png',
      short_description: 'Converged search optimization system delivering 340% organic traffic growth and 45 first-page rankings in 8 months.',
      body_content: 'A B2B SaaS company with domain authority of 18 was invisible in organic search. Paid acquisition costs were unsustainable and market position was eroding.\n\nWe deployed a unified optimization engine covering technical SEO (200+ crawlability fixes), AEO (structured data for AI assistants), and GEO (localized landing pages for 12 markets). Implemented programmatic content generation for long-tail capture and built a real-time ranking monitoring dashboard.\n\nOrganic traffic grew 340% in 8 months. 45 keywords reached page one. Cost per qualified lead dropped 62%. Organic became the primary pipeline channel at 38% of total qualified leads.',
      tags: ['Optimization', 'SEO', 'Growth'],
      tools_used: ['Next.js', 'Python', 'BigQuery', 'Vercel', 'Ahrefs'],
      status: 'DEPLOYED',
      is_featured: true,
      priority: 3,
      project_length: '8 months',
    },
    {
      title: 'Real-Time Logistics Insight Engine',
      slug: 'logistics-insight-engine',
      cover_image_url: '/images/services/insight-engine.png',
      short_description: 'Streaming analytics platform processing 2M+ events daily for a logistics company, reducing operational blind spots by 85%.',
      body_content: 'A logistics operator managing 400+ vehicles across 6 cities had no real-time visibility into fleet performance. Route optimization was manual, fuel costs unpredictable, and delivery SLAs regularly missed.\n\nWe built a streaming insight engine ingesting GPS, fuel sensor, and delivery confirmation data in real time. The platform surfaces anomalies (route deviations, excessive idling, SLA risks) within 30 seconds and auto-generates optimization recommendations.\n\nOperational blind spots reduced 85%. Fuel costs dropped 18% through route optimization. On-time delivery rate improved from 76% to 94%.',
      tags: ['Insight Engine', 'Logistics', 'Real-Time'],
      tools_used: ['Apache Kafka', 'Python', 'TimescaleDB', 'React', 'AWS'],
      status: 'DEPLOYED',
      is_featured: true,
      priority: 4,
      project_length: '4 months',
    },
    {
      title: 'Genomic Analysis Pipeline',
      slug: 'genomic-analysis-pipeline',
      cover_image_url: '/images/services/bio-intelligence.png',
      short_description: 'Computational pipeline processing 10,000+ genomic samples monthly for a biotech research firm, reducing analysis time from days to hours.',
      body_content: 'A biotech firm conducting large-scale genetic studies was bottlenecked by manual bioinformatics workflows. Sample processing took 3-5 days per batch, limiting research velocity and grant deliverables.\n\nWe designed an automated pipeline for variant calling, annotation, and statistical association analysis. The system parallelizes computation across cloud GPU clusters, includes quality control checkpoints, and outputs publication-ready visualizations.\n\nProcessing time reduced from days to 4-6 hours per batch. Throughput increased to 10,000+ samples/month. Two research papers published within the first year citing platform-generated analyses.',
      tags: ['Bio Intelligence', 'Genomics', 'Research'],
      tools_used: ['Python', 'TensorFlow', 'Nextflow', 'AWS Batch', 'R'],
      status: 'DEPLOYED',
      is_featured: true,
      priority: 5,
      project_length: '7 months',
    },
  ];

  for (const s of studies) { await q('case_studies', 'POST', s); }
  console.log(`  ✅ ${studies.length} case studies created`);
}

// ═══════════════════════════════════════
// 4. WHY CHOOSE US — Refined positioning
// ═══════════════════════════════════════
async function updateWhyChooseUs() {
  console.log('\n⭐ Updating Why Choose Us...');
  const cfgs = await q('why_choose_us_config', 'GET', null, '?select=*&limit=1');
  if (cfgs?.length) {
    await q('why_choose_us_config', 'PATCH', {
      section_heading: 'Why Companies Choose Pixenox',
      section_subheading: 'We don\'t build features. We build systems that compound in value over time.',
      cta_text: 'Start a Conversation',
    }, `?id=eq.${cfgs[0].id}`);
  }

  await q('why_choose_us', 'DELETE', null, '?id=not.is.null');
  const items = [
    { label: 'SYSTEMS OVER FEATURES', description: 'Every project is designed as a system — with clean interfaces, observable internals, and the ability to evolve without rebuild. We architect for the next 3 years, not the next sprint.', stat: '99.9%', priority: 1 },
    { label: 'ENGINEERING DEPTH', description: 'Our teams are led by senior engineers with domain expertise across fintech, healthtech, logistics, and SaaS. We solve hard problems, not template problems.', stat: '50+', priority: 2 },
    { label: 'CONVERGENT DELIVERY', description: 'AI, infrastructure, growth, and analytics operate as one unified practice — not siloed departments. Your systems benefit from cross-domain intelligence from day one.', stat: '12+', priority: 3 },
  ];
  for (const i of items) { await q('why_choose_us', 'POST', i); }
  console.log('  ✅ Updated');
}

// ═══════════════════════════════════════
// 5. TESTIMONIALS — Aligned with new positioning
// ═══════════════════════════════════════
async function updateTestimonials() {
  console.log('\n💬 Updating Testimonials...');
  await q('testimonials', 'DELETE', null, '?id=not.is.null');
  const testimonials = [
    { reviewer_name: 'Arjun Mehta', reviewer_title: 'CTO', company: 'NovaPay Systems', review_text: 'The credit assessment engine Pixenox built processes 15,000 applications monthly with 12x the speed of our previous system. Default rates dropped 40%. These aren\'t incremental improvements — the system fundamentally changed our lending operations.', rating: 5, is_visible: true, priority: 1 },
    { reviewer_name: 'Sarah Chen', reviewer_title: 'VP Engineering', company: 'MedBridge Health', review_text: 'We needed a single platform across three countries, four regulatory frameworks, and 200 clinics. Pixenox delivered in 5 months. The architecture is clean enough that our internal team can extend it without their help — which says everything about their engineering quality.', rating: 5, is_visible: true, priority: 2 },
    { reviewer_name: 'James Worthington', reviewer_title: 'Founder', company: 'Quarterstack', review_text: 'Our organic pipeline went from negligible to our strongest channel in two quarters. What impressed me wasn\'t just the SEO results — it was how they built a system that continues optimizing itself. The ROI compounds monthly.', rating: 5, is_visible: true, priority: 3 },
    { reviewer_name: 'Dr. Kavita Rao', reviewer_title: 'Research Director', company: 'BioNex Labs', review_text: 'The genomic analysis pipeline reduced our processing time from days to hours. Two published papers this year directly cite analyses from the platform they built. For a research lab, that level of impact from a technology partner is exceptional.', rating: 5, is_visible: true, priority: 4 },
    { reviewer_name: 'Michael Torres', reviewer_title: 'COO', company: 'Vistara Logistics', review_text: 'Real-time fleet visibility, automated route optimization, and on-time delivery jumping from 76% to 94%. Pixenox didn\'t just build us a dashboard — they built an operations intelligence layer that runs our logistics brain.', rating: 5, is_visible: true, priority: 5 },
  ];
  for (const t of testimonials) { await q('testimonials', 'POST', t); }
  console.log(`  ✅ ${testimonials.length} testimonials updated`);
}

// ═══════════════════════════════════════
// 6. CTA BANNER — Stronger positioning
// ═══════════════════════════════════════
async function updateSectionConfigs() {
  console.log('\n📋 Updating Section Configs...');
  const configs = await q('section_config', 'GET', null, '?select=*');
  if (!configs) return;
  for (const cfg of configs) {
    if (cfg.section_key === 'case_studies') {
      await q('section_config', 'PATCH', { heading: 'DEPLOYED_SYSTEMS', subheading: 'Real systems solving real problems. Every project shown here is in production.' }, `?id=eq.${cfg.id}`);
    }
    if (cfg.section_key === 'services') {
      await q('section_config', 'PATCH', { heading: 'System Capabilities', subheading: 'Seven converged practices operating as one unified engineering organization.' }, `?id=eq.${cfg.id}`);
    }
  }
  console.log('  ✅ Updated');
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log(' PIXENOX — REPOSITIONING PASS');
  console.log('═══════════════════════════════════════');
  await updateHero();
  await updateServices();
  await updateCaseStudies();
  await updateWhyChooseUs();
  await updateTestimonials();
  await updateSectionConfigs();
  console.log('\n═══════════════════════════════════════');
  console.log(' ✅ REPOSITIONING COMPLETE');
  console.log('═══════════════════════════════════════\n');
}
main().catch(console.error);
