const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

process.loadEnvFile('.env.local');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  await supabase.from('nav_config').delete().neq('label', 'dummy123');

  const links = [
    { label: 'Work', href: '/work', priority: 1, is_visible: true },
    { label: 'Company', href: '/company', priority: 2, is_visible: true },
    { label: 'Engineering', href: '/engineering', priority: 3, is_visible: true },
    { label: 'FAQs', href: '/faqs', priority: 4, is_visible: true },
    { label: 'Contact', href: '/contact', priority: 5, is_visible: true },
    { label: 'Explore the Engineering Model', href: '/contact', priority: 6, is_visible: true },
  ];

  for (const l of links) {
    const { error } = await supabase.from('nav_config').insert(l);
    if (error) console.error('Error:', error);
  }
  console.log('Nav configured!');
}
run();
