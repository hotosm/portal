import { useQuery } from "@tanstack/react-query";

export interface FAIRUser {
  osm_id: number | null;
  username: string | null;
}

export interface FAIRModel {
  id: number;
  user: FAIRUser | null;
  accuracy: number | null;
  thumbnail_url: string | null;
  name: string | null;
  created_at: string | null;
  last_modified: string | null;
  description: string | null;
  published_training: number | null;
  status: number | null;
  base_model: string | null;
  dataset: number | null;
}

export interface FAIRDataset {
  id: number;
  name: string | null;
  created_at: string | null;
  last_modified: string | null;
  source_imagery: string | null;
  status: number | null;
  user: FAIRUser | null;
}

export interface FAIRResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

async function fetchMyModels(): Promise<FAIRModel[]> {
  try {
    const response = await fetch("/api/fair/me/models");

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return [];
      }
      console.error("Error fetching models:", await response.text());
      return [];
    }

    const data: FAIRResponse<FAIRModel> = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

async function fetchMyDatasets(): Promise<FAIRDataset[]> {
  try {
    const response = await fetch("/api/fair/me/datasets");

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return [];
      }
      console.error("Error fetching datasets:", await response.text());
      return [];
    }

    const data: FAIRResponse<FAIRDataset> = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching datasets:", error);
    return [];
  }
}

export function useMyModels() {
  return useQuery({
    queryKey: ["fair", "my-models"],
    queryFn: fetchMyModels,
  });
}

export function useMyDatasets() {
  return useQuery({
    queryKey: ["fair", "my-datasets"],
    queryFn: fetchMyDatasets,
  });
}