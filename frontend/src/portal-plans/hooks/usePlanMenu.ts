import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "../../contexts/LanguageContext";
import { m } from "../../paraglide/messages";
import { useDeletePlan, useUpdatePlan } from "./usePlans";
import type { PlanReadHydrated } from "../types";

export function usePlanMenu(plan: PlanReadHydrated) {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const deleteMutation = useDeletePlan();
  const updateMutation = useUpdatePlan();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [publishFirstOpen, setPublishFirstOpen] = useState(false);

  const planUrl = useMemo(
    () => `${window.location.origin}/${currentLanguage}/plan/${plan.id}`,
    [currentLanguage, plan.id],
  );

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case "edit":
          navigate(`/${currentLanguage}/plan/${plan.id}/edit`);
          break;
        case "publish":
          updateMutation.mutate(
            { id: plan.id, payload: { is_public: !plan.is_public } },
            {
              onSuccess: () => {
                toast.success(plan.is_public ? m.plan_toast_unpublished() : m.plan_toast_published());
              },
              onError: () => {
                toast.error(m.plan_toast_publish_error());
              },
            },
          );
          break;
        case "share":
          if (!plan.is_public) {
            setPublishFirstOpen(true);
          } else {
            setShareOpen(true);
          }
          break;
        case "delete":
          setConfirmDeleteOpen(true);
          break;
      }
    },
    [navigate, currentLanguage, plan.id, plan.is_public, updateMutation],
  );

  const onSelect = useCallback(
    (event: CustomEvent) => handleAction(event.detail.item.value as string),
    [handleAction],
  );

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(planUrl);
      toast.success(m.plan_toast_link_copied());
    } catch {
      toast.error(m.plan_toast_link_copy_error());
    }
  }, [planUrl]);

  const onNativeShare = useCallback(() => {
    navigator.share({ title: plan.name, url: planUrl }).catch((err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast.error(m.plan_toast_share_error());
    });
  }, [plan.name, planUrl]);

  const onConfirmDelete = useCallback(() => {
    deleteMutation.mutate(plan.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false);
        toast.success(m.plan_toast_deleted());
        navigate(`/${currentLanguage}/plan`);
      },
    });
  }, [deleteMutation, plan.id, currentLanguage, navigate]);

  const onCancelDelete = useCallback(() => setConfirmDeleteOpen(false), []);
  const onCloseShare = useCallback(() => setShareOpen(false), []);
  const onClosePublishFirst = useCallback(() => setPublishFirstOpen(false), []);

  return {
    onSelect,
    planUrl,
    isDeleting: deleteMutation.isPending,
    isPublishing: updateMutation.isPending,
    confirmDeleteOpen,
    onConfirmDelete,
    onCancelDelete,
    shareOpen,
    onCopyLink,
    onNativeShare,
    onCloseShare,
    publishFirstOpen,
    onClosePublishFirst,
  };
}
