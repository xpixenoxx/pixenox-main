const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('contact_submissions').select('*').order('submitted_at', { ascending: false }).limit(5)
  .then(res => { console.log(JSON.stringify(res.data, null, 2)); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
