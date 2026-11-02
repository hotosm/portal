import { useQuery } from "@tanstack/react-query";
import { PublicProfileUnavailableError } from "../../portal-user-profile/hooks/usePublicProfile";
import type { PublicOrgProfile } from "../types";

export const publicOrgProfileQueryKey = (slug: string, locale: string) =>
  ["public-org", slug, locale] as const;

/**
 * Fetches an organization's public profile by slug, with its content in
 * `locale` where the org has it (login falls back to the base locale field by
 * field). Public route, no credentials.
 *
 * Resolves to `null` on 404 — the org doesn't exist, isn't public or isn't
 * approved; the backend doesn't distinguish them.
 */
export function usePublicOrgProfile(slug?: string, locale?: string) {
  return useQuery({
    queryKey: publicOrgProfileQueryKey(slug ?? "", locale ?? ""),
    queryFn: async (): Promise<PublicOrgProfile | null> => {
      const response = await fetch(
        `/api/public/org/${encodeURIComponent(slug ?? "")}?locale=${encodeURIComponent(locale ?? "")}`
      );

      if (response.status === 404) return null;
      if (response.status === 502) throw new PublicProfileUnavailableError();
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to fetch organization profile`);
      }

      return response.json();
    },
    staleTime: 0,
    gcTime: 0,
    enabled: !!slug,
    // Switching the content language keeps the page up instead of a spinner;
    // never another org's data.
    placeholderData: (previous) => (previous?.slug === slug ? previous : undefined),
    // Retrying a down upstream just delays the error state by a round trip.
    retry: (failureCount, error) =>
      failureCount < 1 && !(error instanceof PublicProfileUnavailableError),
  });
}
