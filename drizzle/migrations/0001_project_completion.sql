ALTER TABLE public.collaboration_posts
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS demo_url text,
  ADD COLUMN IF NOT EXISTS outcome_summary text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;