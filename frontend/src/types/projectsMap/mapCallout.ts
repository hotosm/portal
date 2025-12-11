import { ProjectMapFeature } from "./index";

/**
 * Data structure for displaying a list of projects (from geographic search or zoom)
 */
export interface ProjectListData {
  projects: ProjectMapFeature[];
  locationName: string;
}

/**
 * Return type for the useProjectsMapCallout hook
 */
export interface UseProjectsMapCalloutReturn {
  selectedProjectId: number | string | null;
  selectedProjects: ProjectMapFeature[];
  locationName: string;
  selectedProduct: string;
  handleProjectClick: (
    projectId: number | string,
    data?: ProjectListData | string
  ) => void;
  handleCloseDetails: () => void;
  isCalloutOpen: boolean;
}
