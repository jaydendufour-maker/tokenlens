import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; check_email?: string }>;
}) {
  const { error, check_email } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">TokenLens</h1>
          <p className="text-sm text-neutral-400 mt-1">
            FinOps voor je LLM-rekening
          </p>
        </div>
        <form className="space-y-3 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {check_email && (
            <p className="text-sm text-emerald-400 bg-emerald-950/40 rounded-md px-3 py-2">
              Account aangemaakt — bevestig je e-mail (of zet e-mailbevestiging
              uit in Supabase) en log in.
            </p>
          )}
          <input
            name="email"
            type="email"
            required
            placeholder="E-mail"
            className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-neutral-600"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Wachtwoord"
            className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-sm outline-none focus:border-neutral-600"
          />
          <div className="flex gap-2 pt-1">
            <button
              formAction={login}
              className="flex-1 rounded-md bg-white text-neutral-900 text-sm font-medium py-2 hover:bg-neutral-200"
            >
              Inloggen
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-md border border-neutral-700 text-sm font-medium py-2 hover:bg-neutral-800"
            >
              Account maken
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
