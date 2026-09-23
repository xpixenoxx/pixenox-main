export interface JobRole {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  is_active: boolean;
  created_at: string;
}

export const FALLBACK_ROLES: JobRole[] = [
  {
    id: '1',
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote — Global',
    type: 'Full-Time',
    description: 'Build scalable web applications and APIs powering enterprise-grade platforms. Work with Next.js, Node.js, and cloud infrastructure at scale.',
    requirements: ['5+ years full-stack experience', 'Proficiency in React/Next.js + Node.js', 'Experience with cloud platforms (AWS/GCP)', 'Strong system design skills'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'AI/ML Engineer',
    department: 'AI & Automation',
    location: 'Remote — Global',
    type: 'Full-Time',
    description: 'Design and deploy intelligent automation solutions, ML pipelines, and AI-powered products for clients across industries.',
    requirements: ['3+ years ML/AI experience', 'Python, TensorFlow/PyTorch', 'NLP or Computer Vision expertise', 'Production deployment experience'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'SEO & Growth Strategist',
    department: 'Digital Growth',
    location: 'Remote — Global',
    type: 'Full-Time',
    description: 'Drive organic growth for B2B clients through advanced SEO, GEO, and AEO strategies. Analyze performance data and optimize campaigns.',
    requirements: ['4+ years SEO experience', 'B2B SaaS or agency background', 'Data-driven approach', 'Excellent communication skills'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote — Global',
    type: 'Full-Time',
    description: 'Craft premium, conversion-focused interfaces for enterprise clients. Lead design systems and collaborate with engineering teams.',
    requirements: ['3+ years product design', 'Figma expertise', 'Design system experience', 'B2B/SaaS portfolio preferred'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'DevOps & Cloud Architect',
    department: 'Engineering',
    location: 'Remote — Global',
    type: 'Contract',
    description: 'Architect and manage cloud infrastructure, CI/CD pipelines, and deployment workflows for high-availability systems.',
    requirements: ['5+ years DevOps/Cloud experience', 'AWS/GCP/Azure certifications', 'Docker, Kubernetes, Terraform', 'Security-first mindset'],
    is_active: true,
    created_at: new Date().toISOString(),
  },
];
