import { FAIRModel, FAIRDataset } from "../types/projectsMap";
import placeholderImage from "../assets/images/demo/demo1.png";
import { getFairModelUrl, getFairDatasetUrl } from "../utils/envConfig";

export type { FAIRModel, FAIRDataset };

export interface IFairProject {
  id: number;
  title: string;
  href: string;
  status: "draft" | "published";
  image: string;
  accuracy: number | null;
}

// fAIr status: 0 = published, 1 = draft
function mapFairStatus(status: number | null): "draft" | "published" {
  return status === 0 ? "published" : "draft";
}

export function mapModelsToDataProjects(models: FAIRModel[]): IFairProject[] {
  return models.map((model) => ({
    id: model.id,
    title: model.name || "Untitled Model",
    href: getFairModelUrl(model.id),
    status: mapFairStatus(model.status),
    image: model.thumbnail_url || placeholderImage,
    accuracy: model.accuracy !== null ? Math.round(model.accuracy) : null,
  }));
}

export function mapDatasetsToDataProjects(datasets: FAIRDataset[]): IFairProject[] {
  return datasets.map((dataset) => ({
    id: dataset.id,
    title: dataset.name || "Untitled Dataset",
    href: getFairDatasetUrl(dataset.id),
    status: mapFairStatus(dataset.status),
    image: placeholderImage,
    accuracy: null,
  }));
}
