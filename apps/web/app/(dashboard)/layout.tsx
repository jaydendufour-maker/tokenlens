import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { signout } from "../login/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-semibold tracking-tight">
              TokenLens
            </Link>
            <nav className="flex items-center gap-4 text-sm text-neutral-400">
              <Link href="/dashboard" className="hover:text-neutral-100">
                Overzicht
              </Link>
              <Link href="/alerts" className="hover:text-neutral-100">
                Alerts
              </Link>
              <Link href="/projects" className="hover:text-neutral-100">
                Projecten
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-400">
            <span className="hidden sm:inline">{user.email}</span>
            <form action={signout}>
              <button className="hover:text-neutral-100">Uitloggen</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
