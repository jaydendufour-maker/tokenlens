import { getProjects } from "@/lib/data";
import { NewProjectForm } from "./new-project-form";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Projecten</h1>
        <p className="text-sm text-neutral-500">
          Eén project per app/service. Gebruik de API-key in de TokenLens-SDK.
        </p>
      </div>

      <NewProjectForm />

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800">
        {projects.length === 0 ? (
          <p className="text-sm text-neutral-500 p-5">Nog geen projecten.</p>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <code className="text-xs text-neutral-500">
                  {p.api_key_prefix}…
                </code>
              </div>
              <span className="text-xs text-neutral-600">
                {new Date(p.created_at).toLocaleDateString("nl-NL")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
