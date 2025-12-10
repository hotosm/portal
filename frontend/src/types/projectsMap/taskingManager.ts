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

// fAIr types
export interface FAIRUser {
  osm_id?: number;
  username?: string;
}

export interface FAIRProject {
  id: number;
  user?: FAIRUser;
  accuracy?: number;
  thumbnail_url?: string;
  name?: string;
  created_at?: string;
  last_modified?: string;
  description?: string;
  published_training?: number;
  status?: number;
  base_model?: string;
  dataset?: number;
}

export interface FAIRProjectsResponse {
  count?: number;
  next?: string;
  previous?: string;
  results: FAIRProject[];
}

// Open Aerial Map types
export interface OAMProperties {
  wmts?: string;
  tms?: string;
  thumbnail?: string;
  sensor?: string;
}

export interface OAMGeoJSON {
  bbox?: number[];
  coordinates?: number[][][];
  type?: string;
}

export interface OAMImagery {
  _id?: string;
  uuid?: string;
  title?: string;
  projection?: string;
  bbox?: number[];
  footprint?: string;
  gsd?: number;
  file_size?: number;
  acquisition_start?: string;
  acquisition_end?: string;
  platform?: string;
  provider?: string;
  contact?: string;
  properties?: OAMProperties;
  uploaded_at?: string;
  meta_uri?: string;
  geojson?: OAMGeoJSON;
}

export interface OAMListResponse {
  meta?: {
    provided_by?: string;
    license?: string;
    website?: string;
    page?: number;
    limit?: number;
    found?: number;
  };
  results: OAMImagery[];
}
