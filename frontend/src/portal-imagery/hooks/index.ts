// Drone TM hooks
export { useDroneProjects } from "./useDroneProjects";
export type { DroneProject } from "./useDroneProjects";

// OAM hooks
export {
  useOAMImagery,
  useOAMImageryRaw,
  oamImageryQueryKeys,
} from "./useOAMImagery";
export type { OAMImageryResult, OAMApiResponse } from "./useOAMImagery";

// Combined hook
export { useAllImageryData } from "./useImageryData";

// Legacy exports (deprecated - use named exports above)
export { useMyDroneProjects, useMyOAMImagery } from "./useImageryData";