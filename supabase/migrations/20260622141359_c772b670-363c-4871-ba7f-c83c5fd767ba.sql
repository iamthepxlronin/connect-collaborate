
CREATE OR REPLACE FUNCTION public.is_post_owner(_post_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.collaboration_posts WHERE id = _post_id AND owner_id = _user_id);
$$;
