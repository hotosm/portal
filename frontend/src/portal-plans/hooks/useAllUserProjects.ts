import { useMemo } from "react";
import { useExportJobs } from "../../portal-data/hooks/useExportToolData";
import { useMyMaps } from "../../portal-data/hooks/useUMapData";
import { useDroneProjects } from "../../portal-imagery/hooks/useDroneProjects";
import { useMyModels } from "../../portal-mapping/hooks/useFairData";
import type { AppName, ProjectOption, ProjectSource } from "../types";

export const FETCHED_APPS = new Set<AppName>([
  "drone-tasking-manager",
  "fair",
  "umap",
  "export-tool",
]);

export const APP_LABELS: Record<AppName, string> = {
  chatmap: "ChatMap",
  "drone-tasking-manager": "Drone TM",
  "export-tool": "Export Tool",
  fair: "fAIr",
  "field-tm": "Field TM",
  "open-aerial-map": "OpenAerialMap",
  "tasking-manager": "Tasking Manager",
  umap: "uMap",
};

export function useAllUserProjects() {
  const drone = useDroneProjects();
  const fair = useMyModels(1, 50);
  const umap = useMyMaps(1, 50);
  const exportJobs = useExportJobs();

  const sources = useMemo<ProjectSource[]>(
    () => [
      {
        app: "drone-tasking-manager",
        label: APP_LABELS["drone-tasking-manager"],
        projects: (drone.data ?? []).map((p) => ({
          app: "drone-tasking-manager" as AppName,
          project_id: p.id,
          title: p.title,
        })),
        isLoading: drone.isLoading,
        isError: drone.isError,
      },
      {
        app: "fair",
        label: APP_LABELS.fair,
        projects: (fair.data?.items ?? []).map((p) => ({
          app: "fair" as AppName,
          project_id: String(p.id),
          title: p.title,
        })),
        isLoading: fair.isLoading,
        isError: fair.isError,
      },
      {
        app: "umap",
        label: APP_LABELS.umap,
        projects: (umap.data?.items ?? []).map((p) => ({
          app: "umap" as AppName,
          project_id: String(p.id),
          title: p.title,
        })),
        isLoading: umap.isLoading,
        isError: umap.isError,
      },
      {
        app: "export-tool",
        label: APP_LABELS["export-tool"],
        projects: (exportJobs.data?.items ?? []).map((p) => ({
          app: "export-tool" as AppName,
          project_id: String(p.id),
          title: p.title,
        })),
        isLoading: exportJobs.isLoading,
        isError: exportJobs.isError,
      },
    ],
    [
      drone.data,
      drone.isLoading,
      drone.isError,
      fair.data,
      fair.isLoading,
      fair.isError,
      umap.data,
      umap.isLoading,
      umap.isError,
      exportJobs.data,
      exportJobs.isLoading,
      exportJobs.isError,
    ],
  );

  const projects = useMemo<ProjectOption[]>(
    () => sources.flatMap((s) => s.projects),
    [sources],
  );
  const isLoading = sources.some((s) => s.isLoading);
  const isError = sources.some((s) => s.isError);

  return { sources, projects, isLoading, isError };
}
