-- ============================================================================
-- HackHub — seed data (skills catalogue)
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
