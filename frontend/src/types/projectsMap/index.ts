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
  centroid: [number, number] | null;
  name: string | null;
  created_at: string | null;
  last_modified: string | null;
  description: string | null;
  published_training: number | null;
  status: number | null;
  base_model: string | null;
  dataset: number | null;
}


export interface FAIRResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// fAIr centroid from /api/fair/models/centroid endpoint
export interface FAIRModelCentroid {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    mid: number; // model ID
    name?: string; // model name (enriched by backend)
  };
}

// ============================================================================
// EXPORT TOOL TYPES
// ============================================================================

export interface ExportJobUser {
  username: string;
}

export interface ExportJobGeometry {
  type: string;
  coordinates: unknown;
}

export interface ExportJob {
  id: number;
  uid: string;
  user: ExportJobUser | null;
  name: string;
  description: string | null;
  event: string | null;
  export_formats: string[] | null;
  published: boolean | null;
  created_at: string;
  area: number | null;
  pinned: boolean | null;
  simplified_geom: ExportJobGeometry | null;
}

export interface ExportJobsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ExportJob[];
}
