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
        // Navigate to individual project — preserve list state so user can go back
        setSelectedProjectId(projectId);
        if (typeof data === 'string' && data) {
          setSelectedProduct(data);
        } else {
          setSelectedProduct("tasking-manager");
        }
      }
    },
    []
  );

  const handleCloseDetails = useCallback(() => {
    if (selectedProjectId !== null && selectedProjects.length > 0) {
      // Coming from a list: go back to the list instead of closing entirely
      setSelectedProjectId(null);
      setSelectedProduct("tasking-manager");
    } else {
      // No backing list: close the panel entirely
      setSelectedProjectId(null);
      setSelectedProjects([]);
      setLocationName("");
      setSelectedProduct("tasking-manager");
    }
  }, [selectedProjectId, selectedProjects.length]);

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
