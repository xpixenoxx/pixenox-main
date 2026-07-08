const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Deleting existing nav_config...');
  const { error: deleteError } = await supabase.from('nav_config').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Error deleting:', deleteError);
  }

  const links = [
    { label: 'Work', href: '/#work', priority: 1, is_visible: true },
    { label: 'Company', href: '/#company', priority: 2, is_visible: true },
    { label: 'Services', href: '/#services', priority: 3, is_visible: true },
    { label: 'Contact', href: '/#contact', priority: 4, is_visible: true },
    { label: 'Explore the Engineering Model', href: '/#contact', priority: 5, is_visible: true },
  ];

  console.log('Inserting correct nav items...');
  const { error: insertError } = await supabase.from('nav_config').insert(links);
  if (insertError) {
    console.error('Error inserting:', insertError);
  } else {
    console.log('Cleaned and re-seeded navigation links successfully!');
  }
}
run();
