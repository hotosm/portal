import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { m } from '../../paraglide/messages'
import type { GrantRole, GrantSubjectType, PlanAccess } from '../types'
import { planQueryKeys } from './queryKeys'

const STALE_TIME = 60 * 1000

class AccessRequestError extends Error {
  status: number

  constructor(status: number) {
    super(`[${status}] Plan access request failed`)
    this.status = status
  }
}

async function accessRequest(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: unknown
): Promise<PlanAccess> {
  const response = await fetch(`/api/plans/${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) throw new AccessRequestError(response.status)
  return response.json()
}

// Every write answers with the fresh access state: store it, then refetch the
// plan (my_role, is_public) and the lists it may have joined or left.
function useAccessMutation<TVars>(
  planId: string,
  request: (vars: TVars) => Promise<PlanAccess>,
  errorMessage: (error: unknown) => string = () => m.plan_access_toast_error()
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (access) => {
      queryClient.setQueryData(planQueryKeys.access(planId), access)
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.public(planId) })
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() })
    },
    onError: (error) => {
      toast.error(errorMessage(error))
    },
  })
}

/** Owner, grants and link state of a plan; owner only. */
export function usePlanAccess(planId: string, enabled = true) {
  return useQuery({
    queryKey: planQueryKeys.access(planId),
    queryFn: () => accessRequest(`${planId}/access`, 'GET'),
    staleTime: STALE_TIME,
    enabled: enabled && !!planId,
    retry: false,
  })
}

export function useSetPlanGrant(planId: string) {
  return useAccessMutation(
    planId,
    ({
      subjectType,
      subjectId,
      role,
    }: {
      subjectType: GrantSubjectType
      subjectId: string
      role: GrantRole
    }) =>
      accessRequest(`${planId}/access/${subjectType}/${subjectId}`, 'PUT', {
        role,
      })
  )
}

export function useAddPlanUserByEmail(planId: string) {
  return useAccessMutation(
    planId,
    ({ email, role }: { email: string; role: GrantRole }) =>
      accessRequest(`${planId}/access/user`, 'POST', { email, role }),
    (error) => {
      if (error instanceof AccessRequestError && error.status === 404) {
        return m.plan_access_toast_user_not_found()
      }
      if (error instanceof AccessRequestError && error.status === 400) {
        return m.plan_access_toast_already_owner()
      }
      return m.plan_access_toast_error()
    }
  )
}

export function useRemovePlanGrant(planId: string) {
  return useAccessMutation(
    planId,
    ({
      subjectType,
      subjectId,
    }: {
      subjectType: GrantSubjectType
      subjectId: string
    }) => accessRequest(`${planId}/access/${subjectType}/${subjectId}`, 'DELETE')
  )
}

/** Turn "anyone with the link" on (viewer) or off (null). */
export function useSetPlanLink(planId: string) {
  return useAccessMutation(planId, (role: 'viewer' | null) =>
    role
      ? accessRequest(`${planId}/access/link`, 'PUT', { role })
      : accessRequest(`${planId}/access/link`, 'DELETE')
  )
}

/** Show the plan "by" an organization the caller manages, or clear it (null). */
export function useSetPlanAttribution(planId: string) {
  return useAccessMutation(planId, (organizationId: string | null) =>
    accessRequest(`${planId}/attribution`, 'PUT', {
      organization_id: organizationId,
    })
  )
}
