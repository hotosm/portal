import { useQuery } from "@tanstack/react-query";
import type { IImageryProject } from "../imageryProjects";

// Get Drone TM URL from environment
const DRONE_TM_URL =
  import.meta.env.VITE_DRONE_TM_URL ||
  import.meta.env.VITE_DRONE_TM_FRONTEND_URL ||
  "https://dronetm.org";

// Drone TM API types
export interface DroneProject {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  status: string;
  total_task_count: number;
  ongoing_task_count: number;
  completed_task_count: number;
}

export interface DroneApiResponse {
  results: DroneProject[];
  pagination: {
    has_next: boolean;
    has_prev: boolean;
    next_num: number | null;
    prev_num: number | null;
    page: number;
    per_page: number;
    total: number;
  };
}

// Query keys for cache management
export const droneProjectsQueryKeys = {
  all: ["drone", "my-projects"] as const,
  user: () => [...droneProjectsQueryKeys.all] as const,
};

/**
 * Hook to fetch user's Drone TM projects with caching
 *
 * Features:
 * - Automatic caching with React Query
 * - 5 minute stale time (won't refetch if data is fresh)
 * - 30 minute cache time (keeps data in memory)
 * - Automatic background refetch on window focus
 * - Pagination handled internally
 */
export function useDroneProjects() {
  return useQuery({
    queryKey: droneProjectsQueryKeys.user(),
    queryFn: async (): Promise<IImageryProject[]> => {
      try {
        const allProjects: IImageryProject[] = [];
        let page = 1;
        let hasNext = true;

        while (hasNext) {
          const response = await fetch(
            `/api/drone-tasking-manager/projects/user?page=${page}`,
            { credentials: "include" }
          );

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              return [];
            }
            console.error("Error fetching drone projects:", await response.text());
            return [];
          }

          const data: DroneApiResponse = await response.json();

          const projects = data.results.map((project) => ({
            id: `drone-${project.id}`,
            title: project.name,
            href: `${DRONE_TM_URL}/projects/${project.id}`,
            section: "drone" as const,
            image: project.image_url,
          }));

          allProjects.push(...projects);
          hasNext = data.pagination.has_next;
          page++;
        }

        return allProjects;
      } catch (error) {
        console.error("Error fetching drone projects:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache (formerly cacheTime)
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/**
 * Get the raw Drone project data (without IImageryProject mapping)
 */
export function useDroneProjectsRaw() {
  return useQuery({
    queryKey: [...droneProjectsQueryKeys.user(), "raw"],
    queryFn: async (): Promise<DroneProject[]> => {
      try {
        const allProjects: DroneProject[] = [];
        let page = 1;
        let hasNext = true;

        while (hasNext) {
          const response = await fetch(
            `/api/drone-tasking-manager/projects/user?page=${page}`,
            { credentials: "include" }
          );

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              return [];
            }
            console.error("Error fetching drone raw projects:", await response.text());
            return [];
          }

          const data: DroneApiResponse = await response.json();
          allProjects.push(...data.results);
          hasNext = data.pagination.has_next;
          page++;
        }

        return allProjects;
      } catch (error) {
        console.error("Error fetching drone raw projects:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}