import { useState, useEffect, useCallback } from 'react';
import { ProjectMapFeature } from '../types/projectsMap/taskingManager';

interface ProjectListData {
  projects: ProjectMapFeature[];
  locationName: string;
}

interface UseProjectsMapCalloutReturn {
  selectedProjectId: number | null;
  selectedProjects: ProjectMapFeature[];
  locationName: string;
  handleProjectClick: (projectId: number | string, data?: ProjectListData) => void;
  handleCloseDetails: () => void;
  isCalloutOpen: boolean;
}

export function useProjectsMapCallout(): UseProjectsMapCalloutReturn {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<ProjectMapFeature[]>([]);
  const [locationName, setLocationName] = useState<string>('');

  const handleProjectClick = useCallback((projectId: number | string, data?: ProjectListData) => {
    if (projectId === 'projects-list' && data) {
      // Handle project list display (from geographic search or zoom)
      console.log('Showing projects in area:', data.locationName, data.projects);
      setSelectedProjectId(null);
      setSelectedProjects(data.projects);
      setLocationName(data.locationName);
    } else if (typeof projectId === 'number') {
      // Handle individual project click
      console.log('Project clicked:', projectId);
      setSelectedProjects([]);
      setLocationName('');
      setSelectedProjectId(projectId);
    }
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedProjectId(null);
    setSelectedProjects([]);
    setLocationName('');
  }, []);

  // Listen for popup button clicks (view project details)
  useEffect(() => {
    const handleViewProject = (event: CustomEvent) => {
      const projectId = event.detail?.projectId;
      if (projectId) {
        console.log('View project details:', projectId);
        // TODO: Navigate to project details page
        // Example: navigate(`/projects/${projectId}`);
        alert(
          `Viewing project #${projectId}\\n\\nThis will navigate to the project details page.`
        );
      }
    };

    window.addEventListener('viewProject' as any, handleViewProject as any);
    return () => {
      window.removeEventListener('viewProject' as any, handleViewProject as any);
    };
  }, []);

  // Computed property to check if callout is open
  const isCalloutOpen = selectedProjectId !== null || selectedProjects.length > 0;

  return {
    selectedProjectId,
    selectedProjects,
    locationName,
    handleProjectClick,
    handleCloseDetails,
    isCalloutOpen,
  };
}