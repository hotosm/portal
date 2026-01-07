import { useDroneProjects } from "./useDroneProjects";
import { useOAMImagery } from "./useOAMImagery";

// Re-export individual hooks for convenience
export { useDroneProjects, useDroneProjectsRaw } from "./useDroneProjects";
export { useOAMImagery, useOAMImageryRaw } from "./useOAMImagery";

// Re-export types
export type { DroneProject, DroneApiResponse } from "./useDroneProjects";
export type { OAMImageryResult, OAMApiResponse } from "./useOAMImagery";

/**
 * Combined hook to fetch all imagery data (Drone TM + OAM)
 *
 * This hook combines both Drone TM projects and OAM imagery
 * into a single interface with unified loading and error states.
 *
 * Features:
 * - Parallel fetching of both data sources
 * - Individual and combined loading states
 * - Cached data with 5 minute stale time
 * - Automatic background refetch on window focus
 */
export function useAllImageryData() {
  const droneQuery = useDroneProjects();
  const oamQuery = useOAMImagery();

  const isLoading = droneQuery.isLoading || oamQuery.isLoading;
  const isError = droneQuery.isError || oamQuery.isError;
  const error = droneQuery.error || oamQuery.error;

  const droneProjects = droneQuery.data || [];
  const oamProjects = oamQuery.data || [];
  const allProjects = [...droneProjects, ...oamProjects];

  return {
    // Combined data
    allProjects,
    droneProjects,
    oamProjects,
    // Loading states
    isLoading,
    isDroneLoading: droneQuery.isLoading,
    isOAMLoading: oamQuery.isLoading,
    // Error states
    isError,
    error,
    // Individual query objects for advanced usage
    droneQuery,
    oamQuery,
    // Refetch functions
    refetch: () => {
      droneQuery.refetch();
      oamQuery.refetch();
    },
  };
}

// Legacy exports for backwards compatibility
export const useMyDroneProjects = useDroneProjects;
export const useMyOAMImagery = useOAMImagery;