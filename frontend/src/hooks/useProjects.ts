import { useQuery } from "@tanstack/react-query";
import type {
  ProjectsMapResults,
  DroneProjectCentroid,
  OAMCompactImagery,
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
    const features = (data.features || []).reduce(
      (acc: ProjectsMapResults["features"], feature: FAIRModelCentroid) => {
        const coordinates = feature?.geometry?.coordinates;
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
          return acc;
        }

        const lon = Number(coordinates[0]);
        const lat = Number(coordinates[1]);
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
          return acc;
        }

        acc.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
          properties: {
            projectId: feature.properties.mid,
            name: feature.properties.name || null,
            product: "fair",
          },
        });

        return acc;
      },
      []
    );

    return features;
  } catch (error) {
    console.error("Error fetching fAIr models:", error);
    return [];
  }
}

async function fetchOpenAerialMapProjects(): Promise<
  ProjectsMapResults["features"]
> {
  try {
    const response = await fetch("/api/open-aerial-map/projects/snapshot");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Open Aerial Map response error:", errorText);
      return [];
    }

    const data = await response.json();

    // Transform OAM compact imagery to map features using bbox centroid
    // Compact format: _id, t (title), bbox, gsd, acq, prov, tms, th
    return (
      data.results
        ?.filter(
          (imagery: OAMCompactImagery) => imagery.bbox && imagery.bbox.length === 4
        )
        .map((imagery: OAMCompactImagery) => {
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
              projectId: imagery._id || "",
              name: imagery.t || null, // t = title in compact format
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

interface ShowcaseFeature {
  type: string;
  geometry: { type: string; coordinates: [number, number] };
  properties: {
    name: string;
    map_id?: string | null;
  };
}

async function fetchUMapShowcase(): Promise<ProjectsMapResults["features"]> {
  try {
    const response = await fetch("/api/umap/showcase");

    if (!response.ok) {
      const errorText = await response.text();
      console.error("uMap Showcase response error:", errorText);
      return [];
    }

    const data = await response.json();

    return (
      data.features
        ?.filter(
          (f: ShowcaseFeature) =>
            f.geometry?.coordinates?.length === 2 && f.properties?.map_id
        )
        .map((f: ShowcaseFeature) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: f.geometry.coordinates,
          },
          properties: {
            projectId: f.properties.map_id as string,
            name: f.properties.name || null,
            product: "umap" as ProductType,
          },
        })) || []
    );
  } catch (error) {
    console.error("Error fetching uMap Showcase:", error);
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
    fetchUMapShowcase(),
  ]);

  // Extract successful results, falling back to empty arrays for failures
  const taskingManagerFeatures =
    results[0].status === "fulfilled" ? results[0].value : [];
  const droneFeatures =
    results[1].status === "fulfilled" ? results[1].value : [];
  const oamFeatures = results[2].status === "fulfilled" ? results[2].value : [];
  const fairFeatures = results[3].status === "fulfilled" ? results[3].value : [];
  const umapFeatures = results[4].status === "fulfilled" ? results[4].value : [];

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const source = ["Tasking Manager", "Drone TM", "Open Aerial Map", "fAIr", "uMap Showcase"][index];
      console.error(`Failed to fetch ${source} projects:`, result.reason);
    }
  });

  // Combine all features — fAIr and DroneTM before OAM so they win
  // MapLibre's symbol collision detection (icon-allow-overlap defaults to false).
  // fAIr model centroids overlap geographically with OAM imagery centroids because
  // fAIr models are trained on OAM data from the same areas; placing fAIr first
  // ensures those markers are not hidden by the 20k OAM icons.
  const allFeatures = [
    ...taskingManagerFeatures,
    ...droneFeatures,
    ...fairFeatures,
    ...umapFeatures,
    ...oamFeatures,
  ];

  console.log(
    `Loaded ${taskingManagerFeatures.length} Tasking Manager, ${droneFeatures.length} Drone TM, ${oamFeatures.length} OAM, ${fairFeatures.length} fAIr, ${umapFeatures.length} uMap Showcase projects`
  );

  return {
    type: "FeatureCollection",
    features: allFeatures,
  };
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects", "v2"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 1, // Only retry once on failure
  });
}
