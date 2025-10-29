import { useQuery } from "@tanstack/react-query";
import type { ProjectsMapResults } from "../types/projectsMap/taskingManager";
import { ProductType } from "../constants/sampleProjectsData";

async function fetchProjects(): Promise<ProjectsMapResults> {
  const response = await fetch("/api/tasking-manager/projects");

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Response error:", errorText);
    throw new Error("Failed to fetch projects");
  }

  const data = await response.json();
  console.log("API response:", data);

  // Transform API response to match our expected format - minimal data only
  const features =
    data.mapResults?.features?.map((feature: any) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: feature.geometry.coordinates,
      },
      properties: {
        projectId: feature.properties.projectId,
        product: "tasking-manager" as ProductType,
      },
    })) || [];

  return {
    type: "FeatureCollection",
    features,
  };
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
}
