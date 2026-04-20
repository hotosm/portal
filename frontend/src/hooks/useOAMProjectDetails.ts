import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { OAMImagery, OAMCompactImagery, NormalizedProjectDetails } from "../types/projectsMap";

// Try to find project in cached snapshot first (instant)
function findInSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string
): OAMCompactImagery | null {
  // Get cached projects data
  const projectsData = queryClient.getQueryData<{
    features: Array<{ properties: { projectId: string } }>;
  }>(["projects"]);

  if (!projectsData) return null;

  // The snapshot is fetched separately, try to get it from the API cache
  const snapshotData = queryClient.getQueryData<{
    results: OAMCompactImagery[];
  }>(["oam-snapshot"]);

  if (snapshotData?.results) {
    return snapshotData.results.find((item) => item._id === projectId) || null;
  }

  return null;
}

// Fetch snapshot and find project (fast, uses local file)
// Cache the snapshot in memory to avoid re-fetching
let snapshotCache: { results: OAMCompactImagery[] } | null = null;
let snapshotPromise: Promise<{ results: OAMCompactImagery[] } | null> | null = null;

async function getSnapshot(): Promise<{ results: OAMCompactImagery[] } | null> {
  if (snapshotCache) return snapshotCache;

  // Avoid multiple simultaneous fetches
  if (snapshotPromise) return snapshotPromise;

  snapshotPromise = fetch("/api/open-aerial-map/projects/snapshot")
    .then((response) => {
      if (!response.ok) return null;
      return response.json();
    })
    .then((data) => {
      snapshotCache = data;
      snapshotPromise = null;
      return data;
    })
    .catch(() => {
      snapshotPromise = null;
      return null;
    });

  return snapshotPromise;
}

async function fetchFromSnapshot(projectId: string): Promise<OAMCompactImagery | null> {
  const snapshot = await getSnapshot();
  if (!snapshot?.results) return null;
  return snapshot.results.find((item: OAMCompactImagery) => item._id === projectId) || null;
}

// Fallback: fetch from external OAM API (slow)
async function fetchFromExternalAPI(projectId: string): Promise<OAMImagery | null> {
  try {
    const response = await fetch(`/api/open-aerial-map/projects/${projectId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.results;
  } catch {
    return null;
  }
}

function normalizeCompactData(data: OAMCompactImagery, projectId: string): NormalizedProjectDetails {
  const metadata = [];

  if (data.prov) {
    metadata.push({ label: "Provider", value: data.prov });
  }

  if (data.acq) {
    const acquisitionDate = new Date(data.acq).toLocaleDateString();
    metadata.push({ label: "Acquisition", value: acquisitionDate });
  }

  if (data.gsd) {
    metadata.push({ label: "Resolution", value: `${data.gsd.toFixed(2)} m/px` });
  }

  // Calculate center from bbox for URL
  const bbox = data.bbox;
  const centerLon = bbox && bbox.length === 4 ? (bbox[0]! + bbox[2]!) / 2 : 0;
  const centerLat = bbox && bbox.length === 4 ? (bbox[1]! + bbox[3]!) / 2 : 0;

  return {
    id: projectId,
    name: data.t || `Imagery #${projectId}`,
    productName: "Open Aerial Map",
    thumbnail: data.th,
    url: `https://map.openaerialmap.org/#/${centerLon},${centerLat},14`,
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

function normalizeFullData(data: OAMImagery, projectId: string): NormalizedProjectDetails {
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
  const centerLon = bbox && bbox.length === 4 ? (bbox[0]! + bbox[2]!) / 2 : 0;
  const centerLat = bbox && bbox.length === 4 ? (bbox[1]! + bbox[3]!) / 2 : 0;

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
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["oam-project", projectId],
    queryFn: async (): Promise<NormalizedProjectDetails> => {
      if (!projectId) throw new Error("No project ID");

      // 1. Try cached snapshot first (instant)
      const cachedData = findInSnapshot(queryClient, projectId);
      if (cachedData) {
        return normalizeCompactData(cachedData, projectId);
      }

      // 2. Fetch from snapshot file (fast, local)
      const snapshotData = await fetchFromSnapshot(projectId);
      if (snapshotData) {
        return normalizeCompactData(snapshotData, projectId);
      }

      // 3. Fallback to external API (slow)
      const externalData = await fetchFromExternalAPI(projectId);
      if (externalData) {
        return normalizeFullData(externalData, projectId);
      }

      throw new Error(`Project ${projectId} not found`);
    },
    enabled: projectId !== null,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}