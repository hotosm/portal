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

/**
 * A named section of one plan, grouping some of its projects. Belongs to the
 * plan, not to a user, so every editor of a shared plan sees the same ones.
 */
export interface Collection {
  id: string
  plan_id: string
  name: string
  description: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface CollectionCreate {
  name: string
  description?: string | null
}

export interface CollectionUpdate {
  name?: string
  description?: string | null
  display_order?: number
}

/** Where one project sits after a drag: which collection, in which position. */
export interface ProjectPlacement {
  id: string
  collection_id: string | null
  display_order: number
}

export interface PlanProjectItem {
  id?: string
  /** Null on a task that isn't tied to a tool yet. */
  app?: AppName | null
  project_id?: string | null
  project_exists?: boolean
  status?: ProjectStatus
  featured?: boolean
  data?: Record<string, unknown> | null
  /** Null means the virtual "All" bucket. */
  collection_id?: string | null
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
  collections: Collection[]
  images: PlanImageRead[]
  created_at: string
  updated_at: string
}

export interface HydratedProjectItem {
  id: string
  /** Null on a task that isn't tied to a tool yet. */
  app: AppName | null
  project_id: string | null
  project_exists: boolean
  status: ProjectStatus
  featured: boolean
  data: Record<string, unknown> | null
  // Null means "All" — there is no such collection in the database; the UI
  // buckets every unassigned project under a virtual section.
  collection_id: string | null
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
  collections: Collection[]
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
export interface ProjectPickerDialogProps {
  open: boolean
  /** `app:project_id` keys already in the plan — used to reject duplicate URLs. */
  existingKeys: Set<string>
  onAddProject: (project: ProjectOption) => void
  onAddTask: (title: string) => void
  onClose: () => void
}

export interface PlanFormValues {
  name: string
  description: string
  pendingImages: File[]
}
