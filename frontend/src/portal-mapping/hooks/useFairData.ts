import { useQuery } from "@tanstack/react-query";
import type { FAIRResponse } from "../../types/projectsMap";
import {
  type IFairProject,
  type FAIRModel,
  type FAIRDataset,
  mapModelsToDataProjects,
  mapDatasetsToDataProjects,
} from "../types";

interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export function useMyModels(page = 1, limit = 4) {
  const offset = (page - 1) * limit;
  return useQuery({
    queryKey: ["fair", "my-models", page, limit],
    queryFn: async (): Promise<PaginatedResult<IFairProject>> => {
      const response = await fetch(
        `/api/fair/me/models?limit=${limit}&offset=${offset}`,
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return { items: [], total: 0 };
        }
        const errorText = await response.text();
        throw new Error(
          `[${response.status}] Failed to fetch fAIr models: ${errorText}`,
        );
      }

      const data: FAIRResponse<FAIRModel> = await response.json();
      return {
        items: mapModelsToDataProjects(data.results || []),
        total: data.count,
      };
    },
  });
}
// not in use for the moment
export function useMyDatasets() {
  return useQuery({
    queryKey: ["fair", "my-datasets"],
    queryFn: async (): Promise<IFairProject[]> => {
      const response = await fetch("/api/fair/me/datasets");

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return [];
        }
        const errorText = await response.text();
        throw new Error(
          `[${response.status}] Failed to fetch fAIr datasets: ${errorText}`,
        );
      }

      const data: FAIRResponse<FAIRDataset> = await response.json();
      const datasets = data.results || [];
      return mapDatasetsToDataProjects(datasets);
    },
  });
}
