import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import FaqsClient from './FaqsClient';
import '@/components/home/HomeFaqsSection.css';

export const metadata: Metadata = {
  title: 'FAQs | Pixenox',
  description: 'Find answers to common questions about our services, methodologies, and platform engineering.',
};

export default async function FaqsPage() {
  const supabase = await createClient();
  
  // Fetch visible FAQs ordered by priority
  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .eq('is_visible', true)
    .order('priority', { ascending: true });

  return (
    <main className="home-faqs-section pt-[180px] min-h-screen">
      <FaqsClient initialFaqs={faqs || []} />
    </main>
  );
}
