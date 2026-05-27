import { useQuery } from "@tanstack/react-query";
import type { IImageryProject, DroneProject, DroneApiResponse } from "../types";
import { getDroneTmBaseUrl } from "../../utils/envConfig";
import { useAuth } from "../../contexts/AuthContext";

export type { DroneProject, DroneApiResponse };

// Query keys for cache management
export const droneProjectsQueryKeys = {
  all: ["drone", "my-projects"] as const,
  user: () => [...droneProjectsQueryKeys.all] as const,
};

export function useDroneProjects() {
  const { isLogin } = useAuth();
  return useQuery({
    queryKey: droneProjectsQueryKeys.user(),
    queryFn: async (): Promise<IImageryProject[]> => {
      const allProjects: IImageryProject[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const response = await fetch(
          `/api/drone-tasking-manager/projects/user?page=${page}`,
          { credentials: "include" },
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return [];
          }
          if (response.status === 503) {
            return allProjects;
          }
          const errorText = await response.text();
          throw new Error(
            `[${response.status}] Failed to fetch drone projects: ${errorText}`,
          );
        }

        const data: DroneApiResponse = await response.json();

        const projects = data.results.map((project) => ({
          id: `drone-${project.id}`,
          title: project.name,
          href: `${getDroneTmBaseUrl()}/projects/${project.id}`,
          section: "drone" as const,
          image: project.image_url,
        }));

        allProjects.push(...projects);
        hasNext = data.pagination.has_next;
        page++;
      }

      return allProjects;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache (formerly cacheTime)
    refetchOnWindowFocus: true,
    retry: (failureCount, error) =>
      failureCount < 1 && !/\[5\d\d\]/.test(String((error as Error)?.message ?? "")),
    enabled: isLogin,
  });
}
