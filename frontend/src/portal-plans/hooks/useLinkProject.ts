import { useState, useEffect } from "react";
import type { AppName, ProjectOption } from "../types";
import { useAddProjectByUrl } from "./useAddProjectByUrl";
import { useAllUserProjects } from "./useAllUserProjects";

export function useLinkProject({ open, app }: { open: boolean; app: AppName }) {
  const { sources } = useAllUserProjects();
  const source = sources.find((s) => s.app === app);
  const [selected, setSelected] = useState<ProjectOption | null>(null);
  const [extraProjects, setExtraProjects] = useState<ProjectOption[]>([]);
  const { urlInput, setUrlInput, urlError, setUrlError, isPending, handleAddUrl: handleAddUrlBase } = useAddProjectByUrl();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only reset on open transition
  useEffect(() => {
    if (open) {
      setSelected(null);
      setExtraProjects([]);
      setUrlInput("");
      setUrlError(null);
    }
  }, [open]);

  function handleProjectAdded(project: ProjectOption, _key: string) {
    if (project.app !== app) {
      setUrlError("This URL belongs to a different tool.");
      return;
    }
    setExtraProjects((prev) => {
      if (prev.some((p) => p.project_id === project.project_id)) return prev;
      return [...prev, project];
    });
    setSelected(project);
  }

  const sourceProjects = source?.projects ?? [];
  const seenIds = new Set(sourceProjects.map((p) => p.project_id));
  const allProjects = [
    ...sourceProjects,
    ...extraProjects.filter((e) => !seenIds.has(e.project_id)),
  ];

  function handleAddUrl() {
    handleAddUrlBase({
      localSelected: new Set(
        selected ? [`${selected.app}:${selected.project_id}`] : [],
      ),
      onAdded: handleProjectAdded,
    });
  }

  return {
    selected,
    setSelected,
    allProjects,
    isLoading: source?.isLoading ?? false,
    isError: source?.isError ?? false,
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isPending,
    handleAddUrl,
  };
}
