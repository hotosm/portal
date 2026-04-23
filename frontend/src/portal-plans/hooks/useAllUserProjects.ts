import { useDroneProjectsRaw } from "../../portal-imagery/hooks/useDroneProjects";
import { useOAMImageryRaw } from "../../portal-imagery/hooks/useOAMImagery";
import { useMyModels } from "../../portal-mapping/hooks/useFairData";
import { useFieldTMProjects } from "../../portal-field/hooks/useFieldTMProjects";
import { useMyMaps } from "../../portal-data/hooks/useUMapData";
import { useExportJobs } from "../../portal-data/hooks/useExportToolData";
import type { AppName } from "../types";

export interface ProjectOption {
  app: AppName;
  project_id: string;
  title: string;
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

  const isLoading =
    drone.isLoading ||
    oam.isLoading ||
    fair.isLoading ||
    fieldTM.isLoading ||
    umap.isLoading ||
    exportJobs.isLoading;

  const projects: ProjectOption[] = [
    ...(drone.data ?? []).map((p) => ({
      app: "drone-tasking-manager" as AppName,
      project_id: p.id,
      title: p.name,
    })),
    ...(oam.data ?? []).map((p) => ({
      app: "open-aerial-map" as AppName,
      project_id: p._id,
      title: p.title || "Untitled Imagery",
    })),
    ...(fair.data?.items ?? []).map((p) => ({
      app: "fair" as AppName,
      project_id: String(p.id),
      title: p.title,
    })),
    ...(fieldTM.data ?? []).map((p) => ({
      app: "field-tm" as AppName,
      project_id: String(p.id),
      title: p.title,
    })),
    ...(umap.data ?? []).map((p) => ({
      app: "umap" as AppName,
      project_id: String(p.id),
      title: p.title,
    })),
    ...(exportJobs.data?.items ?? []).map((p) => ({
      app: "export-tool" as AppName,
      project_id: String(p.id),
      title: p.title,
    })),
  ];

  return { projects, isLoading };
}
