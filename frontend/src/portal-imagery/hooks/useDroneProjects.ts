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

export function useDroneProjects(enabled = true) {
  const { isLogin } = useAuth();
  return useQuery({
    queryKey: droneProjectsQueryKeys.user(),
    queryFn: async (): Promise<IImageryProject[]> => {
      const fetchPage = async (
        page: number,
      ): Promise<DroneApiResponse | null> => {
        const response = await fetch(
          `/api/drone-tasking-manager/projects/user?page=${page}`,
          { credentials: "include" },
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return null;
          }
          const errorText = await response.text();
          throw new Error(
            `[${response.status}] Failed to fetch drone projects: ${errorText}`,
          );
        }

        return response.json();
      };

      const toProjects = (data: DroneApiResponse): IImageryProject[] =>
        data.results.map((project) => ({
          id: `drone-${project.id}`,
          title: project.name,
          href: `${getDroneTmBaseUrl()}/projects/${project.id}`,
          section: "drone" as const,
          image: project.image_url,
        }));

      const firstPage = await fetchPage(1);
      if (!firstPage) {
        return [];
      }

      const { total, per_page: perPage } = firstPage.pagination;
      const totalPages = perPage > 0 ? Math.ceil(total / perPage) : 1;

      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) =>
          fetchPage(i + 2),
        ),
      );

      return [
        ...toProjects(firstPage),
        ...remainingPages.flatMap((data) => (data ? toProjects(data) : [])),
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache (formerly cacheTime)
    refetchOnWindowFocus: true,
    retry: (failureCount, error) =>
      failureCount < 1 && !/\[5\d\d\]/.test(String((error as Error)?.message ?? "")),
    enabled: isLogin && enabled,
  });
}
