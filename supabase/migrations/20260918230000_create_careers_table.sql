-- Create careers table
CREATE TABLE IF NOT EXISTS public.careers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Careers are viewable by everyone."
    ON public.careers FOR SELECT
    USING (true);

CREATE POLICY "Careers are insertable by authenticated users only."
    ON public.careers FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Careers are updatable by authenticated users only."
    ON public.careers FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Careers are deletable by authenticated users only."
    ON public.careers FOR DELETE
    USING (auth.role() = 'authenticated');

-- Insert fallback roles as initial data
INSERT INTO public.careers (title, department, location, type, description, requirements, is_active) VALUES
('Senior Full-Stack Engineer', 'Engineering', 'Remote — Global', 'Full-Time', 'Build scalable web applications and APIs powering enterprise-grade platforms. Work with Next.js, Node.js, and cloud infrastructure at scale.', ARRAY['5+ years full-stack experience', 'Proficiency in React/Next.js + Node.js', 'Experience with cloud platforms (AWS/GCP)', 'Strong system design skills'], true),
('AI/ML Engineer', 'AI & Automation', 'Remote — Global', 'Full-Time', 'Design and deploy intelligent automation solutions, ML pipelines, and AI-powered products for clients across industries.', ARRAY['3+ years ML/AI experience', 'Python, TensorFlow/PyTorch', 'NLP or Computer Vision expertise', 'Production deployment experience'], true),
('SEO & Growth Strategist', 'Digital Growth', 'Remote — Global', 'Full-Time', 'Drive organic growth for B2B clients through advanced SEO, GEO, and AEO strategies. Analyze performance data and optimize campaigns.', ARRAY['4+ years SEO experience', 'B2B SaaS or agency background', 'Data-driven approach', 'Excellent communication skills'], true),
('UI/UX Designer', 'Design', 'Remote — Global', 'Full-Time', 'Craft premium, conversion-focused interfaces for enterprise clients. Lead design systems and collaborate with engineering teams.', ARRAY['3+ years product design', 'Figma expertise', 'Design system experience', 'B2B/SaaS portfolio preferred'], true),
('DevOps & Cloud Architect', 'Engineering', 'Remote — Global', 'Contract', 'Architect and manage cloud infrastructure, CI/CD pipelines, and deployment workflows for high-availability systems.', ARRAY['5+ years DevOps/Cloud experience', 'AWS/GCP/Azure certifications', 'Docker, Kubernetes, Terraform', 'Security-first mindset'], true);
