export function usd(n: number | null | undefined): string {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: v !== 0 && Math.abs(v) < 1 ? 4 : 2,
  }).format(v);
}

export function num(n: number | null | undefined): string {
  return new Intl.NumberFormat("en-US").format(Number(n ?? 0));
}
