
ALTER TABLE public.collaboration_posts
  ADD CONSTRAINT collaboration_posts_owner_profile_fkey
  FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_applicant_profile_fkey
  FOREIGN KEY (applicant_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
