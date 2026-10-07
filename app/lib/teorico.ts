// El teórico de Minecraft vive en docs/teorico/*.md y entra al bundle como
// texto en tiempo de build. Una sola fuente de verdad: se edita el markdown y
// el sitio cambia, sin copiar contenido a un .ts ni depender de la API.
//
// Cada archivo ya viene cortado en diapositivas con líneas de ---, igual que
// una lección del Teórico normal.

import { splitSlides } from "./slides";

const files = import.meta.glob("../../docs/teorico/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export interface Lecture {
  slug: string;
  /** "01", "02"… tal como numera el archivo. */
  number: string;
  title: string;
  /** La línea bajo el título: de qué va la clase. */
  lead: string;
  markdown: string;
  slideCount: number;
}

function parse(path: string, markdown: string): Lecture | null {
  const file = path.split("/").pop() ?? "";
  const named = file.match(/^(\d+)-(.+)\.md$/);
  // imagenes.md y cualquier otra nota suelta no son clases.
  if (!named) return null;

  const lines = markdown.split("\n");
  const heading = lines.find((l) => l.startsWith("# ")) ?? "";
  const lead = lines
    .slice(lines.indexOf(heading) + 1)
    .find((l) => l.trim().length > 0 && !l.startsWith("#"))
    ?.trim();

  return {
    slug: named[2],
    number: named[1],
    // El encabezado trae su propio número ("# 1. Cómo funciona Minecraft");
    // lo sacamos acá porque la lista ya lo muestra en su columna.
    title: heading.replace(/^#\s*\d+\.\s*/, "").replace(/^#\s*/, ""),
    lead: lead ?? "",
    markdown,
    slideCount: splitSlides(markdown).length,
  };
}

export const lectures: Lecture[] = Object.entries(files)
  .map(([path, markdown]) => parse(path, markdown))
  .filter((l): l is Lecture => l !== null)
  .sort((a, b) => a.number.localeCompare(b.number));

export function lectureBySlug(slug?: string): Lecture | undefined {
  return lectures.find((l) => l.slug === slug);
}
