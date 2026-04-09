const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2];
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  await supabase.from('nav_config').delete().neq('label', 'dummy123');

  const links = [
    { label: 'Work', href: '/work', priority: 1, is_visible: true },
    { label: 'Company', href: '/company', priority: 2, is_visible: true },
    { label: 'Services', href: '/#services', priority: 3, is_visible: true },
    { label: 'Contact', href: '/#contact', priority: 4, is_visible: true },
    { label: 'Start Your Project', href: '/#contact', priority: 5, is_visible: true },
  ];

  for (const l of links) {
    const { error } = await supabase.from('nav_config').insert(l);
    if (error) console.error('Error:', error);
  }
  console.log('Nav configured!');
}
run();
