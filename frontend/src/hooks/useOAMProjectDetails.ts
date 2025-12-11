import { useQuery } from "@tanstack/react-query";
import type { OAMImagery, NormalizedProjectDetails } from "../types/projectsMap";

async function fetchOAMProjectDetails(projectId: string): Promise<OAMImagery> {
  const response = await fetch(`/api/open-aerial-map/projects/${projectId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch OAM project details:", errorText);
    throw new Error(`Failed to fetch OAM project ${projectId}`);
  }

  const data = await response.json();
  // The API returns { meta, results } where results is the single imagery object
  return data.results;
}

function normalizeOAMProjectDetails(data: OAMImagery, projectId: string): NormalizedProjectDetails {
  const metadata = [];
  
  if (data.provider) {
    metadata.push({ label: "Provider", value: data.provider });
  }
  
  if (data.platform) {
    metadata.push({ label: "Platform", value: data.platform });
  }
  
  if (data.acquisition_start) {
    const acquisitionDate = new Date(data.acquisition_start).toLocaleDateString();
    metadata.push({ label: "Acquisition", value: acquisitionDate });
  }

  // Calculate center from bbox for URL
  const bbox = data.bbox;
  const centerLon = bbox && bbox.length === 4 && bbox[0] !== undefined && bbox[2] !== undefined ? (bbox[0] + bbox[2]) / 2 : 0;
  const centerLat = bbox && bbox.length === 4 && bbox[1] !== undefined && bbox[3] !== undefined ? (bbox[1] + bbox[3]) / 2 : 0;

  return {
    id: projectId,
    name: data.title || `Imagery #${projectId}`,
    productName: "Open Aerial Map",
    thumbnail: data.properties?.thumbnail,
    url: `https://map.openaerialmap.org/#/${centerLon},${centerLat},14`,
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

export function useOAMProjectDetails(projectId: string | null) {
  return useQuery({
    queryKey: ["oam-project", projectId],
    queryFn: async () => {
      const data = await fetchOAMProjectDetails(projectId!);
      return normalizeOAMProjectDetails(data, projectId!);
    },
    enabled: projectId !== null,
  });
}
