import { useQuery } from "@tanstack/react-query";
import type { FAIRResponse } from "../../types/projectsMap";
import {
  type IDataProject,
  type FAIRModel,
  type FAIRDataset,
  mapModelsToDataProjects,
  mapDatasetsToDataProjects,
} from "../types";

export function useMyModels() {
  return useQuery({
    queryKey: ["fair", "my-models"],
    queryFn: async (): Promise<IDataProject[]> => {
      try {
        const response = await fetch("/api/fair/me/models");

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return [];
          }
          const errorText = await response.text();
          throw new Error(
            `[${response.status}] Failed to fetch fAIr models: ${errorText}`,
          );
        }

        const data: FAIRResponse<FAIRModel> = await response.json();
        const models = data.results || [];
        return mapModelsToDataProjects(models);
      } catch (error) {
        throw error;
      }
    },
  });
}

export function useMyDatasets() {
  return useQuery({
    queryKey: ["fair", "my-datasets"],
    queryFn: async (): Promise<IDataProject[]> => {
      try {
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
      } catch (error) {
        throw error;
      }
    },
  });
}
