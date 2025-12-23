import { useQuery } from "@tanstack/react-query";
import type { FAIRResponse } from "../../types/projectsMap";
import {
  type IDataProject,
  type FAIRModel,
  type FAIRDataset,
  mapModelsToDataProjects,
  mapDatasetsToDataProjects,
} from "../types";

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
    queryFn: async (): Promise<IDataProject[]> => {
      const models = await fetchMyModels();
      return mapModelsToDataProjects(models);
    },
  });
}

export function useMyDatasets() {
  return useQuery({
    queryKey: ["fair", "my-datasets"],
    queryFn: async (): Promise<IDataProject[]> => {
      const datasets = await fetchMyDatasets();
      return mapDatasetsToDataProjects(datasets);
    },
  });
}
