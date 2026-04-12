import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hylycwrnfqghmewamqzu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5bHljd3JuZnFnaG1ld2FtcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTQwOTExNSwiZXhwIjoyMDkwOTg1MTE1fQ.LvyMI8LfnsD1T1teuyifq7A4_0K9DnLpAUcwLKDRNaQ'
);

const { data, error } = await supabase.rpc('exec_sql', {
  query: 'ALTER TABLE public.services_cards ADD COLUMN IF NOT EXISTS icon_svg text DEFAULT NULL;'
});

if (error) {
  console.log('RPC not available, trying direct approach...');
  
  // Try fetching a row to check if column already exists
  const { data: testData, error: testError } = await supabase
    .from('services_cards')
    .select('icon_svg')
    .limit(1);
  
  if (testError) {
    console.log('Column does NOT exist yet. Error:', testError.message);
    console.log('\n=== YOU NEED TO RUN THIS SQL IN SUPABASE DASHBOARD ===');
    console.log('Go to: https://supabase.com/dashboard/project/hylycwrnfqghmewamqzu/sql/new');
    console.log('\nSQL to run:');
    console.log('ALTER TABLE public.services_cards ADD COLUMN IF NOT EXISTS icon_svg text DEFAULT NULL;');
    console.log('=====================================================\n');
  } else {
    console.log('Column "icon_svg" already exists! No migration needed.');
    console.log('Sample data:', testData);
  }
} else {
  console.log('Migration successful:', data);
}
