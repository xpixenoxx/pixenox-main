import { Metadata } from 'next';
import JobDetailsClient from './JobDetailsClient';
import { FALLBACK_ROLES } from '../fallback-jobs';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const role = FALLBACK_ROLES.find(r => r.id === id);
  return {
    title: role ? `${role.title} — Careers` : 'Job Details',
  };
}

export default async function JobDetailsPage({ params }: Props) {
  const { id } = await params;
  return <JobDetailsClient id={id} />;
}
