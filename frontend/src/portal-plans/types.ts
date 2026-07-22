export type AppName =
  | 'chatmap'
  | 'drone-tasking-manager'
  | 'export-tool'
  | 'fair'
  | 'field-tm'
  | 'open-aerial-map'
  | 'tasking-manager'
  | 'umap'

export type HydrationError = 'not_found' | 'upstream_unavailable' | 'upstream_timeout' | 'pending'

export type ProjectStatus = 'pending' | 'in_progress' | 'done' | 'task'

export type Visibility = 'private' | 'group' | 'public'

export type EditScope = 'owner' | 'group'

export type GroupType = 'team' | 'organization'

/** A team or organization the current user belongs to (from GET /api/groups). */
export interface UserGroup {
  id: string
  type: GroupType
  slug: string
  name: string
  role: string
  status: string
}

export interface PlanProjectItem {
  id?: string
  app: AppName
  project_id?: string | null
  project_exists?: boolean
  status?: ProjectStatus
  featured?: boolean
  data?: Record<string, unknown> | null
}

export interface PlanCreate {
  name: string
  description?: string
  projects?: PlanProjectItem[]
  visibility?: Visibility
  group_type?: GroupType | null
  group_id?: string | null
  edit_scope?: EditScope
}

export interface PlanUpdate {
  name?: string
  description?: string
  is_public?: boolean
  projects?: PlanProjectItem[]
  visibility?: Visibility
  group_type?: GroupType | null
  group_id?: string | null
  edit_scope?: EditScope
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
  owner_id: string
  visibility: Visibility
  group_type: GroupType | null
  group_id: string | null
  edit_scope: EditScope
  is_owner: boolean
  can_edit: boolean
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
  featured: boolean
  data: Record<string, unknown> | null
  upstream: Record<string, unknown> | null
  error: HydrationError | null
  from_snapshot?: boolean
}

export interface PlanReadHydrated {
  id: string
  name: string
  description: string | null
  is_public: boolean
  owner_id: string
  visibility: Visibility
  group_type: GroupType | null
  group_id: string | null
  edit_scope: EditScope
  is_owner: boolean
  can_edit: boolean
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
  isResolving?: boolean
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
    newTasks: PendingTaskInput[]
  ) => void
  onClose: () => void
}

export interface PlanFormValues {
  name: string
  description: string
  pendingImages: File[]
}
