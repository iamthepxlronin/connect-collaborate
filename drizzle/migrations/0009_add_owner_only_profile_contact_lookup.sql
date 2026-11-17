CREATE OR REPLACE FUNCTION public.get_own_profile_contacts(_profile_id uuid)
RETURNS TABLE (contact_email text, contact_whatsapp text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT profile.contact_email, profile.contact_whatsapp
  FROM public.profiles AS profile
  WHERE profile.id = _profile_id
    AND auth.uid() = _profile_id;
$$;
REVOKE ALL ON FUNCTION public.get_own_profile_contacts(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_own_profile_contacts(uuid) TO authenticated;