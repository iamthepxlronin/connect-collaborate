DROP POLICY IF EXISTS "Authenticated can view posts" ON public.collaboration_posts;
CREATE POLICY "Relevant users can view projects" ON public.collaboration_posts
FOR SELECT TO authenticated
USING (
  status IN ('open', 'completed')
  OR auth.uid() = owner_id
  OR EXISTS (
    SELECT 1
    FROM public.applications AS accepted_application
    WHERE accepted_application.post_id = collaboration_posts.id
      AND accepted_application.applicant_id = auth.uid()
      AND accepted_application.status = 'accepted'
  )
);

DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, full_name, department, bio, avatar_url, skills, created_at, updated_at)
  ON public.profiles TO authenticated;
CREATE POLICY "Relevant users can view profile details" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR EXISTS (
    SELECT 1
    FROM public.collaboration_posts AS owned_post
    WHERE owned_post.owner_id = profiles.id
  )
  OR EXISTS (
    SELECT 1
    FROM public.applications AS profile_application
    WHERE profile_application.applicant_id = profiles.id
      AND (
        profile_application.applicant_id = auth.uid()
        OR public.is_post_owner(profile_application.post_id, auth.uid())
        OR (
          profile_application.status = 'accepted'
          AND EXISTS (
            SELECT 1
            FROM public.applications AS viewer_application
            WHERE viewer_application.post_id = profile_application.post_id
              AND viewer_application.applicant_id = auth.uid()
              AND viewer_application.status = 'accepted'
          )
        )
      )
  )
);

CREATE OR REPLACE FUNCTION public.get_profile_contacts(_post_id uuid, _profile_id uuid)
RETURNS TABLE (contact_email text, contact_whatsapp text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT profile.contact_email, profile.contact_whatsapp
  FROM public.profiles AS profile
  WHERE profile.id = _profile_id
    AND auth.uid() IS NOT NULL
    AND (
      profile.id = auth.uid()
      OR (
        _post_id IS NOT NULL
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
        )
      )
    );
$$;
REVOKE ALL ON FUNCTION public.get_profile_contacts(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_profile_contacts(uuid, uuid) TO authenticated;