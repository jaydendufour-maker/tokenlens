/**
 * Notificatie-kanalen voor budget-alerts. Server-only.
 * E-mail via Resend HTTP-API (3.000 mails/mnd gratis) — geen SDK-dependency,
 * gewoon fetch. Geen RESEND_API_KEY gezet? Dan no-op (i.p.v. crashen).
 */

export interface AlertPayload {
  alert: string;
  project: string;
  scope: string; // bv. "customer=acme-inc" of "hele project"
  period: "day" | "month" | string;
  spendUsd: number;
  thresholdUsd: number;
}

const fmtUsd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n
  );

export async function sendWebhook(
  url: string,
  payload: AlertPayload
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "tokenlens.budget_alert", ...payload }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendAlertEmail(
  to: string,
  payload: AlertPayload
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "TokenLens <alerts@tokenlens.dev>";
  if (!apiKey) return false;

  const subject = `⚠️ Budget alert: ${payload.alert} hit ${fmtUsd(
    payload.spendUsd
  )}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px">
      <h2 style="margin:0 0 8px">⚠️ Budget alert triggered</h2>
      <p style="color:#444;margin:0 0 16px">
        <strong>${payload.alert}</strong> on project
        <strong>${payload.project}</strong> crossed its threshold.
      </p>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Scope</td><td>${payload.scope}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Period</td><td>${payload.period}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Spend</td><td><strong>${fmtUsd(
          payload.spendUsd
        )}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Threshold</td><td>${fmtUsd(
          payload.thresholdUsd
        )}</td></tr>
      </table>
      <p style="color:#999;font-size:12px;margin-top:20px">Sent by TokenLens</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
