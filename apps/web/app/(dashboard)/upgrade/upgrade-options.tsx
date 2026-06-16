"use client";

import { useState } from "react";

export function UpgradeOptions({ cardUrl }: { cardUrl: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function payWithCrypto() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/crypto-checkout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(
          data.error === "crypto_not_configured"
            ? "Crypto-betalen is nog niet geconfigureerd."
            : "Kon de crypto-checkout niet starten."
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {/* Kaart */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col">
        <h3 className="font-medium">Pay by card</h3>
        <p className="mt-1.5 text-sm text-neutral-400 flex-1">
          Creditcard of debitkaart via een beveiligde checkout. Maandelijks,
          automatisch verlengd.
        </p>
        {cardUrl ? (
          <a
            href={cardUrl}
            className="mt-5 block text-center rounded-md bg-white text-neutral-900 font-medium py-2 hover:bg-neutral-200"
          >
            Betaal met kaart — $29/mo
          </a>
        ) : (
          <button
            disabled
            className="mt-5 rounded-md border border-neutral-800 text-neutral-500 font-medium py-2 cursor-not-allowed"
          >
            Kaart binnenkort
          </button>
        )}
      </div>

      {/* Crypto */}
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/10 p-6 flex flex-col">
        <h3 className="font-medium">Pay with crypto</h3>
        <p className="mt-1.5 text-sm text-neutral-400 flex-1">
          USDC, USDT, BTC, ETH en 350+ andere. Betaalt per maand; je krijgt een
          factuur om te verlengen.
        </p>
        <button
          onClick={payWithCrypto}
          disabled={loading}
          className="mt-5 rounded-md bg-emerald-500 text-neutral-950 font-medium py-2 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Bezig…" : "Betaal met crypto — $29"}
        </button>
      </div>

      {error && (
        <p className="sm:col-span-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
