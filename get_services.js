const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data, error } = await supabase.from('services_cards').select('id, title, page_slug, priority').order('priority');
  console.log(data);
}
main();
