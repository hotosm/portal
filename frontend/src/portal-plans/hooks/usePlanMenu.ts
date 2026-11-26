import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useLanguage } from '../../contexts/LanguageContext'
import { m } from '../../paraglide/messages'
import type { PlanReadHydrated } from '../types'
import { planQueryKeys } from './queryKeys'
import { useSetPlanLink } from './usePlanAccess'
import { useDeletePlan } from './usePlans'

export function usePlanMenu(plan: PlanReadHydrated) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { currentLanguage } = useLanguage()
  const deleteMutation = useDeletePlan()
  const linkMutation = useSetPlanLink(plan.id)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)

  const planUrl = useMemo(
    () => `${window.location.origin}/${currentLanguage}/plan/${plan.id}`,
    [currentLanguage, plan.id]
  )

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(planUrl)
      toast.success(m.plan_toast_link_copied())
    } catch {
      toast.error(m.plan_toast_link_copy_error())
    }
  }, [planUrl])

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'edit':
          navigate(`/${currentLanguage}/plan/${plan.id}/edit`)
          break
        case 'publish':
          // Publishing = "anyone with the link can view"; errors toast in the hook.
          linkMutation.mutate(plan.is_public ? null : 'viewer', {
            onSuccess: () => {
              toast.success(plan.is_public ? m.plan_toast_unpublished() : m.plan_toast_published())
            },
          })
          break
        case 'collections':
          navigate(`/${currentLanguage}/plan/${plan.id}/collections`)
          break
        case 'permissions':
          setPermissionsOpen(true)
          break
        case 'copy-link':
          onCopyLink()
          break
        case 'delete':
          setConfirmDeleteOpen(true)
          break
      }
    },
    [navigate, currentLanguage, plan.id, plan.is_public, linkMutation, onCopyLink]
  )

  const onSelect = useCallback(
    (event: CustomEvent) => handleAction(event.detail.item.value as string),
    [handleAction]
  )

  const onConfirmDelete = useCallback(() => {
    deleteMutation.mutate(plan.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false)
        toast.success(m.plan_toast_deleted())
        navigate(`/${currentLanguage}/plan`)
      },
    })
  }, [deleteMutation, plan.id, currentLanguage, navigate])

  const onCancelDelete = useCallback(() => setConfirmDeleteOpen(false), [])
  const onClosePermissions = useCallback(() => setPermissionsOpen(false), [])

  // The share dialog changed who has access: refetch the plan (my_role,
  // is_public) and the lists it may have joined or left.
  const onAccessChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: planQueryKeys.access(plan.id) })
    queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(plan.id) })
    queryClient.invalidateQueries({ queryKey: planQueryKeys.public(plan.id) })
    queryClient.invalidateQueries({ queryKey: planQueryKeys.list() })
  }, [queryClient, plan.id])

  return {
    onSelect,
    isDeleting: deleteMutation.isPending,
    isPublishing: linkMutation.isPending,
    confirmDeleteOpen,
    onConfirmDelete,
    onCancelDelete,
    permissionsOpen,
    onClosePermissions,
    onAccessChange,
    planUrl,
  }
}
