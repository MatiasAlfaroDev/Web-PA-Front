import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { useFetcher } from "react-router";

type ActionData = { ok: boolean; message?: string; error?: string } | undefined;

// Fires a toast once per completed fetcher submission (success or error), so
// mutations that don't otherwise change visible layout still confirm.
// fetcher.formData is already cleared by the time state is back to "idle",
// so the success message must come from the action's return value, not the
// submitted form — pass a fallback for actions that don't set one.
export function useActionToast(fetcher: ReturnType<typeof useFetcher<ActionData>>, fallbackSuccessMessage: string) {
  const last = useRef(fetcher.data);
  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data || fetcher.data === last.current) return;
    last.current = fetcher.data;
    if (fetcher.data.ok) toast.success(fetcher.data.message ?? fallbackSuccessMessage);
    else toast.error(fetcher.data.error ?? "Ocurrió un error.");
  }, [fetcher.state, fetcher.data, fallbackSuccessMessage]);
}
