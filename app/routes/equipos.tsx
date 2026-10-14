import { FolderGit2, Package } from "lucide-react";
import type { Route } from "./+types/equipos";
import { PublicShell } from "~/components/public-shell";

// Los grupos del proyecto de Minecraft. Datos fijos en el front, igual que el
// resto del modo vitrina: no dependen de la API.

interface Team {
  number: number;
  project: string;
  /** Página del mod en Modrinth o CurseForge; algunos grupos todavía no publicaron. */
  modUrl?: string;
  repoUrl: string;
  members: string[];
}

const teams: Team[] = [
  {
    number: 1,
    project: "Los Pibes de la UTU",
    modUrl: "https://modrinth.com/project/lospibesutu",
    repoUrl: "https://github.com/Nicrolax/Grupo1_proyecto.git",
    members: ["Nicolás Bentancour", "Agustín Perdomo", "Mathias Piñeyro", "Thiago Rodriguez"],
  },
  {
    number: 2,
    project: "Proyect Skyline",
    modUrl: "https://modrinth.com/project/proyect-skyline",
    repoUrl: "https://github.com/cameagus2010-hub/ModDeMinecraft.git",
    members: ["Gabriel Camejo", "Valentina Ferix", "Leandro Marta"],
  },
  {
    number: 3,
    project: "HeeHee Mod",
    modUrl: "https://modrinth.com/mod/mod-terror-heehee",
    repoUrl: "https://github.com/perazalucas2-arch/Grupo_3_Mod_Minecraft.git",
    members: ["Lucas Peraza", "Lucas Jaques", "Facundo Gutierrez", "Nahuel Laurrauri"],
  },
  {
    number: 4,
    project: "La dimensión de Harry",
    repoUrl: "https://github.com/MalviRod/modminecraft_grupo_4",
    members: ["Malvina Rodríguez", "Marcos Rodríguez", "Tiago Mussini"],
  },
  {
    number: 6,
    project: "Dungeon Pintaluba",
    repoUrl: "https://github.com/LAFITUZAINGO/Mod_mc_Grupo-6",
    members: ["Manuel Pintaluba", "Sofia Cedres", "Leandro Alonso", "Rodrigo Alonso", "Fabian Guillermo"],
  },
];

export function meta() {
  return [{ title: "Equipos · Programación Avanzada" }];
}

const linkClass =
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[13px] font-medium transition-colors hover:border-foreground/30 hover:bg-muted active:translate-y-px";

export default function Equipos(_: Route.ComponentProps) {
  return (
    <PublicShell>
      <header className="mb-10 max-w-[58ch]">
        <h1 className="page-title">Equipos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los grupos del proyecto de modding, con su mod publicado y el repositorio del código.
        </p>
      </header>

      <ol className="divide-y border-t">
        {teams.map((t) => (
          <li
            key={t.number}
            className="grid gap-4 py-6 md:grid-cols-[4rem_minmax(0,1fr)_auto] md:items-start md:gap-8"
          >
            <span className="num text-sm text-muted-foreground md:pt-0.5">
              Grupo {t.number}
            </span>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight">{t.project}</h2>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {t.members.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {t.modUrl ? (
                <a href={t.modUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <Package className="size-3.5" />
                  Ver el mod
                </a>
              ) : (
                <span className="px-2.5 py-1.5 text-[13px] text-muted-foreground">
                  Mod sin publicar
                </span>
              )}
              <a href={t.repoUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <FolderGit2 className="size-3.5" />
                Repositorio
              </a>
            </div>
          </li>
        ))}
      </ol>
    </PublicShell>
  );
}
