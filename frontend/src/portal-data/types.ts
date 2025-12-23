import { FAIRModel, FAIRDataset } from "../types/projectsMap";
import placeholderImage from "../assets/images/demo/demo1.png";

export interface IDataProject {
  id: number;
  title: string;
  href: string;
  status: "draft" | "published";
  section: "model" | "set";
  image: string;
  accuracy: number | null;
}

export type { FAIRModel, FAIRDataset };

// fAIr status: 0 = published, 1 = draft
function mapFairStatus(status: number | null): "draft" | "published" {
  return status === 0 ? "published" : "draft";
}

export function mapModelsToDataProjects(models: FAIRModel[]): IDataProject[] {
  return models.map((model) => ({
    id: model.id,
    title: model.name || "Untitled Model",
    href: `https://fair.hotosm.org/ai-models/${model.id}`,
    status: mapFairStatus(model.status),
    section: "model" as const,
    image: model.thumbnail_url || placeholderImage,
    accuracy: model.accuracy !== null ? Math.round(model.accuracy) : null,
  }));
}

export function mapDatasetsToDataProjects(datasets: FAIRDataset[]): IDataProject[] {
  return datasets.map((dataset) => ({
    id: dataset.id,
    title: dataset.name || "Untitled Dataset",
    href: `https://fair.hotosm.org/training-datasets/${dataset.id}`,
    status: mapFairStatus(dataset.status),
    section: "set" as const,
    image: placeholderImage,
    accuracy: null,
  }));
}