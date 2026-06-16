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

export type Plan = "free" | "pro";

/** Plan van de ingelogde user. Degradeert naar 'free' als er geen rij/tabel is. */
export async function getPlan(): Promise<Plan> {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return "free";
  const { data } = await sb
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .maybeSingle();
  if (data?.plan !== "pro") return "free";
  // verlopen abonnement → terug naar free
  if (data.plan_expires_at && new Date(data.plan_expires_at) < new Date())
    return "free";
  return "pro";
}
