import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Prose } from "~/components/bits";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * One deck renderer for both sides of the classroom: the teacher's presenter
 * view and the student's slides view. It owns the stage, the keyboard and the
 * rail; it does not own which slide is showing — the parent does, because for
 * a student that number can come from the teacher over the network.
 */

export function SlideDeck({
  slides,
  slide,
  onSlide,
  locked = false,
  lockedHint,
  className,
  children,
}: {
  slides: string[];
  slide: number;
  onSlide: (next: number) => void;
  /** Following someone else's deck: arrows and rail stop responding. */
  locked?: boolean;
  lockedHint?: string;
  className?: string;
  /** Status line rendered next to the controls (live badge, follow toggle). */
  children?: React.ReactNode;
}) {
  const total = slides.length;
  const wrapper = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const dir = useSlideDirection(slide);
  const { stage, content, fit } = useFitToStage(slide, slides);

  const go = useCallback(
    (delta: number) => {
      if (locked) return;
      const next = slide + delta;
      if (next >= 0 && next < total) onSlide(next);
    },
    [locked, onSlide, slide, total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;

      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        if (!locked) onSlide(0);
      } else if (e.key === "End") {
        if (!locked) onSlide(total - 1);
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, locked, onSlide, total]);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement != null);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else wrapper.current?.requestFullscreen?.().catch(() => {});
  }

  return (
    <div
      ref={wrapper}
      className={cn(
        "flex flex-col gap-3",
        fullscreen && "h-full justify-center gap-4 bg-background p-6",
        className,
      )}
    >
      <div
        ref={stage}
        style={{ "--deck-fit": fit } as React.CSSProperties}
        className={cn(
          "deck-stage relative overflow-hidden rounded-xl border bg-card",
          fullscreen ? "min-h-0 flex-1" : "aspect-[4/3] sm:aspect-[16/9]",
        )}
      >
        {/* Las diapositivas cortas quedan centradas; las largas las achica
            useFitToStage hasta que entren, porque una diapositiva proyectada
            que hay que scrollear es una diapositiva que nadie ve entera. */}
        <div key={slide} data-slide-dir={dir} className="h-full overflow-y-auto">
          <div
            ref={content}
            className="flex min-h-full flex-col justify-center px-[6cqmin] py-[5cqmin]"
          >
            <Prose text={slides[slide] ?? ""} className="deck-copy max-w-[52ch]" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => go(-1)}
            disabled={locked || slide === 0}
            aria-label="Diapositiva anterior"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => go(1)}
            disabled={locked || slide >= total - 1}
            aria-label="Diapositiva siguiente"
          >
            <ChevronRight />
          </Button>
          <span className="num ml-2 text-sm font-medium">
            {String(slide + 1).padStart(2, "0")}
            <span className="text-muted-foreground">/{String(total).padStart(2, "0")}</span>
          </span>
        </div>

        <SlideRail total={total} slide={slide} onSlide={onSlide} locked={locked} />

        <div className="ml-auto flex items-center gap-3">
          {locked && lockedHint && (
            <span className="text-xs text-muted-foreground">{lockedHint}</span>
          )}
          {children}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {fullscreen ? <Minimize2 /> : <Maximize2 />}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Segmented rail: a tick per slide, and each tick is the jump control for it.
// It reads as position at a glance without a filled progress track.
function SlideRail({
  total,
  slide,
  onSlide,
  locked,
}: {
  total: number;
  slide: number;
  onSlide: (next: number) => void;
  locked: boolean;
}) {
  if (total < 2) return null;
  return (
    <div className="flex min-w-[120px] flex-1 items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={locked}
          onClick={() => onSlide(i)}
          aria-label={`Ir a la diapositiva ${i + 1}`}
          aria-current={i === slide}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors disabled:cursor-default",
            i === slide
              ? "bg-brand"
              : i < slide
                ? "bg-border-strong"
                : "bg-border hover:not-disabled:bg-border-strong",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Encoge la diapositiva hasta que entra en el escenario. Mide después del
 * layout, siempre partiendo de escala 1, así una diapositiva corta nunca
 * hereda el achique de la anterior. Vuelve a medir cuando cambia el tamaño
 * del escenario, que es lo que pasa al entrar y salir de pantalla completa.
 */
function useFitToStage(slide: number, slides: string[]) {
  const stage = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);

  useLayoutEffect(() => {
    setFit(1);
  }, [slide, slides]);

  useLayoutEffect(() => {
    const stageEl = stage.current;
    const contentEl = content.current;
    if (!stageEl || !contentEl) return;

    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const available = stageEl.clientHeight;
        const needed = contentEl.scrollHeight;
        // El piso evita que una diapositiva enorme quede ilegible: a partir de
        // ahí es mejor cortarla en dos que seguir achicando.
        if (needed > available + 1) {
          setFit((f) => Math.max(0.5, f * (available / needed)));
        }
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageEl);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [slide, slides, fit]);

  return { stage, content, fit };
}

/** "forward" / "back" for the slide-change animation; undefined on first render.
    Derived during render (not in an effect) so the direction lands in the same
    commit as the slide it describes — an effect would always be one step late. */
function useSlideDirection(slide: number) {
  const [previous, setPrevious] = useState(slide);
  const [dir, setDir] = useState<"forward" | "back" | undefined>(undefined);

  if (previous !== slide) {
    setDir(slide > previous ? "forward" : "back");
    setPrevious(slide);
  }

  return dir;
}
