import { createClient as createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { ServiceCard } from '@/lib/types/database';
import { sanitizeSvg } from '@/lib/sanitize';
import ServiceAnimatedHeader from './ServiceAnimatedHeader';
import './services-slug.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('services_cards')
    .select('title, description, image_url')
    .eq('page_slug', slug)
    .limit(1)
    .single();
  const service = data as Pick<ServiceCard, 'title' | 'description' | 'image_url'> | null;

  return {
    title: service?.title ? `${service.title} — Pixenox` : 'Service — Pixenox',
    description: service?.description ?? '',
    openGraph: {
      title: service?.title ?? '',
      description: service?.description ?? '',
      images: service?.image_url ? [service.image_url] : [],
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const [{ data: serviceData }] = await Promise.all([
    supabase.from('services_cards').select('*').eq('page_slug', slug).limit(1).single(),
  ]);

  const service = serviceData as ServiceCard | null;

  if (!service) {
    return (
      <div className="all-srv-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>404 MATRIX</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>Sector not found.</p>
          <Link href="/" className="all-srv-back">GO BACK</Link>
        </div>
      </div>
    );
  }

  let techStack = service.technology_stack || [];

  // Provide fallback AAA presentation mapping if no items are linked yet
  if (techStack.length === 0) {
    techStack = [
      'FRONTEND PLATFORMS (REACT / NEXT)',
      'BACKEND APIS & MICROSERVICES (NODE)',
      'MOBILE & CROSS-PLATFORM (FLUTTER)',
      'CI/CD & CLOUD OPS (DOCKER)'
    ];
  }

  return (
    <article className="all-srv-page">
      {/* 100vh Premium Hero Banner Area */}
      <div className="all-srv-header-wrapper">
        <div className="all-srv-header-aurora" />

        <ServiceAnimatedHeader 
          title={service.title}
          description={service.description}
          titleFont={service.title_font_family}
          titleColor={service.title_color}
          descFont={service.desc_font_family}
          descColor={service.desc_color}
        />
      </div>

      <div className="all-srv-content-wrapper">
        <div className="all-srv-divider" />

        {techStack.length > 0 && (
          <div className="all-srv-stack-section">
            <div className="all-srv-list">
              {techStack.map((techItem: any, idx: number) => {
                const name = typeof techItem === 'string' ? techItem : (techItem?.name || '');
                const svg = typeof techItem === 'string' ? null : (techItem?.svg || null);
                return (
                  <div key={idx} className="all-srv-row" style={{ animationDelay: `${idx * 0.1 + 0.3}s` }}>
                    {svg ? (
                       <span className="all-srv-icon" dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }} />
                    ) : (
                       <span className="all-srv-number">{(idx + 1).toString().padStart(2, '0')}</span>
                    )}
                    <h2 className="all-srv-name">{name}</h2>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
