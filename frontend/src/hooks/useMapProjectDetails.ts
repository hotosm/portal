import { useQuery } from "@tanstack/react-query";
import type {
  DroneProjectDetails,
  NormalizedProjectDetails,
  OAMCompactImagery,
  OAMImagery,
  ProjectDetails,
} from "../types/projectsMap";
import type { ProductType } from "../types/projectsMap/products";
import { getFairModelUrl, getDroneTmBaseUrl, getUmapBaseUrl } from "../utils/envConfig";

interface FAIRModelDetailResponse {
  id: number;
  name: string | null;
  description: string | null;
  accuracy: number | null;
  status: number | null;
  base_model: string | null;
  published_training: number | null;
  thumbnail_url: string | null;
  user: {
    osm_id: number | null;
    username: string | null;
  } | null;
  dataset: {
    id: number;
    name: string | null;
    source_imagery: string | null;
  } | null;
}

interface UMapShowcaseFeatureProperties {
  name: string;
  description?: string | null;
  author?: string | null;
  map_url?: string | null;
  map_id?: string | null;
}

interface UMapShowcaseFeature {
  type: string;
  geometry: { type: string; coordinates: [number, number] };
  properties: UMapShowcaseFeatureProperties;
}

interface UMapShowcaseResponse {
  type: string;
  features: UMapShowcaseFeature[];
  total: number;
}

function getUmapUrl(mapUrl: string | null | undefined, mapId: string): string {
  const base = getUmapBaseUrl();
  if (mapUrl) {
    try {
      const parsed = new URL(mapUrl);
      return `${base}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      if (mapUrl.startsWith("/")) {
        return `${base}${mapUrl}`;
      }
    }
  }
  return `${base}/en/map/${mapId}`;
}

function normalizeTaskingManager(data: ProjectDetails, projectId: number): NormalizedProjectDetails {
  const metadata = [];

  if (data.organisationName) {
    metadata.push({ label: "Organisation", value: data.organisationName });
  }

  if (data.percentMapped !== undefined) {
    metadata.push({ label: "Mapped", value: `${data.percentMapped}%` });
  }

  if (data.percentValidated !== undefined) {
    metadata.push({ label: "Validated", value: `${data.percentValidated}%` });
  }

  return {
    id: projectId,
    name: data.projectInfo?.name || `Project #${projectId}`,
    productName: "Tasking Manager",
    description: data.projectInfo?.description,
    url: `https://tasks.hotosm.org/projects/${projectId}`,
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

function normalizeDrone(data: DroneProjectDetails, projectId: string): NormalizedProjectDetails {
  const metadata = [];

  if (data.author_name) {
    metadata.push({ label: "Author", value: data.author_name });
  }

  if (data.total_task_count && data.total_task_count > 0) {
    const completedTasks = data.completed_task_count || 0;
    const progressPercent = Math.round((completedTasks / data.total_task_count) * 100);
    metadata.push({
      label: "Progress",
      value: `${progressPercent}% (${completedTasks}/${data.total_task_count} tasks)`,
    });
  }

  return {
    id: projectId,
    name: data.name || `Drone Project #${projectId}`,
    productName: "Drone Tasking Manager",
    description: data.description,
    url: `${getDroneTmBaseUrl()}/projects/${projectId}`,
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

function normalizeOAMCompact(data: OAMCompactImagery, projectId: string): NormalizedProjectDetails {
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

function normalizeOAMFull(data: OAMImagery, projectId: string): NormalizedProjectDetails {
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

function normalizeFAIR(data: FAIRModelDetailResponse, modelId: number): NormalizedProjectDetails {
  const metadata = [];

  if (data.user?.username) {
    metadata.push({ label: "Author", value: data.user.username });
  }

  if (data.base_model) {
    metadata.push({ label: "Base Model", value: data.base_model });
  }

  if (data.accuracy !== null && data.accuracy !== undefined) {
    metadata.push({ label: "Accuracy", value: `${data.accuracy.toFixed(1)}%` });
  }

  if (data.dataset?.name) {
    metadata.push({ label: "Dataset", value: data.dataset.name });
  }

  const statusMap: Record<number, string> = {
    [-1]: "Archived",
    0: "Published",
    1: "Draft",
  };

  if (data.status !== null && data.status !== undefined) {
    metadata.push({
      label: "Status",
      value: statusMap[data.status] || `Status ${data.status}`,
    });
  }

  return {
    id: modelId,
    name: data.name || `Model #${modelId}`,
    productName: "fAIr",
    description: data.description || undefined,
    thumbnail: data.thumbnail_url || undefined,
    url: getFairModelUrl(modelId),
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

function normalizeUMap(data: UMapShowcaseResponse, mapId: string): NormalizedProjectDetails {
  const feature = data.features.find((f) => f.properties.map_id === mapId);

  const { name, description, author, map_url } = feature?.properties ?? {};
  const url = getUmapUrl(map_url, mapId);
  const metadata = author ? [{ label: "Author", value: author }] : [];

  return {
    id: mapId,
    name: name || `Map #${mapId}`,
    productName: "uMap Showcase",
    description: description
      ? description.replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, "$1").trim()
      : undefined,
    url,
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

async function fetchOAMProjectDetails(projectId: string): Promise<NormalizedProjectDetails> {
  const snapshotResponse = await fetch("/api/open-aerial-map/projects/snapshot");
  if (snapshotResponse.ok) {
    const snapshotData = await snapshotResponse.json();
    const snapshotItem = (snapshotData.results as OAMCompactImagery[]).find(
      (item) => item._id === projectId
    );
    if (snapshotItem) {
      return normalizeOAMCompact(snapshotItem, projectId);
    }
  }

  const response = await fetch(`/api/open-aerial-map/projects/${projectId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch OAM project ${projectId}`);
  }
  const data = await response.json();
  return normalizeOAMFull(data.results, projectId);
}

async function fetchProjectDetailsByProduct(
  product: ProductType,
  projectId: string | number
): Promise<NormalizedProjectDetails> {
  if (product === "tasking-manager") {
    const numericId = Number(projectId);
    const response = await fetch(`/api/tasking-manager/projectid/${numericId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Tasking Manager project ${projectId}`);
    }
    const data: ProjectDetails = await response.json();
    return normalizeTaskingManager(data, numericId);
  }

  if (product === "drone-tasking-manager") {
    const stringId = String(projectId);
    const response = await fetch(`/api/drone-tasking-manager/projects/${stringId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Drone project ${projectId}`);
    }
    const data: DroneProjectDetails = await response.json();
    return normalizeDrone(data, stringId);
  }

  if (product === "imagery") {
    return fetchOAMProjectDetails(String(projectId));
  }

  if (product === "fair") {
    const numericId = Number(projectId);
    const response = await fetch(`/api/fair/model/${numericId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch fAIr model ${projectId}`);
    }
    const data: FAIRModelDetailResponse = await response.json();
    return normalizeFAIR(data, numericId);
  }

  if (product === "umap") {
    const response = await fetch("/api/umap/showcase");
    if (!response.ok) {
      throw new Error("Failed to fetch uMap showcase");
    }
    const data: UMapShowcaseResponse = await response.json();
    return normalizeUMap(data, String(projectId));
  }

  throw new Error(`Unsupported product: ${product}`);
}

export function useMapProjectDetails(
  product: ProductType | null,
  projectId: number | string | null
) {
  return useQuery({
    queryKey: ["map-project-details", product, projectId],
    queryFn: () => fetchProjectDetailsByProduct(product!, projectId!),
    enabled: product !== null && projectId !== null && product !== "field",
  });
}
