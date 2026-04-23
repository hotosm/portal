import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import type { PlanCreate, PlanRead, PlanReadHydrated, PlanUpdate } from "../types";

export const planQueryKeys = {
  all: ["plans"] as const,
  list: () => [...planQueryKeys.all, "list"] as const,
  detail: (id: string) => [...planQueryKeys.all, "detail", id] as const,
};

export function useMyPlans() {
  const { isLogin } = useAuth();
  return useQuery({
    queryKey: planQueryKeys.list(),
    queryFn: async (): Promise<PlanRead[]> => {
      const response = await fetch("/api/plans", { credentials: "include" });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return [];
        console.error("Error fetching plans:", await response.text());
        return [];
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: isLogin,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PlanCreate): Promise<PlanRead> => {
      const response = await fetch("/api/plans", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to create plan`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: PlanUpdate;
    }): Promise<PlanRead> => {
      const response = await fetch(`/api/plans/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to update plan`);
      }
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: planQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: planQueryKeys.detail(id) });
    },
  });
}

export function usePlan(id: string) {
  const { isLogin } = useAuth();
  return useQuery({
    queryKey: planQueryKeys.detail(id),
    queryFn: async (): Promise<PlanReadHydrated | null> => {
      const response = await fetch(`/api/plans/${id}`, {
        credentials: "include",
      });
      if (response.status === 404) return null;
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return null;
        throw new Error(`[${response.status}] Failed to fetch plan`);
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: isLogin && !!id,
  });
}
