import ServiceDetailPage, { generateMetadata as generateSlugMetadata } from '../[slug]/page';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return generateSlugMetadata({ params: Promise.resolve({ slug: 'ai-visibility-engineering' }) });
}

export default async function Page() {
  return ServiceDetailPage({ params: Promise.resolve({ slug: 'ai-visibility-engineering' }) });
}
