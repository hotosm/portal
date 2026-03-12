import { ExportJob } from "../types/projectsMap";
import { IDataProject } from "../portal-mapping/types";
import placeholderImage from "../assets/images/demo/demo1.png";
import { getExportToolJobUrl } from "../utils/envConfig";

export type { IDataProject };

export interface IUMapProject {
  id: number;
  title: string;
  href: string;
  status: "draft" | "published";
  image: string;
  accuracy: number;
}

export function mapExportJobsToDataProjects(jobs: ExportJob[]): IDataProject[] {
  return jobs.map((job) => ({
    id: job.uid,
    title: job.name || "Untitled Export",
    href: getExportToolJobUrl(job.uid),
    status: job.published ? ("published" as const) : ("draft" as const),
    section: "export" as const,
    image: placeholderImage,
    accuracy: null,
  }));
}
