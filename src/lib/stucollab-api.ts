import { supabase } from "@/integrations/supabase/client";

export type Post = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  required_skills: string[];
  project_type: string | null;
  deadline: string | null;
  status: "open" | "closed";
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  bio: string | null;
  avatar_url: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  skills: string[];
};

export type Application = {
  id: string;
  post_id: string;
  applicant_id: string;
  message: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

export async function fetchPosts() {
  const { data, error } = await supabase
    .from("collaboration_posts")
    .select("*, owner:profiles!collaboration_posts_owner_profile_fkey(id, full_name, department, avatar_url)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as (Post & { owner: Pick<Profile, "id" | "full_name" | "department" | "avatar_url"> | null })[];
}

export async function fetchPost(id: string) {
  const { data, error } = await supabase
    .from("collaboration_posts")
    .select("*, owner:profiles!collaboration_posts_owner_profile_fkey(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as (Post & { owner: Profile }) | null;
}

export async function fetchMyPosts(userId: string) {
  const { data, error } = await supabase
    .from("collaboration_posts")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function fetchProfile(id: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function fetchMyApplications(userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*, post:collaboration_posts(*)")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as (Application & { post: Post })[];
}

export async function fetchApplicationsForPost(postId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*, applicant:profiles!applications_applicant_profile_fkey(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as (Application & { applicant: Profile })[];
}

export async function fetchMyApplicationForPost(postId: string, userId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("post_id", postId)
    .eq("applicant_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Application | null;
}