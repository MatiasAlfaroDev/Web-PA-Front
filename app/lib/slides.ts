// A lesson is one markdown document; slides are just that document cut on a
// `---` line. No new schema, no second editor: lessons written before slides
// existed still open as a single slide, and a teacher adds breaks by typing
// three dashes where they want to pause.

const SEPARATOR = /^\s*---+\s*$/;
const FENCE = /^\s*```/;

/** Cut markdown into slides on `---` lines, ignoring separators inside code fences. */
export function splitSlides(markdown: string): string[] {
  const slides: string[] = [];
  let current: string[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (FENCE.test(line)) inFence = !inFence;

    if (!inFence && SEPARATOR.test(line)) {
      slides.push(current.join("\n"));
      current = [];
      continue;
    }
    current.push(line);
  }
  slides.push(current.join("\n"));

  const kept = slides.map((s) => s.trim()).filter((s) => s.length > 0);
  // An empty lesson still has to render something, or the deck has no stage.
  return kept.length > 0 ? kept : [""];
}

/** Heading of a slide, for the presenter's slide list. Falls back to its first line. */
export function slideTitle(markdown: string, index: number): string {
  const heading = markdown.split("\n").find((l) => /^#{1,3} \S/.test(l));
  if (heading) return heading.replace(/^#{1,3} /, "").trim();

  const firstLine = markdown.split("\n").find((l) => l.trim().length > 0)?.trim() ?? "";
  if (!firstLine) return `Diapositiva ${index + 1}`;
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine;
}

/** Clamp a slide index into a deck of `total` slides. */
export function clampSlide(index: number, total: number): number {
  return Math.min(Math.max(index, 0), Math.max(total - 1, 0));
}
