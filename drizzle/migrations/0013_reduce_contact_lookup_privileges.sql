CREATE OR REPLACE FUNCTION public.get_profile_contacts(_post_id uuid, _profile_id uuid)
RETURNS TABLE (contact_email text, contact_whatsapp text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT profile.contact_email, profile.contact_whatsapp
  FROM public.profiles AS profile
  WHERE profile.id = _profile_id
    AND auth.uid() IS NOT NULL
    AND _post_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.collaboration_posts AS project
      WHERE project.id = _post_id
        AND (
          project.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.applications AS viewer_application
            WHERE viewer_application.post_id = project.id
              AND viewer_application.applicant_id = auth.uid()
              AND viewer_application.status = 'accepted'
          )
        )
        AND (
          profile.id = project.owner_id
          OR EXISTS (
            SELECT 1
            FROM public.applications AS profile_application
            WHERE profile_application.post_id = project.id
              AND profile_application.applicant_id = profile.id
              AND profile_application.status = 'accepted'
          )
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.get_own_profile_contacts(_profile_id uuid)
RETURNS TABLE (contact_email text, contact_whatsapp text)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT profile.contact_email, profile.contact_whatsapp
  FROM public.profiles AS profile
  WHERE profile.id = _profile_id
    AND auth.uid() = _profile_id;
$$;