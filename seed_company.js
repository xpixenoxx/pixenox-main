/**
 * seed_company.js — Seeds ALL Company page data into Supabase
 * Adapted from antimatterai.com/company with Pixenox branding
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('🚀 Seeding Company page data...\n');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. PAGE HERO CONFIG — Company hero split layout
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('  → page_hero_config (company)...');
  await supabase.from('page_hero_config').delete().eq('page', 'company');
  const { error: heroErr } = await supabase.from('page_hero_config').insert({
    page: 'company',
    heading: 'STARTUPS DREAM BIG.\nPIXENOX MAKES IT REAL.',
    heading_font_family: null,
    heading_font_size: null,
    heading_font_weight: '500',
    heading_letter_spacing: '0.05em',
    heading_color: 'rgba(255,255,255,0.5)',
    subheading: "We're a design-led digital studio turning complex challenges into measurable results.",
    subheading_font_family: null,
    subheading_font_size: null,
    subheading_font_weight: '500',
    subheading_color: '#fff',
    bg_gradient_start: '#000000',
    bg_gradient_end: '#0a0015',
  });
  if (heroErr) console.error('    ✗ Hero error:', heroErr.message);
  else console.log('    ✓ Hero config inserted');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. COMPANY STORY — Scroll-painted paragraphs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('  → company_story...');
  await supabase.from('company_story').delete().neq('id', 'dummy123');
  const storyBlocks = [
    {
      text: 'Pixenox operates at the intersection of cutting-edge technology and transformative design.',
      block_font_family: '',
      block_font_size: '',
      block_font_weight: '',
      block_line_height: '',
      block_color: '',
      words: [],
    },
    {
      text: 'Founded by designers, engineers, and strategists, we set out to make technology accessible, human, and visually inspiring.',
      block_font_family: '',
      block_font_size: '',
      block_font_weight: '',
      block_line_height: '',
      block_color: '',
      words: [],
    },
  ];
  const { error: storyErr } = await supabase.from('company_story').insert({
    content_json: storyBlocks,
  });
  if (storyErr) console.error('    ✗ Story error:', storyErr.message);
  else console.log('    ✓ Story inserted');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. WHAT WE DO CARDS — 3-column editorial grid
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('  → what_we_do_cards...');
  await supabase.from('what_we_do_cards').delete().neq('title', 'dummy123');
  const whatWeDoCards = [
    {
      title: 'Design-First Innovation',
      description: 'Award-winning UI/UX and cinematic web experiences that set the standard for premium digital products.',
      icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
      priority: 1,
      is_visible: true,
    },
    {
      title: 'Engineering Excellence',
      description: 'Next.js, React, GSAP, Three.js, and scalable cloud architectures built for performance and reliability.',
      icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      priority: 2,
      is_visible: true,
    },
    {
      title: 'Real-World Impact',
      description: 'From healthcare to enterprise AI, our work drives measurable outcomes and transforms industries.',
      icon_svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      priority: 3,
      is_visible: true,
    },
  ];
  for (const card of whatWeDoCards) {
    const { error } = await supabase.from('what_we_do_cards').insert(card);
    if (error) console.error('    ✗ Card error:', error.message);
  }
  console.log('    ✓ 3 WhatWeDo cards inserted');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. HOW WE THINK CONFIG — Section header
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('  → how_we_think_config...');
  await supabase.from('how_we_think_config').delete().neq('id', 'dummy123');
  const { error: howErr } = await supabase.from('how_we_think_config').insert({
    section_heading: 'CORE BELIEFS',
    heading_font_family: null,
    heading_font_size: null,
    heading_font_weight: '600',
    heading_color: 'rgba(255,255,255,0.4)',
    section_subheading: "We don't just build products — we build momentum.",
    sub_font_family: null,
    sub_font_size: null,
    sub_color: '#fff',
  });
  if (howErr) console.error('    ✗ HowWeThink error:', howErr.message);
  else console.log('    ✓ HowWeThink config inserted');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. CORE BELIEFS — Numbered principles
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('  → core_beliefs...');
  await supabase.from('core_beliefs').delete().neq('title', 'dummy123');
  const beliefs = [
    {
      title: 'Design first, always.',
      description: 'Every product starts with empathy and storytelling.',
      priority: 1,
      is_visible: true,
    },
    {
      title: 'Technology should amplify humans,',
      description: 'not replace them.',
      priority: 2,
      is_visible: true,
    },
    {
      title: 'Innovation is only meaningful',
      description: 'when it drives real impact.',
      priority: 3,
      is_visible: true,
    },
    {
      title: 'We move fast —',
      description: 'but never at the cost of quality or integrity.',
      priority: 4,
      is_visible: true,
    },
  ];
  for (const b of beliefs) {
    const { error } = await supabase.from('core_beliefs').insert(b);
    if (error) console.error('    ✗ Belief error:', error.message);
  }
  console.log('    ✓ 4 Core Beliefs inserted');

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. CTA SECTION — "Let's build" closing
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('  → cta_sections...');
  await supabase.from('cta_sections').delete().eq('section_key', 'lets_build');
  const { error: ctaErr } = await supabase.from('cta_sections').insert({
    section_key: 'lets_build',
    heading: "LET'S MAKE SOMETHING THAT MATTERS.",
    heading_font_family: null,
    heading_font_size: null,
    heading_font_weight: '600',
    heading_letter_spacing: '-0.02em',
    heading_color: '#fff',
    subheading: "We've built platforms for growth, for good, and for greater impact. What will we build with you?",
    subheading_font_family: null,
    subheading_font_size: null,
    subheading_color: 'rgba(255,255,255,0.5)',
    btn_text: 'Start a Project',
    btn_font_family: null,
    btn_font_size: '1rem',
    btn_font_weight: '500',
    btn_letter_spacing: null,
    btn_color: '#7c3aed',
    btn_hover_color: '#6d28d9',
    btn_text_color: '#ffffff',
    btn_border_radius: '40px',
  });
  if (ctaErr) console.error('    ✗ CTA error:', ctaErr.message);
  else console.log('    ✓ CTA section inserted');

  console.log('\n✅ Company page seeding complete!');
}

run().catch(console.error);
