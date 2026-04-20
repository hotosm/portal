import { useQuery } from "@tanstack/react-query";
import type { NormalizedProjectDetails } from "../types/projectsMap";

const UMAP_PRODUCTION_BASE_URL = "https://umap.hotosm.org";

function getUmapProductionUrl(mapUrl: string | null | undefined, mapId: string): string {
  if (mapUrl) {
    try {
      const parsed = new URL(mapUrl);
      return `${UMAP_PRODUCTION_BASE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      if (mapUrl.startsWith("/")) {
        return `${UMAP_PRODUCTION_BASE_URL}${mapUrl}`;
      }
    }
  }

  return `${UMAP_PRODUCTION_BASE_URL}/en/map/${mapId}`;
}

interface ShowcaseFeatureProperties {
  name: string;
  description?: string | null;
  author?: string | null;
  map_url?: string | null;
  map_id?: string | null;
}

interface ShowcaseFeature {
  type: string;
  geometry: { type: string; coordinates: [number, number] };
  properties: ShowcaseFeatureProperties;
}

interface ShowcaseResponse {
  type: string;
  features: ShowcaseFeature[];
  total: number;
}

async function fetchShowcaseDetails(
  mapId: string
): Promise<NormalizedProjectDetails> {
  const response = await fetch("/api/umap/showcase");
  if (!response.ok) {
    throw new Error(`Failed to fetch uMap showcase: ${response.status}`);
  }
  const data: ShowcaseResponse = await response.json();

  const feature = data.features.find(
    (f) => f.properties.map_id === mapId
  );

  if (!feature) {
    throw new Error(`uMap showcase map ${mapId} not found`);
  }

  const { name, description, author, map_url } = feature.properties;

  const metadata: Array<{ label: string; value: string }> = [];
  if (author) {
    metadata.push({ label: "Author", value: author });
  }

  const url = getUmapProductionUrl(map_url, mapId);

  return {
    id: mapId,
    name: name || `Map #${mapId}`,
    productName: "uMap Showcase",
    description: description
      ? description
          .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, "$1")
          .trim()
      : undefined,
    url,
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

export function useUMapShowcaseDetails(mapId: string | null) {
  return useQuery({
    queryKey: ["umap-showcase", mapId],
    queryFn: () => fetchShowcaseDetails(mapId!),
    enabled: mapId !== null,
  });
}
