import { useState, useCallback } from "react";
import { ProjectMapFeature } from "../types/projectsMap";
import type { ProjectListData, UseProjectsMapCalloutReturn } from "../types/projectsMap/mapCallout";

export function useProjectsMapCallout(): UseProjectsMapCalloutReturn {
  const [selectedProjectId, setSelectedProjectId] = useState<number | string | null>(
    null
  );
  const [selectedProjects, setSelectedProjects] = useState<ProjectMapFeature[]>(
    []
  );
  const [locationName, setLocationName] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("tasking-manager");

  const handleProjectClick = useCallback(
    (projectId: number | string, data?: ProjectListData | string) => {
      if (projectId === "projects-list" && data && typeof data === 'object') {
        // Handle project list display (from geographic search or zoom)
        setSelectedProjectId(null);
        setSelectedProjects(data.projects);
        setLocationName(data.locationName);
      } else if (typeof projectId === "number" || typeof projectId === "string") {
        // Handle individual project click
        setSelectedProjects([]);
        setLocationName("");
        setSelectedProjectId(projectId);
        // Store product type if provided as string (from map marker or list click)
        if (typeof data === 'string' && data) {
          setSelectedProduct(data);
        } else {
          // Default to tasking-manager only if no product provided
          setSelectedProduct("tasking-manager");
        }
      }
    },
    []
  );

  const handleCloseDetails = useCallback(() => {
    setSelectedProjectId(null);
    setSelectedProjects([]);
    setLocationName("");
    setSelectedProduct("tasking-manager");
  }, []);

  // Computed property to check if callout is open
  const isCalloutOpen =
    selectedProjectId !== null || selectedProjects.length > 0;

  return {
    selectedProjectId,
    selectedProjects,
    locationName,
    selectedProduct,
    handleProjectClick,
    handleCloseDetails,
    isCalloutOpen,
  };
}
