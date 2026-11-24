import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createPublicSupabaseClient, getCanonicalSiteUrl } from '@/lib/supabase/public';
import JobDetailsClient from './JobDetailsClient';
import { FALLBACK_ROLES, type JobRole } from '../fallback-jobs';

export const revalidate = 3600;

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchJobRole(id: string): Promise<JobRole | null> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createPublicSupabaseClient();
    const { data } = await (supabase.from('careers') as any)
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (data) return data as JobRole;
  }
  return FALLBACK_ROLES.find((r) => r.id === id) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const role = await fetchJobRole(id);
  if (!role) {
    return {
      title: 'Role Not Found — Careers',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getCanonicalSiteUrl();
  const desc = (role.description || `Apply for ${role.title} at Pixenox Solutions Private Limited.`).slice(0, 160);

  return {
    title: `${role.title} — Careers`,
    description: desc,
    alternates: {
      canonical: `${baseUrl}/careers/${id}`,
    },
    openGraph: {
      title: `${role.title} — Careers | Pixenox`,
      description: desc,
      url: `${baseUrl}/careers/${id}`,
    },
  };
}

export default async function JobDetailsPage({ params }: Props) {
  const { id } = await params;
  const role = await fetchJobRole(id);

  if (!role) {
    notFound();
  }

  const baseUrl = getCanonicalSiteUrl();
  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: role.title,
    description: role.description,
    datePosted: (role as any).created_at ? String((role as any).created_at).split('T')[0] : '2026-11-24',
    employmentType: role.type?.toUpperCase().includes('PART') ? 'PART_TIME' : 'FULL_TIME',
    hiringOrganization: {
      '@id': `${baseUrl}/#organization`,
      '@type': 'Organization',
      name: 'PIXENOX SOLUTIONS PRIVATE LIMITED',
      sameAs: baseUrl,
    },
    jobLocationType: role.location?.toLowerCase().includes('remote') ? 'TELECOMMUTE' : undefined,
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: role.location || 'Andhra Pradesh',
        addressCountry: 'IN',
      },
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Careers', item: `${baseUrl}/careers` },
      { '@type': 'ListItem', position: 3, name: role.title, item: `${baseUrl}/careers/${id}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <JobDetailsClient id={id} initialRole={role} />
    </>
  );
}
