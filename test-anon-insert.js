const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('contact_submissions').insert([{ name: 'Direct Submit Test', email: 'test.anon@example.com', message: 'Testing anon key' }])
  .then(res => { console.log(JSON.stringify(res)); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
