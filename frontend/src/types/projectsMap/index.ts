// ============================================================================
// SHARED / NORMALIZED TYPES
// ============================================================================

// Normalized project details for unified display across all products
export interface NormalizedProjectDetails {
  id: string | number;
  name: string;
  productName: string; // "Tasking Manager", "Drone Tasking Manager", "Open Aerial Map"
  description?: string;
  thumbnail?: string;
  url: string; // Link to view project
  // Metadata fields (optional, different per product)
  metadata?: Array<{
    label: string;
    value: string | number;
  }>;
}

// GeoJSON Feature for map display
export interface ProjectMapFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    projectId: number | string;
    name?: string | null;
    product?:
      | "tasking-manager"
      | "drone-tasking-manager"
      | "fair"
      | "field"
      | "imagery";
  };
}

// GeoJSON FeatureCollection for map
export interface ProjectsMapResults {
  type: "FeatureCollection";
  features: ProjectMapFeature[];
}

// ============================================================================
// TASKING MANAGER TYPES
// ============================================================================

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

// ============================================================================
// DRONE TASKING MANAGER TYPES
// ============================================================================

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

// ============================================================================
// fAIr (AI-ASSISTED MAPPING) TYPES
// ============================================================================

export interface FAIRUser {
  osm_id: number | null;
  username: string | null;
}

export interface FAIRModel {
  id: number;
  user: FAIRUser | null;
  accuracy: number | null;
  thumbnail_url: string | null;
  name: string | null;
  created_at: string | null;
  last_modified: string | null;
  description: string | null;
  published_training: number | null;
  status: number | null;
  base_model: string | null;
  dataset: number | null;
}

export interface FAIRDataset {
  id: number;
  name: string | null;
  created_at: string | null;
  last_modified: string | null;
  source_imagery: string | null;
  status: number | null;
  user: FAIRUser | null;
}

export interface FAIRResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// OPEN AERIAL MAP TYPES
// ============================================================================

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
