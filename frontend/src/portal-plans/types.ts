export type AppName =
  | 'chatmap'
  | 'drone-tasking-manager'
  | 'export-tool'
  | 'fair'
  | 'field-tm'
  | 'open-aerial-map'
  | 'tasking-manager'
  | 'umap'

export type HydrationError = 'not_found' | 'upstream_unavailable'

export type ProjectStatus = 'pending' | 'in_progress' | 'done' | 'task'

export interface PlanProjectItem {
  id?: string
  app: AppName
  project_id?: string | null
  project_exists?: boolean
  status?: ProjectStatus
  data?: Record<string, unknown> | null
}

export interface PlanCreate {
  name: string
  description?: string
  projects?: PlanProjectItem[]
}

export interface PlanUpdate {
  name?: string
  description?: string
  is_public?: boolean
  projects?: PlanProjectItem[]
}

export interface PlanImageRead {
  id: string
  url: string
  display_order: number
  created_at: string
}

export interface PlanRead {
  id: string
  name: string
  description: string | null
  is_public: boolean
  projects: PlanProjectItem[]
  images: PlanImageRead[]
  created_at: string
  updated_at: string
}

export interface HydratedProjectItem {
  id: string
  app: AppName
  project_id: string | null
  project_exists: boolean
  status: ProjectStatus
  data: Record<string, unknown> | null
  upstream: Record<string, unknown> | null
  error: HydrationError | null
}

export interface PlanReadHydrated {
  id: string
  name: string
  description: string | null
  is_public: boolean
  projects: HydratedProjectItem[]
  images: PlanImageRead[]
  created_at: string
  updated_at: string
}

export interface UrlResolveResponse {
  app: AppName
  project_id: string
  upstream: Record<string, unknown> | null
}

export interface ProjectOption {
  app: AppName
  project_id: string
  title: string
  upstream?: Record<string, unknown> | null
}

export interface ProjectSource {
  app: AppName
  label: string
  projects: ProjectOption[]
  isLoading: boolean
  isError: boolean
}
export interface PendingTaskInput {
  app: AppName
  title: string
}

export interface ProjectPickerDialogProps {
  open: boolean
  selected: Set<string>
  extraProjects: ProjectOption[]
  sources: ProjectSource[]
  existingTasks: HydratedProjectItem[]
  onConfirm: (
    selected: Set<string>,
    extraProjects: ProjectOption[],
    keptTaskIds: Set<string>,
    newTasks: PendingTaskInput[],
  ) => void
  onClose: () => void
}

export interface PlanFormValues {
  name: string
  description: string
  pendingImages: File[]
}
