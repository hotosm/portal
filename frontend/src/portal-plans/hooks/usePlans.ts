import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import { m } from '../../paraglide/messages'
import type {
  PlanCreate,
  PlanRead,
  PlanReadHydrated,
  PlanUpdate,
  ProjectStatus,
  UrlResolveResponse,
} from '../types'

const STALE_TIME = 5 * 60 * 1000
const GC_TIME = 30 * 60 * 1000

export const planQueryKeys = {
  all: ['plans'] as const,
  list: () => [...planQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...planQueryKeys.all, 'detail', id] as const,
  public: (id: string) => [...planQueryKeys.detail(id), 'public'] as const,
}

export function useMyPlans() {
  const { isLogin } = useAuth()
  return useQuery({
    queryKey: planQueryKeys.list(),
    queryFn: async (): Promise<PlanRead[]> => {
      const response = await fetch('/api/plans', { credentials: 'include' })
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to fetch plans`)
      }
      return response.json()
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: isLogin,
    retry: 1,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: PlanCreate): Promise<PlanRead> => {
      const response = await fetch('/api/plans', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to create plan`)
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() })
    },
    onError: () => {
      toast.error(m.plan_toast_create_error())
    },
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: PlanUpdate
    }): Promise<PlanRead> => {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to update plan`)
      }
      return response.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(id) })
    },
    onError: () => {
      toast.error(m.plan_toast_update_error())
    },
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to delete plan`)
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() })
      queryClient.removeQueries({ queryKey: planQueryKeys.detail(id) })
    },
    onError: () => {
      toast.error(m.plan_toast_delete_error())
    },
  })
}

export function useSharedPlan(id: string) {
  return useQuery({
    queryKey: planQueryKeys.public(id),
    queryFn: async (): Promise<PlanReadHydrated | null> => {
      const response = await fetch(`/api/plans/shared/${id}`)
      if (response.status === 404) return null
      if (!response.ok) throw new Error(`[${response.status}] Failed to fetch plan`)
      return response.json()
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: !!id,
    retry: 1,
  })
}

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planId,
      app,
      projectId,
      status,
    }: {
      planId: string
      app: string
      projectId: string
      status: ProjectStatus
    }): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/projects/${app}/${projectId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to update project status`)
      }
    },
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
    },
  })
}

export function useCompleteTask(planId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      planProjectId,
      url,
      app,
      projectId,
    }: {
      planProjectId: string
      url?: string
      app?: string
      projectId?: string
    }): Promise<void> => {
      const body = url ? { url } : { app, project_id: projectId }
      const response = await fetch(`/api/plans/${planId}/projects/${planProjectId}/complete-task`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const b = await response.json().catch(() => ({}))
        throw new Error(b.detail ?? `${response.status}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
    },
    onError: () => {
      toast.error(m.plan_toast_update_error())
    },
  })
}

export function useResolveProjectUrl() {
  return useMutation({
    mutationFn: async (url: string): Promise<UrlResolveResponse> => {
      const response = await fetch('/api/plans/resolve-url', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.detail ?? `${response.status}`)
      }
      return response.json()
    },
  })
}

export function usePlan(id: string) {
  const { isLogin } = useAuth()
  return useQuery({
    queryKey: planQueryKeys.detail(id),
    queryFn: async (): Promise<PlanReadHydrated | null> => {
      const response = await fetch(`/api/plans/${id}`, {
        credentials: 'include',
      })
      if (response.status === 404) return null
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return null
        throw new Error(`[${response.status}] Failed to fetch plan`)
      }
      return response.json()
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    enabled: isLogin && !!id,
    retry: 1,
  })
}
