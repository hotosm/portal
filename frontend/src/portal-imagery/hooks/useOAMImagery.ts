import { useQuery } from "@tanstack/react-query";
import type { IImageryProject, OAMImageryResult, OAMApiResponse } from "../types";

export type { OAMImageryResult, OAMApiResponse };

// Get OAM URL from environment
const OAM_URL = import.meta.env.VITE_OAM_URL || "https://openaerialmap.org";

// Query keys for cache management
export const oamImageryQueryKeys = {
  all: ["oam", "my-imagery"] as const,
  user: () => [...oamImageryQueryKeys.all] as const,
};

/**
 * Hook to fetch user's OAM imagery with caching
 *
 * Features:
 * - Automatic caching with React Query
 * - 5 minute stale time (won't refetch if data is fresh)
 * - 30 minute cache time (keeps data in memory)
 * - Automatic background refetch on window focus
 */
export function useOAMImagery() {
  return useQuery({
    queryKey: oamImageryQueryKeys.user(),
    queryFn: async (): Promise<IImageryProject[]> => {
      const response = await fetch("/api/open-aerial-map/user/me", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return [];
        }
        if (response.status === 400) {
          return [];
        }
        const errorText = await response.text();
        throw new Error(`[${response.status}] Failed to fetch OAM imagery: ${errorText}`);
      }

      const data: OAMApiResponse = await response.json();
      const results = data.results || [];

      return results.map((item) => ({
        id: `oam-${item._id}`,
        title: item.title || "Untitled Imagery",
        href: `${OAM_URL}/#/${item._id}`,
        section: "oam" as const,
        image: item.properties?.thumbnail || "",
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/**
 * Get the raw OAM imagery data (without IImageryProject mapping)
 */
export function useOAMImageryRaw() {
  return useQuery({
    queryKey: [...oamImageryQueryKeys.user(), "raw"],
    queryFn: async (): Promise<OAMImageryResult[]> => {
      const response = await fetch("/api/open-aerial-map/user/me", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return [];
        }
        if (response.status === 400) {
          return [];
        }
        const errorText = await response.text();
        throw new Error(`[${response.status}] Failed to fetch OAM imagery: ${errorText}`);
      }

      const data: OAMApiResponse = await response.json();
      return data.results || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
