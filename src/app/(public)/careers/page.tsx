import type { Metadata } from 'next';
import CareersPageClient from './CareersPageClient';

export const metadata: Metadata = {
  title: 'Careers — Pixenox',
  description: 'Join our global remote team of engineers, designers, and strategists building next-generation digital products.',
  alternates: { canonical: '/careers' },
};

export default function CareersPage() {
  return <CareersPageClient />;
}
