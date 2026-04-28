import { useExportJobs } from "../../portal-data/hooks/useExportToolData";
import { useMyMaps } from "../../portal-data/hooks/useUMapData";
import { useFieldTMProjects } from "../../portal-field/hooks/useFieldTMProjects";
import { useDroneProjectsRaw } from "../../portal-imagery/hooks/useDroneProjects";
import { useOAMImageryRaw } from "../../portal-imagery/hooks/useOAMImagery";
import { useMyModels } from "../../portal-mapping/hooks/useFairData";
import type { AppName } from "../types";

export interface ProjectOption {
  app: AppName;
  project_id: string;
  title: string;
}

export interface ProjectSource {
  app: AppName;
  label: string;
  projects: ProjectOption[];
  isLoading: boolean;
  isError: boolean;
}

export const APP_LABELS: Record<AppName, string> = {
  "drone-tasking-manager": "Drone TM",
  "export-tool": "Export Tool",
  fair: "fAIr",
  "field-tm": "Field TM",
  "open-aerial-map": "OpenAerialMap",
  "tasking-manager": "Tasking Manager",
  umap: "uMap",
};

export function useAllUserProjects() {
  const drone = useDroneProjectsRaw();
  const oam = useOAMImageryRaw();
  const fair = useMyModels(1, 50);
  const fieldTM = useFieldTMProjects();
  const umap = useMyMaps();
  const exportJobs = useExportJobs();

  const sources: ProjectSource[] = [
    {
      app: "drone-tasking-manager",
      label: APP_LABELS["drone-tasking-manager"],
      projects: (drone.data ?? []).map((p) => ({
        app: "drone-tasking-manager" as AppName,
        project_id: p.id,
        title: p.name,
      })),
      isLoading: drone.isLoading,
      isError: drone.isError,
    },
    {
      app: "open-aerial-map",
      label: APP_LABELS["open-aerial-map"],
      projects: (oam.data ?? []).map((p) => ({
        app: "open-aerial-map" as AppName,
        project_id: p._id,
        title: p.title || "Untitled Imagery",
      })),
      isLoading: oam.isLoading,
      isError: oam.isError,
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
      app: "field-tm",
      label: APP_LABELS["field-tm"],
      projects: (fieldTM.data ?? []).map((p) => ({
        app: "field-tm" as AppName,
        project_id: String(p.id),
        title: p.title,
      })),
      isLoading: fieldTM.isLoading,
      isError: false,
    },
    {
      app: "umap",
      label: APP_LABELS.umap,
      projects: (umap.data ?? []).map((p) => ({
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
  ];

  const projects: ProjectOption[] = sources.flatMap((s) => s.projects);
  const isLoading = sources.some((s) => s.isLoading);

  return { sources, projects, isLoading };
}
