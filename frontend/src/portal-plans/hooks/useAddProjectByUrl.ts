import { useState } from "react";
import { m } from "../../paraglide/messages";
import { projectKey } from "../../utils/utils";
import { useResolveProjectUrl } from "./usePlans";
import { ProjectOption } from "../types";

export function useAddProjectByUrl() {
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const resolveUrl = useResolveProjectUrl();

  async function handleAddUrl({
    localSelected,
    onAdded,
  }: {
    localSelected: Set<string>;
    onAdded: (project: ProjectOption, key: string) => void;
  }) {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setUrlError(null);
    try {
      const result = await resolveUrl.mutateAsync(trimmed);
      const key = projectKey(result.app, result.project_id);
      if (localSelected.has(key)) {
        setUrlError(m.plan_picker_url_duplicate());
        return;
      }
      let resolvedUpstream = result.upstream;
      if (result.app === "chatmap" && !resolvedUpstream) {
        try {
          const r = await fetch(
            `https://chatmap.hotosm.org/api/v1/map/${result.project_id}`,
            { credentials: "include", headers: { accept: "application/json" } },
          );
          if (r.ok) {
            const d = await r.json();
            if (d?.name)
              resolvedUpstream = {
                name: d.name,
                id: d.id ?? result.project_id,
              };
          }
        } catch {
          // CORS or network error — fall back to UUID title
        }
      }
      if (result.app === "chatmap" && !resolvedUpstream) {
        setUrlError(m.plan_picker_url_chatmap_private());
        return;
      }

      const upstream = resolvedUpstream ?? {};
      const title =
        (upstream.name as string | undefined) ??
        (upstream.title as string | undefined) ??
        result.project_id;

      onAdded(
        {
          app: result.app,
          project_id: result.project_id,
          title,
          upstream: resolvedUpstream,
        },
        key,
      );
      setUrlInput("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg.includes("project_not_found")) {
        setUrlError(m.plan_picker_url_not_found());
      } else if (msg.includes("upstream_unavailable")) {
        setUrlError(m.plan_picker_url_service_unavailable());
      } else {
        setUrlError(m.plan_picker_url_not_recognized());
      }
    }
  }

  return {
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isPending: resolveUrl.isPending,
    handleAddUrl,
  };
}
