import { createServerSupabase } from "@/lib/supabase/server";

export interface Project {
  id: string;
  name: string;
  api_key_prefix: string;
  created_at: string;
}

export async function getProjects(): Promise<Project[]> {
  const sb = await createServerSupabase();
  const { data } = await sb
    .from("projects")
    .select("id,name,api_key_prefix,created_at")
    .order("created_at", { ascending: true });
  return data ?? [];
}
