import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PlanImageRead } from "../types";
import { planQueryKeys } from "./usePlans";

export function useUploadPlanImage(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<PlanImageRead> => {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`/api/plans/${planId}/images`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to upload image`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) });
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() });
    },
  });
}

export function useDeletePlanImage(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imageId: string): Promise<void> => {
      const response = await fetch(`/api/plans/${planId}/images/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to delete image`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(planId) });
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() });
    },
  });
}
