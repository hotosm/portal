import { useQuery } from "@tanstack/react-query";

/**
 * One public organization or team as login reports it, proxied by portal.
 * (backend/app/services/login_service.py -> PublicGroup).
 */
export interface PublicProfileGroup {
  type: "organization" | "team";
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  members_count: number;
}

/** One certificate as the backend exposes it (no personal data beyond this). */
export interface PublicProfileCertificate {
  title: string;
  /** ISO timestamp, or null when the school did not record one. */
  issued: string | null;
  /** Public link to the certificate, so a reader can check the claim. */
  url: string | null;
}

/**
 * Shape of GET /api/public/profile/{slug} on the portal backend
 * (backend/app/models/profile.py -> PublicProfileRead).
 *
 * `organizations` and `teams` only hold the groups login exposes publicly
 * (public, and approved for orgs); an empty list means there's none to show.
 */
export interface PublicProfile {
  slug: string;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  bio: string | null;
  location: string | null;
  /** Contact details aren't in this payload; fetch them with usePublicContact. */
  has_contact: boolean;
  /** Public by design, unlike contact details. */
  openstreetmap_username: string | null;
  tasking_manager_username: string | null;
  organizations?: PublicProfileGroup[] | null;
  teams?: PublicProfileGroup[] | null;
  /**
   * Courses at learn.hotosm.org. Null when there is nothing to show — no LMS
   * account, or the LMS did not answer — which is not the same as zero.
   */
  courses_count?: number | null;
  /** Courses the school offers, so the number above has a scale. */
  courses_total?: number | null;
  /**
   * Certificates earned. An empty list is a real answer — not every course
   * issues one — while null means we could not ask.
   */
  certificates?: PublicProfileCertificate[] | null;
}

/**
 * Shape of GET /api/public/profile/{slug}/contact on the portal backend
 * (backend/app/models/profile.py -> PublicContactRead).
 */
export interface PublicContact {
  contact_email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  extra_links: string[];
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

// Under the public-profile prefix, so saving the profile invalidates it too.
export const publicContactQueryKey = (slug: string) =>
  ["public-profile", slug, "contact"] as const;

/**
 * Fetches a public profile's contact details. Kept apart from the profile so
 * they're only requested when the visitor asks to see them: pass `enabled`
 * once they click "View contact info".
 *
 * Resolves to `null` on 404, same as usePublicProfile.
 */
export function usePublicContact(slug: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: publicContactQueryKey(slug ?? ""),
    queryFn: async (): Promise<PublicContact | null> => {
      const response = await fetch(
        `/api/public/profile/${encodeURIComponent(slug ?? "")}/contact`
      );

      if (response.status === 404) return null;
      if (response.status === 502) throw new PublicProfileUnavailableError();
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to fetch public contact`);
      }

      return response.json();
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    enabled: !!slug && enabled,
    retry: (failureCount, error) =>
      failureCount < 1 && !(error instanceof PublicProfileUnavailableError),
  });
}
