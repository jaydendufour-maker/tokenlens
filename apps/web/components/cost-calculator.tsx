"use client";

import { useState } from "react";
import { calcCost, type Model } from "@/lib/models";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 1 ? 4 : 2,
  }).format(n);

export function CostCalculator({ model }: { model: Model }) {
  const [calls, setCalls] = useState(10000);
  const [inTok, setInTok] = useState(1000);
  const [outTok, setOutTok] = useState(500);

  const perCall = calcCost(model, inTok, outTok);
  const total = perCall * calls;

  const field = (
    label: string,
    value: number,
    set: (n: number) => void
  ) => (
    <label className="block">
      <span className="text-xs text-neutral-500">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => set(Math.max(0, Number(e.target.value)))}
        className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-neutral-600 tabular-nums"
      />
    </label>
  );

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <h3 className="text-sm font-medium text-neutral-300 mb-4">
        Cost calculator — {model.name}
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {field("Calls / month", calls, setCalls)}
        {field("Input tokens / call", inTok, setInTok)}
        {field("Output tokens / call", outTok, setOutTok)}
      </div>
      <div className="mt-5 flex items-end justify-between border-t border-neutral-800 pt-4">
        <div>
          <div className="text-xs text-neutral-500">Per call</div>
          <div className="text-lg font-semibold tabular-nums">
            {fmt(perCall)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-500">
            Estimated monthly cost
          </div>
          <div className="text-2xl font-semibold tabular-nums text-emerald-400">
            {fmt(total)}
          </div>
        </div>
      </div>
      <p className="text-xs text-neutral-600 mt-3">
        Estimate only. Your real bill depends on actual usage —{" "}
        <span className="text-neutral-400">that&apos;s what TokenLens tracks.</span>
      </p>
    </div>
  );
}
