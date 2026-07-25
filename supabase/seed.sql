-- ============================================================================
-- HackHub — seed data (skills catalogue + sample hackathons)
-- Safe to re-run: uses ON CONFLICT DO NOTHING.
-- ============================================================================

insert into public.skills (name, slug, category) values
  ('Backend',        'backend',        'Engineering'),
  ('Frontend',       'frontend',       'Engineering'),
  ('Mobile',         'mobile',         'Engineering'),
  ('Flutter',        'flutter',        'Engineering'),
  ('React',          'react',          'Engineering'),
  ('Node.js',        'nodejs',         'Engineering'),
  ('Python',         'python',         'Engineering'),
  ('Java',           'java',           'Engineering'),
  ('Go',             'go',             'Engineering'),
  ('Rust',           'rust',           'Engineering'),
  ('Embedded',       'embedded',       'Engineering'),
  ('AI',             'ai',             'AI/ML'),
  ('ML',             'ml',             'AI/ML'),
  ('LLM',            'llm',            'AI/ML'),
  ('Data Science',   'data-science',   'AI/ML'),
  ('DevOps',         'devops',         'Infrastructure'),
  ('Cloud',          'cloud',          'Infrastructure'),
  ('UI',             'ui',             'Design'),
  ('UX',             'ux',             'Design'),
  ('Product',        'product',        'Product'),
  ('Blockchain',     'blockchain',     'Web3'),
  ('Cyber Security', 'cyber-security', 'Security'),
  ('AR/VR',          'ar-vr',          'Emerging')
on conflict (slug) do nothing;

insert into public.hackathons
  (name, organizer, description, prize_pool, registration_deadline, start_date, end_date,
   theme, mode, min_team_size, max_team_size, technologies, difficulty, registration_link,
   location, is_weekend)
values
  ('AI Agents Global Hackathon', 'HackHub Labs',
   'Build autonomous AI agents that solve real-world workflows. Open to all skill levels.',
   '$25,000', '2026-08-10', '2026-08-15', '2026-08-17',
   'AI', 'online', 2, 4, '{LLM,Python,React}', 'intermediate',
   'https://example.com/register/ai-agents', null, true),

  ('Web3 Builders Weekend', 'ChainStack',
   'A 48-hour sprint to ship decentralized apps on modern L2s.',
   '$15,000', '2026-08-20', '2026-08-22', '2026-08-24',
   'Web3', 'online', 1, 4, '{Blockchain,Rust,React}', 'advanced',
   'https://example.com/register/web3-weekend', null, true),

  ('Campus Code Jam', 'Coding Club NIT',
   'A beginner-friendly college hackathon. First hackathon? Start here.',
   '₹1,00,000', '2026-09-01', '2026-09-06', '2026-09-07',
   'College', 'offline', 2, 5, '{Frontend,Backend,Python}', 'beginner',
   'https://example.com/register/campus-jam', 'Bangalore, India', true),

  ('FinTech Innovation Challenge', 'PayForward',
   'Reimagine payments, lending and personal finance with cutting-edge tech.',
   '$40,000', '2026-09-12', '2026-09-19', '2026-09-21',
   'FinTech', 'hybrid', 2, 4, '{Backend,Cloud,AI}', 'intermediate',
   'https://example.com/register/fintech', 'Remote + Mumbai', false),

  ('HealthTech for Good', 'MedBridge Foundation',
   'Design accessible healthcare tools for underserved communities.',
   '$20,000', '2026-09-25', '2026-10-03', '2026-10-05',
   'HealthTech', 'online', 1, 4, '{Mobile,Flutter,Data Science}', 'beginner',
   'https://example.com/register/healthtech', null, true),

  ('DevOps & Cloud Sprint', 'CloudNative Collective',
   'Ship resilient, observable infrastructure. Kubernetes, IaC and platform tooling.',
   '$18,000', '2026-10-10', '2026-10-17', '2026-10-19',
   'DevOps', 'online', 2, 3, '{DevOps,Cloud,Go}', 'advanced',
   'https://example.com/register/devops-sprint', null, true);
