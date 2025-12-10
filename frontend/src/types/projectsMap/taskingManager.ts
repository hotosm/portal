export interface ProjectInfoLocale {
  locale: string;
  name: string;
  description?: string;
  shortDescription?: string;
  instructions?: string;
}

export interface ProjectInfo {
  locale: string;
  name: string;
  description?: string;
  shortDescription?: string;
  instructions?: string;
}

export interface ProjectDetails {
  organisationName?: string;
  organisationSlug?: string;
  projectInfo?: ProjectInfo;
  projectInfoLocales?: ProjectInfoLocale[];
  created?: string;
  percentMapped?: number;
  percentValidated?: number;
  percentBadImagery?: number;
}

export interface ProjectMapFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    projectId: number | string;
    name?: string | null;
    product?: "tasking-manager" | "drone-tasking-manager" | "fair" | "field" | "imagery";
  };
}

export interface ProjectsMapResults {
  type: "FeatureCollection";
  features: ProjectMapFeature[];
}

// Drone Tasking Manager types
export interface DroneProjectCentroid {
  id: string;
  slug: string;
  name: string;
  centroid: {
    type: "Point";
    coordinates: [number, number];
  };
  total_task_count: number;
  ongoing_task_count: number;
  completed_task_count: number;
  status: string;
}

export interface DroneProjectDetails {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  author_name?: string;
  status?: string;
  total_task_count?: number;
  ongoing_task_count?: number;
  completed_task_count?: number;
  project_area?: number;
  created_at?: string;
}
