export type AppName =
  | "drone-tasking-manager"
  | "export-tool"
  | "fair"
  | "field-tm"
  | "open-aerial-map"
  | "tasking-manager"
  | "umap";

export type HydrationError = "not_found" | "upstream_unavailable";

export interface PlanProjectItem {
  app: AppName;
  project_id: string;
  data?: Record<string, unknown> | null;
}

export interface PlanCreate {
  name: string;
  description?: string;
  projects?: PlanProjectItem[];
}

export interface PlanUpdate {
  name?: string;
  description?: string;
  projects?: PlanProjectItem[];
}

export interface PlanRead {
  id: string;
  name: string;
  description: string | null;
  projects: PlanProjectItem[];
  created_at: string;
  updated_at: string;
}

export interface HydratedProjectItem {
  app: AppName;
  project_id: string;
  data: Record<string, unknown> | null;
  upstream: Record<string, unknown> | null;
  error: HydrationError | null;
}

export interface PlanReadHydrated {
  id: string;
  name: string;
  description: string | null;
  projects: HydratedProjectItem[];
  created_at: string;
  updated_at: string;
}
