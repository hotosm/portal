import { useQuery } from "@tanstack/react-query";
import type { ExportJobsResponse } from "../../types/projectsMap";
import { type IDataProject, mapExportJobsToDataProjects } from "../types";
<<<<<<< HEAD
=======
import { useAuth } from "../../contexts/AuthContext";
>>>>>>> develop

interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export function useExportJobs(page = 1, limit = 6) {
  const offset = (page - 1) * limit;
  const { isLogin } = useAuth();
  return useQuery({
    queryKey: ["export-tool", "jobs", "me", page, limit],
    queryFn: async (): Promise<PaginatedResult<IDataProject>> => {
      try {
        const response = await fetch(
          `/api/export-tool/jobs/me?limit=${limit}&offset=${offset}`,
          { credentials: "include" },
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return { items: [], total: 0 };
          }
          console.error("Error fetching export jobs:", await response.text());
          return { items: [], total: 0 };
        }

        const data: ExportJobsResponse = await response.json();
        return {
          items: mapExportJobsToDataProjects(data.results || []),
          total: data.count,
        };
      } catch (error) {
        console.error("Error fetching export jobs:", error);
        return { items: [], total: 0 };
      }
    },
    enabled: isLogin,
    retry: false,
  });
}
