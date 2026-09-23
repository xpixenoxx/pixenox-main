import { Metadata } from 'next';
import ApplicationFormClient from './ApplicationFormClient';
import { FALLBACK_ROLES } from '../../fallback-jobs';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const role = FALLBACK_ROLES.find(r => r.id === id);
  return {
    title: role ? `Apply: ${role.title} — Careers` : 'Apply for Job',
  };
}

export default async function ApplicationPage({ params }: Props) {
  const { id } = await params;
  return <ApplicationFormClient id={id} />;
}
