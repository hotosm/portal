import { FAIRModel } from "../types/projectsMap";
import placeholderImage from "../assets/images/demo/demo1.png";
import { getFairModelUrl } from "../utils/envConfig";

export type { FAIRModel };

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

