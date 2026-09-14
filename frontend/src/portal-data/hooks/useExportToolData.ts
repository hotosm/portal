import { useQuery } from "@tanstack/react-query";
import type { ExportJobsResponse } from "../../types/projectsMap";
import { type IDataProject, mapExportJobsToDataProjects } from "../types";
import { useAuth } from "../../contexts/AuthContext";

interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export function useExportJobs(page = 1, limit = 6, enabled = true) {
  const offset = (page - 1) * limit;
  const { isLogin } = useAuth();
  return useQuery({
    queryKey: ["export-tool", "jobs", "me", page, limit],
    queryFn: async (): Promise<PaginatedResult<IDataProject>> => {
      const response = await fetch(
        `/api/export-tool/jobs/me?limit=${limit}&offset=${offset}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return { items: [], total: 0 };
        }
        const errorText = await response.text();
        throw new Error(
          `[${response.status}] Failed to fetch export jobs: ${errorText}`,
        );
      }

      const data: ExportJobsResponse = await response.json();
      return {
        items: mapExportJobsToDataProjects(data.results || []),
        total: data.count,
      };
    },
    enabled: isLogin && enabled,
    retry: (failureCount, error) =>
      failureCount < 1 && !/\[5\d\d\]/.test(String((error as Error)?.message ?? "")),
  });
}
