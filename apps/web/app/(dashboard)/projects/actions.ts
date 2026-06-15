"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api-key";

export interface CreateState {
  key?: string; // wordt één keer getoond, nooit opgeslagen
  prefix?: string;
  error?: string;
}

export async function createProjectAction(
  _prev: CreateState,
  formData: FormData
): Promise<CreateState> {
  const name = String(formData.get("name") ?? "").trim() || "Mijn project";
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Niet ingelogd" };

  const { key, hash, prefix } = generateApiKey();
  const { error } = await sb.from("projects").insert({
    owner_id: user.id,
    name,
    api_key_hash: hash,
    api_key_prefix: prefix,
  });
  if (error) return { error: error.message };

  revalidatePath("/projects");
  return { key, prefix };
}
