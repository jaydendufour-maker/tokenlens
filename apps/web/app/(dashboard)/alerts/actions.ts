"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPlan } from "@/lib/data";

export interface AlertFormState {
  error?: string;
  ok?: boolean;
}

export async function createAlertAction(
  _prev: AlertFormState,
  formData: FormData
): Promise<AlertFormState> {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Niet ingelogd" };

  if ((await getPlan()) !== "pro")
    return { error: "Budget alerts zijn een Pro-feature." };

  const project_id = String(formData.get("project_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const tag_key = String(formData.get("tag_key") ?? "project");
  const tag_value = String(formData.get("tag_value") ?? "").trim() || null;
  const period = String(formData.get("period") ?? "month");
  const threshold_usd = Number(formData.get("threshold_usd"));
  const notify_email = String(formData.get("notify_email") ?? "").trim() || null;
  const webhook_url = String(formData.get("webhook_url") ?? "").trim() || null;

  if (!project_id) return { error: "Kies een project" };
  if (!name) return { error: "Geef de alert een naam" };
  if (!Number.isFinite(threshold_usd) || threshold_usd <= 0)
    return { error: "Drempel moet groter dan 0 zijn" };
  if (!["project", "customer", "feature", "team"].includes(tag_key))
    return { error: "Ongeldige scope" };
  if (tag_key !== "project" && !tag_value)
    return { error: "Vul een waarde in voor de gekozen scope" };

  const { error } = await sb.from("budget_alerts").insert({
    project_id,
    name,
    tag_key,
    tag_value: tag_key === "project" ? null : tag_value,
    period,
    threshold_usd,
    notify_email,
    webhook_url,
  });
  if (error) return { error: error.message };

  revalidatePath("/alerts");
  return { ok: true };
}

export async function deleteAlertAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = await createServerSupabase();
  await sb.from("budget_alerts").delete().eq("id", id);
  revalidatePath("/alerts");
}
