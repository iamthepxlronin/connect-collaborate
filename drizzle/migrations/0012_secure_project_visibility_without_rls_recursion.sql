CREATE OR REPLACE FUNCTION public.can_view_project(_post_id uuid, _viewer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT _viewer_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.collaboration_posts AS project
      WHERE project.id = _post_id
        AND (
          project.status IN ('open', 'completed')
          OR project.owner_id = _viewer_id
          OR EXISTS (
            SELECT 1
            FROM public.applications AS related_application
            WHERE related_application.post_id = project.id
              AND related_application.applicant_id = _viewer_id
          )
        )
    );
$$;
REVOKE ALL ON FUNCTION public.can_view_project(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_project(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "Relevant users can view projects" ON public.collaboration_posts;
CREATE POLICY "Relevant users can view projects" ON public.collaboration_posts
FOR SELECT TO authenticated
USING (public.can_view_project(id, auth.uid()));

CREATE OR REPLACE FUNCTION public.can_view_profile(_profile_id uuid, _viewer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT _viewer_id = auth.uid()
    AND (
      _profile_id = _viewer_id
      OR EXISTS (
        SELECT 1
        FROM public.collaboration_posts AS discoverable_project
        WHERE discoverable_project.owner_id = _profile_id
          AND discoverable_project.status IN ('open', 'completed')
      )
      OR EXISTS (
        SELECT 1
        FROM public.collaboration_posts AS owned_project
        JOIN public.applications AS viewer_application
          ON viewer_application.post_id = owned_project.id
        WHERE owned_project.owner_id = _profile_id
          AND viewer_application.applicant_id = _viewer_id
      )
      OR EXISTS (
        SELECT 1
        FROM public.applications AS profile_application
        JOIN public.collaboration_posts AS project
          ON project.id = profile_application.post_id
        WHERE profile_application.applicant_id = _profile_id
          AND (
            project.owner_id = _viewer_id
            OR (
              profile_application.status = 'accepted'
              AND EXISTS (
                SELECT 1
                FROM public.applications AS viewer_application
                WHERE viewer_application.post_id = project.id
                  AND viewer_application.applicant_id = _viewer_id
                  AND viewer_application.status = 'accepted'
              )
            )
          )
      )
    );
$$;