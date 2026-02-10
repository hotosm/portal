import { FAIRModel, FAIRDataset, ExportJob } from "../types/projectsMap";
import placeholderImage from "../assets/images/demo/demo1.png";
import { getFairModelUrl, getFairDatasetUrl, getExportToolJobUrl } from "../utils/envConfig";

export interface IDataProject {
  id: number | string;
  title: string;
  href: string;
  status: "draft" | "published";
  section: "model" | "set" | "export";
  image: string;
  accuracy: number | null;
}

export type { FAIRModel, FAIRDataset, ExportJob };

// fAIr status: 0 = published, 1 = draft
function mapFairStatus(status: number | null): "draft" | "published" {
  return status === 0 ? "published" : "draft";
}

export function mapModelsToDataProjects(models: FAIRModel[]): IDataProject[] {
  return models.map((model) => ({
    id: model.id,
    title: model.name || "Untitled Model",
    href: getFairModelUrl(model.id),
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
    href: getFairDatasetUrl(dataset.id),
    status: mapFairStatus(dataset.status),
    section: "set" as const,
    image: placeholderImage,
    accuracy: null,
  }));
}

export function mapExportJobsToDataProjects(jobs: ExportJob[]): IDataProject[] {
  return jobs.map((job) => ({
    id: job.uid,
    title: job.name || "Untitled Export",
    href: getExportToolJobUrl(job.uid),
    status: job.published ? "published" as const : "draft" as const,
    section: "export" as const,
    image: placeholderImage,
    accuracy: null,
  }));
}