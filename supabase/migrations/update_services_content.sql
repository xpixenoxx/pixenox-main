-- ═══════════════════════════════════════════════════
-- POPULATE SERVICES CARDS WITH HIGH-FIDELITY CONTENT
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- 1. Autonomous AI Systems
UPDATE public.services_cards
SET 
  subheading = 'Self-governing, self-optimizing intelligence pipelines that execute complex tasks without human oversight.',
  description = 'We engineer intelligent agents and LLM-driven autonomous workflows that replace scattered manual operations with deterministic, self-healing platforms. These systems analyze vast datasets, execute complex decision trees, and adapt to edge cases in real-time.'
WHERE page_slug = 'autonomous-ai-systems';

-- 2. Web Architecture
UPDATE public.services_cards
SET 
  subheading = 'High-performance, composable frontend ecosystems designed for sub-second LCP and cinematic user experiences.',
  description = 'A premium web platform is no longer just a digital brochure—it’s an application running in the browser. We implement modern frameworks (Next.js, React) with edge computing, advanced caching strategies, and WebGL integrations to deliver fluid, native-feeling experiences that compound your brand equity.'
WHERE page_slug = 'web-architecture';

-- 3. Cloud Infrastructure
UPDATE public.services_cards
SET 
  subheading = 'Resilient, globally distributed microservices tailored for infinite scalability and zero downtime.',
  description = 'We migrate, modernize, and orchestrate complex server-side environments across AWS, GCP, and Azure. Implementing Kubernetes, multi-region failovers, and robust CI/CD pipelines ensures your systems remain fault-tolerant, elastic, and operationally invisible.'
WHERE page_slug = 'cloud-infrastructure';

-- 4. Generative Intelligence
UPDATE public.services_cards
SET 
  subheading = 'Custom LLM deployments and RAG architectures that transform raw enterprise data into actionable insights.',
  description = 'Harness the actual power of generative AI. We fine-tune models, establish secure Retrieval-Augmented Generation (RAG) pipelines, and integrate conversational layers that allow secure, private, and highly customized interactions with your proprietary institutional knowledge.'
WHERE page_slug = 'generative-intelligence';

-- 5. Bio Intelligence
UPDATE public.services_cards
SET 
  subheading = 'Accelerating life sciences with deep learning, computational biology, and high-throughput data processing.',
  description = 'For genomic pipelines, protein folding algorithms, and molecular simulations, conventional computing fails at scale. We architect specialized intelligence platforms optimized for biomedical workloads, dramatically reducing discovery timelines and computational overhead.'
WHERE page_slug = 'bio-intelligence';

-- 6. Growth Intelligence
UPDATE public.services_cards
SET 
  subheading = 'Unified SEO, AEO, and GEO optimization frameworks powered by real-time analytics and predictive models.',
  description = 'Stop treating marketing and engineering as separate disciplines. We integrate analytics, search engine optimization (SEO), answer engine optimization (AEO), and AI-driven growth metrics directly into your architecture, resulting in compounding visibility and autonomous user acquisition.'
WHERE page_slug = 'growth-intelligence';

-- 7. Custom Software
UPDATE public.services_cards
SET 
  subheading = 'Bespoke, end-to-end engineered platforms for organizations that refuse to settle for off-the-shelf compromises.',
  description = 'From complex financial dashboards to specialized hardware integrations, we handle the full lifecycle of custom software product development. Our solutions are engineered with extreme precision, prioritizing clean code architecture, type-safe data flows, and rigorous testing methodologies.'
WHERE page_slug = 'custom-software';
