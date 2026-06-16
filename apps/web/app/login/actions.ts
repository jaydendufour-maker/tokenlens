"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const sb = await createServerSupabase();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const sb = await createServerSupabase();
  const { error } = await sb.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${SITE_URL}/auth/confirm?next=/dashboard` },
  });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  redirect("/login?check_email=1");
}

export async function signout() {
  const sb = await createServerSupabase();
  await sb.auth.signOut();
  redirect("/login");
}
