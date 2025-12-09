import { useQuery } from "@tanstack/react-query";
import type {
  ProjectsMapResults,
  DroneProjectCentroid,
} from "../types/projectsMap/taskingManager";
import { ProductType } from "../constants/sampleProjectsData";

async function fetchTaskingManagerProjects(): Promise<ProjectsMapResults["features"]> {
  try {
    const response = await fetch("/api/tasking-manager/projects");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Tasking Manager response error:", errorText);
      return [];
    }

    const data = await response.json();

    // Create a map of projectId -> name from results for quick lookup
    const projectNamesMap = new Map<number, string | null>();
    data.results?.forEach((project: any) => {
      if (project.projectId) {
        projectNamesMap.set(project.projectId, project.projectInfo?.name || null);
      }
    });

    // Transform API response to match our expected format
    return (
      data.mapResults?.features?.map((feature: any) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: feature.geometry.coordinates,
        },
        properties: {
          projectId: feature.properties.projectId,
          name: projectNamesMap.get(feature.properties.projectId) || null,
          product: "tasking-manager" as ProductType,
        },
      })) || []
    );
  } catch (error) {
    console.error("Error fetching Tasking Manager projects:", error);
    return [];
  }
}

async function fetchDroneTaskingManagerProjects(): Promise<ProjectsMapResults["features"]> {
  try {
    const response = await fetch("/api/drone-tasking-manager/projects/centroids?results_per_page=1000");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Drone TM response error:", errorText);
      return [];
    }

    const data = await response.json();

    // Transform drone projects to match our expected format
    return (
      data.results?.map((project: DroneProjectCentroid) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: project.centroid.coordinates,
        },
        properties: {
          projectId: project.id,
          name: project.name,
          product: "drone-tasking-manager" as ProductType,
        },
      })) || []
    );
  } catch (error) {
    console.error("Error fetching Drone TM projects:", error);
    return [];
  }
}

async function fetchProjects(): Promise<ProjectsMapResults> {
  // Fetch both sources in parallel
  const [taskingManagerFeatures, droneFeatures] = await Promise.all([
    fetchTaskingManagerProjects(),
    fetchDroneTaskingManagerProjects(),
  ]);

  // Combine all features
  const allFeatures = [...taskingManagerFeatures, ...droneFeatures];

  console.log(
    `Loaded ${taskingManagerFeatures.length} Tasking Manager projects and ${droneFeatures.length} Drone TM projects`
  );

  return {
    type: "FeatureCollection",
    features: allFeatures,
  };
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
}
