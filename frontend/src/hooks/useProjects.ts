import { useQuery } from "@tanstack/react-query";
import type {
  ProjectsMapResults,
  DroneProjectCentroid,
  OAMImagery,
  FAIRModelCentroid,
} from "../types/projectsMap";
import { ProductType } from "../types/projectsMap/products";

async function fetchTaskingManagerProjects(): Promise<
  ProjectsMapResults["features"]
> {
  try {
    const response = await fetch("/api/tasking-manager/projects");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Tasking Manager response error:", errorText);
      return [];
    }

    const data = await response.json();

    // Transform API response to match our expected format
    // The backend now enriches mapResults.features with project names
    return (
      data.mapResults?.features?.map((feature: any) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: feature.geometry.coordinates,
        },
        properties: {
          projectId: feature.properties.projectId,
          name: feature.properties.name || null,
          product: "tasking-manager" as ProductType,
        },
      })) || []
    );
  } catch (error) {
    console.error("Error fetching Tasking Manager projects:", error);
    return [];
  }
}

async function fetchDroneTaskingManagerProjects(): Promise<
  ProjectsMapResults["features"]
> {
  try {
    const response = await fetch(
      "/api/drone-tasking-manager/projects/centroids?results_per_page=1000"
    );

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

async function fetchFAIRModels(): Promise<ProjectsMapResults["features"]> {
  try {
    const response = await fetch("/api/fair/models/centroid");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("fAIr response error:", errorText);
      return [];
    }

    const data = await response.json();

    // Transform fAIr GeoJSON FeatureCollection to our format
    // The API returns: { type: "FeatureCollection", features: [{ type: "Feature", geometry: {...}, properties: { mid: number, name?: string } }] }
    return (
      data.features?.map((feature: FAIRModelCentroid) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: feature.geometry.coordinates,
        },
        properties: {
          projectId: feature.properties.mid,
          name: feature.properties.name || null, // Name is enriched by backend
          product: "fair" as ProductType,
        },
      })) || []
    );
  } catch (error) {
    console.error("Error fetching fAIr models:", error);
    return [];
  }
}

async function fetchOpenAerialMapProjects(): Promise<
  ProjectsMapResults["features"]
> {
  try {
    const response = await fetch("/api/open-aerial-map/projects?limit=100");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Open Aerial Map response error:", errorText);
      return [];
    }

    const data = await response.json();

    // Transform OAM imagery to map features using bbox centroid
    return (
      data.results
        ?.filter(
          (imagery: OAMImagery) => imagery.bbox && imagery.bbox.length === 4
        )
        .map((imagery: OAMImagery) => {
          // Calculate centroid from bbox [minLon, minLat, maxLon, maxLat]
          const bbox = imagery.bbox as [number, number, number, number];
          const centerLon = (bbox[0] + bbox[2]) / 2;
          const centerLat = (bbox[1] + bbox[3]) / 2;

          return {
            type: "Feature" as const,
            geometry: {
              type: "Point" as const,
              coordinates: [centerLon, centerLat] as [number, number],
            },
            properties: {
              projectId: imagery._id || imagery.uuid || "",
              name: imagery.title || null,
              product: "imagery" as ProductType,
            },
          };
        }) || []
    );
  } catch (error) {
    console.error("Error fetching Open Aerial Map projects:", error);
    return [];
  }
}

async function fetchProjects(): Promise<ProjectsMapResults> {
  // Fetch all sources in parallel - use allSettled to be resilient to individual failures
  const results = await Promise.allSettled([
    fetchTaskingManagerProjects(),
    fetchDroneTaskingManagerProjects(),
    fetchOpenAerialMapProjects(),
    fetchFAIRModels(),
  ]);

  // Extract successful results, falling back to empty arrays for failures
  const taskingManagerFeatures =
    results[0].status === "fulfilled" ? results[0].value : [];
  const droneFeatures =
    results[1].status === "fulfilled" ? results[1].value : [];
  const oamFeatures = results[2].status === "fulfilled" ? results[2].value : [];
  const fairFeatures = results[3].status === "fulfilled" ? results[3].value : [];

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const source = ["Tasking Manager", "Drone TM", "Open Aerial Map", "fAIr"][index];
      console.error(`Failed to fetch ${source} projects:`, result.reason);
    }
  });

  // Combine all features
  const allFeatures = [
    ...taskingManagerFeatures,
    ...droneFeatures,
    ...oamFeatures,
    ...fairFeatures,
  ];

  console.log(
    `Loaded ${taskingManagerFeatures.length} Tasking Manager, ${droneFeatures.length} Drone TM, ${oamFeatures.length} OAM, ${fairFeatures.length} fAIr projects`
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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 1, // Only retry once on failure
  });
}
