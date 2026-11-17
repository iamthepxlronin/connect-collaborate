DROP POLICY IF EXISTS "Relevant users can view projects" ON public.collaboration_posts;
CREATE POLICY "Relevant users can view projects" ON public.collaboration_posts
FOR SELECT TO authenticated
USING (
  status IN ('open', 'completed')
  OR auth.uid() = owner_id
  OR EXISTS (
    SELECT 1
    FROM public.applications AS related_application
    WHERE related_application.post_id = collaboration_posts.id
      AND (
        related_application.applicant_id = auth.uid()
        OR (related_application.applicant_id = auth.uid() AND related_application.status = 'accepted')
      )
  )
);