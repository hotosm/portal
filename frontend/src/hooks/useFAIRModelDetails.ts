import { useQuery } from "@tanstack/react-query";
import type { NormalizedProjectDetails } from "../types/projectsMap";

interface FAIRModelDetailResponse {
  id: number;
  name: string | null;
  description: string | null;
  accuracy: number | null;
  status: number | null;
  base_model: string | null;
  published_training: number | null;
  thumbnail_url: string | null;
  created_at: string | null;
  last_modified: string | null;
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

async function fetchFAIRModelDetails(
  modelId: number
): Promise<FAIRModelDetailResponse> {
  const response = await fetch(`/api/fair/model/${modelId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch fAIr model details:", errorText);
    throw new Error(`Failed to fetch fAIr model ${modelId}`);
  }

  const data = await response.json();
  return data;
}

function normalizeFAIRModelDetails(
  data: FAIRModelDetailResponse,
  modelId: number
): NormalizedProjectDetails {
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

  // Map status number to human-readable text
  const statusMap: Record<number, string> = {
    "-1": "Archived",
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
    url: `https://fair.hotosm.org/ai-models/${modelId}`,
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

export function useFAIRModelDetails(modelId: number | null) {
  return useQuery({
    queryKey: ["fair-model", modelId],
    queryFn: async () => {
      const data = await fetchFAIRModelDetails(modelId!);
      return normalizeFAIRModelDetails(data, modelId!);
    },
    enabled: modelId !== null,
  });
}
