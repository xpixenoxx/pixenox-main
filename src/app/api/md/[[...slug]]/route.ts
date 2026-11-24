import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import { sortBlogPostsByDate } from '@/lib/blog-utils';
import { GLOSSARY_TERMS } from '@/lib/seo/glossary-terms';

export const revalidate = 3600;

function mdResponse(markdown: string, canonicalUrl: string): NextResponse {
  const tokenEstimate = Math.max(1, Math.ceil(markdown.length / 4));
  return new NextResponse(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      Vary: 'Accept',
      'X-Markdown-Tokens': String(tokenEstimate),
      Link: `<${canonicalUrl}>; rel="canonical"`,
      'Content-Signal': 'search=yes, ai-input=yes, ai-train=yes',
    },
  });
}

function notFoundMarkdown(path: string): NextResponse {
  return new NextResponse(`# 404 Not Found\n\nNo Markdown representation exists for \`${path}\`.\n`, {
    status: 404,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function formatTable(table?: string[][]): string {
  if (!Array.isArray(table) || table.length === 0) return '';
  const rows = table.filter((r) => Array.isArray(r) && r.length > 0);
  if (rows.length === 0) return '';
  const header = `| ${rows[0].map((c) => String(c).replace(/\|/g, '\\|')).join(' | ')} |`;
  const sep = `| ${rows[0].map(() => '---').join(' | ')} |`;
  const body = rows
    .slice(1)
    .map((row) => `| ${row.map((c) => String(c).replace(/\|/g, '\\|')).join(' | ')} |`)
    .join('\n');
  return [header, sep, body].filter(Boolean).join('\n');
}

function extractTextFromTipTap(node: unknown): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractTextFromTipTap).filter(Boolean).join('\n\n');
  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>;
    if (obj.type === 'text' && typeof obj.text === 'string') return obj.text;
    if (obj.type === 'heading' && Array.isArray(obj.content)) {
      const level = Math.min(4, Math.max(2, Number((obj.attrs as Record<string, unknown>)?.level || 2)));
      return `${'#'.repeat(level)} ${obj.content.map(extractTextFromTipTap).join('')}`;
    }
    if (obj.type === 'listItem' && Array.isArray(obj.content)) {
      return `- ${obj.content.map(extractTextFromTipTap).join(' ').replace(/\n+/g, ' ')}`;
    }
    if (Array.isArray(obj.content)) {
      return obj.content.map(extractTextFromTipTap).join(obj.type === 'doc' ? '\n\n' : '');
    }
  }
  return '';
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug = [] } = await context.params;
  const baseUrl = getCanonicalSiteUrl();
  const supabase = createPublicSupabaseClient();

  // 1. Homepage (/, /index)
  if (slug.length === 0 || (slug.length === 1 && slug[0] === 'index')) {
    const [{ data: services }, { data: homeFaqs }] = await Promise.all([
      supabase
        .from('services_cards')
        .select('title, page_slug, subheading, description')
        .eq('is_visible', true)
        .order('priority', { ascending: true }),
      supabase
        .from('home_faqs')
        .select('question, answer')
        .eq('is_visible', true)
        .order('priority', { ascending: true }),
    ]);

    const lines = [
      '---',
      'title: Pixenox — AI Systems, AI Visibility & Enterprise Intelligence Engineering',
      `canonical: ${baseUrl}/`,
      'entity: PIXENOX SOLUTIONS PRIVATE LIMITED (CIN: U62091AP2026PTC125091)',
      '---',
      '',
      '# Pixenox Solutions Private Limited',
      '',
      'Pixenox Solutions engineers production-grade autonomous AI systems, unified enterprise intelligence platforms, and AI visibility (GEO/AEO) infrastructure — makers of **Engenox** and **Unool**.',
      '',
      '## Three Core Engineering Disciplines',
      '',
      ...(services ?? []).map(
        (s: any) =>
          `- **[${s.title}](${baseUrl}/engineering/${s.page_slug})** ([.md](${baseUrl}/engineering/${s.page_slug}.md)): ${s.subheading || s.description}`
      ),
      '',
      '## Proprietary Products',
      '',
      `- **[Engenox by Pixenox](${baseUrl}/products/engenox)** ([.md](${baseUrl}/products/engenox.md)): Unified autonomous SEO, GEO & AEO Operating System for crawl governance, entity graphs, and AI citation intelligence.`,
      '- **[Unool](https://unool.co)**: One Link + One Click social publishing and creator link hub platform.',
      '',
      '## Developer & GEO Tools',
      '',
      `- **[Free AI Visibility & GEO Checker](${baseUrl}/tools/ai-visibility-checker)** ([.md](${baseUrl}/tools/ai-visibility-checker.md))`,
      `- **[Enterprise AI, GEO & AEO Glossary](${baseUrl}/glossary)** ([.md](${baseUrl}/glossary.md))`,
      '',
      '## Key Frequently Asked Questions',
      '',
      ...(homeFaqs ?? []).flatMap((f: any) => [`### ${f.question}`, '', f.answer, '']),
      `Contact: [Talk to Pixy](${baseUrl}/contact/pixy) | connect@pixenox.com`,
    ];

    return mdResponse(lines.join('\n'), `${baseUrl}/`);
  }

  // 2. Blog Index (/blog)
  if (slug.length === 1 && slug[0] === 'blog') {
    const { data: postsData } = await supabase
      .from('blog_posts')
      .select('slug, title, category, date, created_at, excerpt, priority')
      .eq('is_visible', true);
    const posts = sortBlogPostsByDate((postsData as any[]) ?? []);

    const lines = [
      '---',
      'title: Pixenox Engineering Insights & Research Blog',
      `canonical: ${baseUrl}/blog`,
      `total_articles: ${posts.length}`,
      '---',
      '',
      '# Pixenox Engineering Blog',
      '',
      'Deep architectural guides on Production AI Systems, Enterprise Intelligence Convergence, Technical SEO, GEO, and AEO.',
      '',
      ...posts.flatMap((p: any) => [
        `## ${p.title}`,
        `- Category: ${p.category || 'Engineering'} | Date: ${p.date || ''}`,
        `- Canonical HTML: ${baseUrl}/blog/${p.slug}`,
        `- Markdown Twin: ${baseUrl}/blog/${p.slug}.md`,
        '',
        p.excerpt || '',
        '',
      ]),
    ];

    return mdResponse(lines.join('\n'), `${baseUrl}/blog`);
  }

  // 3. Blog Post Detail (/blog/[slug])
  if (slug.length === 2 && slug[0] === 'blog') {
    const postSlug = slug[1];
    const { data: post } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', postSlug)
      .eq('is_visible', true)
      .maybeSingle();

    if (!post) return notFoundMarkdown(`/blog/${postSlug}`);

    const sections = Array.isArray((post as any).sections) ? (post as any).sections : [];
    const faqs = Array.isArray((post as any).faqs) ? (post as any).faqs : [];
    const canonical = `${baseUrl}/blog/${postSlug}`;

    const lines = [
      '---',
      `title: "${String((post as any).title).replace(/"/g, '\\"')}"`,
      `canonical: ${canonical}`,
      `category: ${(post as any).category || 'Engineering'}`,
      `published: ${(post as any).date || ''}`,
      'author: Muchakarla Sai Charan, Jagatha Hemanth Sai Ram',
      'entity: PIXENOX SOLUTIONS PRIVATE LIMITED',
      '---',
      '',
      `# ${(post as any).title}`,
      '',
      `> **Key Engineering Summary:** ${(post as any).excerpt || ''}`,
      '',
    ];

    for (const sec of sections) {
      if (!sec?.question?.trim() || !sec?.answer?.trim()) continue;
      lines.push(`## ${sec.question}`, '', sec.answer, '');
      const mdTable = formatTable(sec.table);
      if (mdTable) {
        lines.push(mdTable, '');
        if (sec.table_explanation) lines.push(`*${sec.table_explanation}*`, '');
      }
    }

    if ((post as any).ai_explanation) {
      lines.push('## AI Summary & Engineering Perspective', '', (post as any).ai_explanation, '');
    }

    if (faqs.length > 0) {
      lines.push('## Frequently Asked Questions', '');
      for (const f of faqs) {
        if (f?.question && f?.answer) lines.push(`### ${f.question}`, '', f.answer, '');
      }
    }

    lines.push('---', `Read canonical HTML version: ${canonical}`);
    return mdResponse(lines.join('\n'), canonical);
  }

  // 4. Engineering Hub (/engineering)
  if (slug.length === 1 && slug[0] === 'engineering') {
    const { data: services } = await supabase
      .from('services_cards')
      .select('title, page_slug, subheading, description, capabilities')
      .eq('is_visible', true)
      .order('priority', { ascending: true });

    const lines = [
      '---',
      'title: Pixenox Engineering Disciplines',
      `canonical: ${baseUrl}/engineering`,
      '---',
      '',
      '# Pixenox Engineering Capabilities',
      '',
      ...(services ?? []).flatMap((s: any) => [
        `## ${s.title}`,
        `- URL: ${baseUrl}/engineering/${s.page_slug}`,
        `- Markdown: ${baseUrl}/engineering/${s.page_slug}.md`,
        '',
        s.subheading || '',
        '',
        s.description || '',
        '',
        ...(Array.isArray(s.capabilities) ? s.capabilities.map((c: string) => `- ${c}`) : []),
        '',
      ]),
    ];

    return mdResponse(lines.join('\n'), `${baseUrl}/engineering`);
  }

  // 5. Engineering Pillar Detail (/engineering/[slug])
  if (slug.length === 2 && slug[0] === 'engineering') {
    const pillarSlug = slug[1];
    const { data: service } = await supabase
      .from('services_cards')
      .select('*')
      .eq('page_slug', pillarSlug)
      .eq('is_visible', true)
      .maybeSingle();

    if (!service) return notFoundMarkdown(`/engineering/${pillarSlug}`);

    const s = service as any;
    const canonical = `${baseUrl}/engineering/${pillarSlug}`;
    const lines = [
      '---',
      `title: "${String(s.title).replace(/"/g, '\\"')}"`,
      `canonical: ${canonical}`,
      '---',
      '',
      `# ${s.title}`,
      '',
      s.subheading ? `> ${s.subheading}\n` : '',
      s.description || '',
      '',
    ];

    if (Array.isArray(s.capabilities) && s.capabilities.length > 0) {
      lines.push('## Core Capabilities', '', ...s.capabilities.map((c: string) => `- ${c}`), '');
    }

    if (Array.isArray(s.what_you_get_items) && s.what_you_get_items.length > 0) {
      lines.push('## Deliverables & Sub-Capabilities', '');
      for (const item of s.what_you_get_items) {
        if (item?.title) lines.push(`- **${item.title}**: ${item.description || ''}`);
      }
      lines.push('');
    }

    if (Array.isArray(s.faqs) && s.faqs.length > 0) {
      lines.push('## Frequently Asked Questions', '');
      for (const f of s.faqs) {
        if (f?.question && f?.answer) lines.push(`### ${f.question}`, '', f.answer, '');
      }
    }

    return mdResponse(lines.join('\n'), canonical);
  }

  // 6. Sub-Capability Card Page (/engineering/[slug]/[cardSlug])
  if (slug.length === 3 && slug[0] === 'engineering') {
    const [, serviceSlug, cardSlug] = slug;
    const { data: card } = await supabase
      .from('engineering_card_pages')
      .select('*')
      .eq('service_slug', serviceSlug)
      .eq('card_slug', cardSlug)
      .maybeSingle();

    if (!card) return notFoundMarkdown(`/engineering/${serviceSlug}/${cardSlug}`);

    const c = card as any;
    const canonical = `${baseUrl}/engineering/${serviceSlug}/${cardSlug}`;
    const s3 = Array.isArray(c.section3_cards) ? c.section3_cards : [];
    const lines = [
      '---',
      `title: "${String(c.hero_title || cardSlug).replace(/"/g, '\\"')}"`,
      `canonical: ${canonical}`,
      `pillar: ${baseUrl}/engineering/${serviceSlug}`,
      '---',
      '',
      `# ${c.hero_title || cardSlug}`,
      '',
      c.hero_description || '',
      '',
      ...(c.section2_title ? [`## ${c.section2_title}`, '', c.section2_description || '', ''] : []),
      ...(s3.length > 0
        ? [
            '## Architecture Breakdown',
            '',
            ...s3.flatMap((x: any) => [`### ${x.title || ''}`, '', x.description || '', '']),
          ]
        : []),
    ];

    return mdResponse(lines.join('\n'), canonical);
  }

  // 7. Work / Reference Architectures (/work & /work/[slug])
  if (slug[0] === 'work' && slug.length <= 2) {
    if (slug.length === 1) {
      const { data: studies } = await supabase
        .from('case_studies')
        .select('slug, title, short_description, tags')
        .order('priority', { ascending: true });

      const lines = [
        '---',
        'title: Pixenox Reference Architectures',
        `canonical: ${baseUrl}/work`,
        '---',
        '',
        '# Reference Architectures & Engineering Blueprints',
        '',
        ...(studies ?? []).flatMap((st: any) => [
          `## ${st.title}`,
          `- Tags: ${Array.isArray(st.tags) && st.tags.length ? st.tags.join(', ') : 'Enterprise'} | URL: ${baseUrl}/work/${st.slug}`,
          '',
          st.short_description || '',
          '',
        ]),
      ];
      return mdResponse(lines.join('\n'), `${baseUrl}/work`);
    }

    const { data: study } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', slug[1])
      .maybeSingle();

    if (!study) return notFoundMarkdown(`/work/${slug[1]}`);

    const st = study as any;
    const canonical = `${baseUrl}/work/${slug[1]}`;
    const bodyMd = extractTextFromTipTap(st.body_content);
    const lines = [
      '---',
      `title: "${String(st.title).replace(/"/g, '\\"')}"`,
      `canonical: ${canonical}`,
      `tags: ${Array.isArray(st.tags) && st.tags.length ? st.tags.join(', ') : 'Enterprise'}`,
      '---',
      '',
      `# ${st.title}`,
      '',
      `> ${st.short_description || ''}`,
      '',
      bodyMd,
      '',
    ];
    return mdResponse(lines.join('\n'), canonical);
  }

  // 8. Engenox Product (/products/engenox)
  if (slug.length === 2 && slug[0] === 'products' && slug[1] === 'engenox') {
    const canonical = `${baseUrl}/products/engenox`;
    const md = [
      '---',
      'title: Engenox by Pixenox — Autonomous SEO, GEO & AEO Operating System',
      `canonical: ${canonical}`,
      'category: SoftwareApplication',
      'vendor: PIXENOX SOLUTIONS PRIVATE LIMITED',
      '---',
      '',
      '# Engenox by Pixenox',
      '',
      'Engenox is Pixenox Solutions’ proprietary autonomous SEO, Generative Engine Optimization (GEO), and Answer Engine Optimization (AEO) operating system engineered for crawl governance, Schema.org `@graph` entity orchestration, Markdown transport readiness, and real-time AI citation monitoring.',
      '',
      '## Four-Layer Architecture',
      '',
      '1. **Technical Crawl & Index Governance Layer**: Automated parity audits across SSR HTML, RFC 9309 `robots.txt` rules, `Content-Signal` directives, IndexNow push telemetry, and redirect-hop hygiene.',
      '2. **Entity & Schema.org `@graph` Layer**: Persistent `@id` linking across `Organization`, `Person`, `SoftwareApplication`, `Service`, `TechArticle`, and Wikidata URIs.',
      '3. **AEO & Markdown Transport Layer**: Automated answer-capsule structuring, `SpeakableSpecification` selectors, `llms.txt` v2 indexes, and `Accept: text/markdown` response rendering.',
      '4. **Multi-Engine AI Citation Intelligence Layer**: Empirical prompt telemetry across ChatGPT Search, Perplexity, Google AI Overviews, and Claude.',
      '',
      '## Comparison: Legacy SEO Suites vs. Engenox OS',
      '',
      '| Capability | Legacy Keyword SEO Suites | Engenox by Pixenox |',
      '| --- | --- | --- |',
      '| Primary Output | Keyword rank spreadsheets & PDF audits | Autonomous code-level SSR, Schema & transport governance |',
      '| AI Visibility Coverage | Keyword volume estimates only | Multi-engine prompt fan-out & citation tracking |',
      '| Entity Disambiguation | Disconnected per-page schema snippets | Unified persistent `@id` `@graph` with Wikidata anchors |',
      '| Agent Transport | HTML only | Native `Accept: text/markdown`, `.md` twins, and `llms.txt` v2 |',
      '',
      `Try our live diagnostic tool: [${baseUrl}/tools/ai-visibility-checker](${baseUrl}/tools/ai-visibility-checker)`,
    ].join('\n');
    return mdResponse(md, canonical);
  }

  // 9. Company (/company)
  if (slug.length === 1 && slug[0] === 'company') {
    const canonical = `${baseUrl}/company`;
    const md = [
      '---',
      'title: About Pixenox Solutions Private Limited',
      `canonical: ${canonical}`,
      'cin: U62091AP2026PTC125091',
      'incorporated: 2026-04-02',
      '---',
      '',
      '# About Pixenox Solutions Private Limited',
      '',
      '- **Legal Entity:** PIXENOX SOLUTIONS PRIVATE LIMITED',
      '- **CIN:** `U62091AP2026PTC125091` (RoC-Vijayawada, Andhra Pradesh, India)',
      '- **Founders & Directors:** Muchakarla Sai Charan, Jagatha Hemanth Sai Ram',
      '- **Contact:** `connect@pixenox.com`',
      `- **Website:** ${baseUrl}`,
      '',
      '## Core Engineering Disciplines',
      `- [Production AI Systems Engineering](${baseUrl}/engineering/ai-systems)`,
      `- [AI Visibility Engineering — GEO & AEO](${baseUrl}/engineering/ai-visibility)`,
      `- [Enterprise Intelligence Engineering](${baseUrl}/engineering/enterprise-intelligence-engineering)`,
      '',
      '## Products & Ecosystem Partners',
      `- **Engenox by Pixenox** (${baseUrl}/products/engenox): Autonomous SEO, GEO & AEO Operating System`,
      '- **Unool** (https://unool.co): One Link + One Click creator & social publishing platform',
      '- **Verified Ecosystem Partners:** Flowtaris (ERP & AI finance automation), Deynold Danny',
    ].join('\n');
    return mdResponse(md, canonical);
  }

  // 10. FAQs (/faqs)
  if (slug.length === 1 && slug[0] === 'faqs') {
    const { data: faqs } = await supabase
      .from('faqs')
      .select('question, answer')
      .eq('is_visible', true)
      .order('priority', { ascending: true });

    const canonical = `${baseUrl}/faqs`;
    const lines = [
      '---',
      'title: Pixenox Frequently Asked Questions',
      `canonical: ${canonical}`,
      '---',
      '',
      '# Pixenox Engineering & Product FAQs',
      '',
      ...(faqs ?? []).flatMap((f: any) => [`## ${f.question}`, '', f.answer, '']),
    ];
    return mdResponse(lines.join('\n'), canonical);
  }

  // 11. Glossary (/glossary)
  if (slug.length === 1 && slug[0] === 'glossary') {
    const canonical = `${baseUrl}/glossary`;
    const lines = [
      '---',
      'title: Enterprise AI, GEO & AEO Engineering Glossary',
      `canonical: ${canonical}`,
      `term_count: ${GLOSSARY_TERMS.length}`,
      '---',
      '',
      '# Enterprise AI, GEO & AEO Engineering Glossary',
      '',
      ...GLOSSARY_TERMS.flatMap((t) => [
        `## ${t.term}`,
        `- Category: ${t.category}`,
        `- Anchor: ${canonical}#${t.id}`,
        ...(t.wikidataUrl ? [`- Wikidata Entity: ${t.wikidataUrl}`] : []),
        '',
        t.definition,
        '',
        `**Why it matters:** ${t.whyItMatters}`,
        '',
      ]),
    ];
    return mdResponse(lines.join('\n'), canonical);
  }

  // 12. AI Visibility Checker Tool (/tools/ai-visibility-checker)
  if (slug.length === 2 && slug[0] === 'tools' && slug[1] === 'ai-visibility-checker') {
    const canonical = `${baseUrl}/tools/ai-visibility-checker`;
    const md = [
      '---',
      'title: Free AI Visibility & GEO Readiness Checker — Pixenox',
      `canonical: ${canonical}`,
      'api_endpoint: POST /api/tools/visibility-check',
      '---',
      '',
      '# Free AI Visibility & GEO Readiness Checker',
      '',
      'Run a live technical audit on any public website across 5 machine-readability and GEO/AEO dimensions:',
      '',
      '1. **Crawl & Bot Governance (25 pts):** HTTP 200 reachability, `robots.txt` presence, `OAI-SearchBot` / `GPTBot` / `Claude-SearchBot` / `PerplexityBot` permissions, RFC 9309 rule completeness, `Sitemap` declaration.',
      '2. **SSR & Extractability (25 pts):** Server-rendered word count, `<title>`, `<meta description>`, canonical tag, single `<h1>`, `max-image-preview:large`.',
      '3. **Schema & Entity Graph (20 pts):** JSON-LD `@type` coverage, Wikidata/external `sameAs` links, `SpeakableSpecification` detection.',
      '4. **2026 AI-Native Protocols (20 pts):** `/llms.txt` presence & `.md` links, `Accept: text/markdown` content negotiation, `Content-Signal` directives, `/.well-known/agent-card.json` (A2A), `<script type="speculationrules">`.',
      '5. **Discovery & Speed (10 pts):** Edge TTFB latency and RSS/Atom feed autodiscovery.',
      '',
      `Run live in browser: ${canonical}`,
    ].join('\n');
    return mdResponse(md, canonical);
  }

  return notFoundMarkdown(`/${slug.join('/')}`);
}
