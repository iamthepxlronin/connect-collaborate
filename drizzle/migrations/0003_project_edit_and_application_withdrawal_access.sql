GRANT UPDATE ON public.collaboration_posts TO authenticated;
GRANT DELETE ON public.applications TO authenticated;

CREATE POLICY "Owners can edit own collaboration posts" ON public.collaboration_posts
FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Restrict post updates to owners" ON public.collaboration_posts
AS RESTRICTIVE FOR UPDATE TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Applicants can withdraw own pending applications" ON public.applications
FOR DELETE TO authenticated
USING (auth.uid() = applicant_id AND status = 'pending');

CREATE POLICY "Restrict application withdrawal to pending owner" ON public.applications
AS RESTRICTIVE FOR DELETE TO authenticated
USING (auth.uid() = applicant_id AND status = 'pending');