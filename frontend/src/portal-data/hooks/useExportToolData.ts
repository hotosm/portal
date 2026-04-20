import { useQuery } from "@tanstack/react-query";
import type { ExportJobsResponse } from "../../types/projectsMap";
import { type IDataProject, mapExportJobsToDataProjects } from "../types";

export function useExportJobs() {
  return useQuery({
    queryKey: ["export-tool", "jobs", "me"],
    queryFn: async (): Promise<IDataProject[]> => {
      try {
        const response = await fetch("/api/export-tool/jobs/me?limit=20", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return [];
          }
          console.error("Error fetching export jobs:", await response.text());
          return [];
        }

        const data: ExportJobsResponse = await response.json();
        const jobs = data.results || [];
        return mapExportJobsToDataProjects(jobs);
      } catch (error) {
        console.error("Error fetching export jobs:", error);
        return [];
      }
    },
  });
}
