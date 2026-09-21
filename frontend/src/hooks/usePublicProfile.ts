import { useQuery } from "@tanstack/react-query";

/**
 * One public organization as login reports it, proxied by portal.
 * (backend/app/services/login_service.py -> PublicGroup).
 */
export interface PublicProfileOrganization {
  type: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  members_count: number;
}

/**
 * Shape of GET /api/public/profile/{slug} on the portal backend
 * (backend/app/models/profile.py -> PublicProfileRead).
 *
 * `organizations` is absent when the owner keeps them hidden, so the section
 * disappears rather than rendering empty.
 */
export interface PublicProfile {
  slug: string;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  bio: string | null;
  location: string | null;
  contact_email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  organizations?: PublicProfileOrganization[] | null;
}

/**
 * The portal backend could not reach login (502 `upstream_unavailable`), so it
 * can't confirm the profile is public. Distinct from a 404 because the profile
 * may well exist — the page shows an error, not "not found".
 */
export class PublicProfileUnavailableError extends Error {
  constructor() {
    super("[502] Login is unavailable");
    this.name = "PublicProfileUnavailableError";
  }
}

export const publicProfileQueryKey = (slug: string) =>
  ["public-profile", slug] as const;

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 30 * 60 * 1000;

/**
 * Fetches a user's public profile by slug. Public route, no credentials.
 *
 * Resolves to `null` on 404 — the profile doesn't exist or its owner hasn't
 * made it public; the backend deliberately doesn't distinguish the two.
 */
export function usePublicProfile(slug?: string) {
  return useQuery({
    queryKey: publicProfileQueryKey(slug ?? ""),
    queryFn: async (): Promise<PublicProfile | null> => {
      const response = await fetch(
        `/api/public/profile/${encodeURIComponent(slug ?? "")}`
      );

      if (response.status === 404) return null;
      if (response.status === 502) throw new PublicProfileUnavailableError();
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to fetch public profile`);
      }

      return response.json();
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    enabled: !!slug,
    // Retrying a down upstream just delays the error state by a round trip.
    retry: (failureCount, error) =>
      failureCount < 1 && !(error instanceof PublicProfileUnavailableError),
  });
}
