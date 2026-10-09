import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";

/**
 * The portal-owned half of the profile
 * (backend/app/models/profile.py -> PortalProfileRead).
 */
export interface PortalProfileFields {
  bio: string | null;
  location: string | null;
  contact_email: string | null;
  phone: string | null;
  extra_links: string[];
  openstreetmap_username: string | null;
  tasking_manager_username: string | null;
  show_organizations: boolean;
  show_teams: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Shape of GET /api/profile/me on the *portal* backend
 * (backend/app/models/profile.py -> ProfileMeRead): account fields read live
 * from login, plus the portal-owned fields.
 */
export interface MyPortalProfile {
  hanko_user_id: string;
  first_name: string | null;
  last_name: string | null;
  picture_url: string | null;
  slug: string | null;
  is_public: boolean;
  osm_username: string | null;
  osm_avatar_url: string | null;
  portal: PortalProfileFields;
}

/** The only fields the owner can edit from the public profile page. */
export type PortalProfilePatch = Partial<
  Pick<
    PortalProfileFields,
    | "bio"
    | "location"
    | "contact_email"
    | "phone"
    | "extra_links"
    | "openstreetmap_username"
    | "tasking_manager_username"
  >
>;

/**
 * The backend rejected the payload (400/422) — bad email or link, or a
 * mapping username that isn't a bare username.
 */
export class PortalProfileValidationError extends Error {
  fields: string[];
  /** Positions in the sent extra_links array whose item was rejected. */
  extraLinkIndexes: number[];

  constructor(fields: string[], extraLinkIndexes: number[] = []) {
    super("[422] Invalid profile payload");
    this.name = "PortalProfileValidationError";
    this.fields = fields;
    this.extraLinkIndexes = extraLinkIndexes;
  }
}

export const myPortalProfileQueryKey = ["my-portal-profile"] as const;
export const publicProfileQueryPrefix = ["public-profile"] as const;

const STALE_TIME = 5 * 60 * 1000;
const GC_TIME = 30 * 60 * 1000;

/**
 * The current user's portal profile. Resolves to `null` when there's no usable
 * session, so the page can fall back to the read-only view instead of erroring.
 */
export function useMyPortalProfile() {
  const { isLogin } = useAuth();

  return useQuery({
    queryKey: myPortalProfileQueryKey,
    queryFn: async (): Promise<MyPortalProfile | null> => {
      const response = await fetch("/api/profile/me", {
        credentials: "include",
      });

      if (response.status === 401 || response.status === 403) return null;
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to fetch my profile`);
      }

      return response.json();
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
    enabled: isLogin,
    retry: 1,
  });
}

/** Field names out of a FastAPI 422 body, so the UI can name what to fix. */
function parseInvalidFields(body: unknown): string[] {
  const detail = (body as { detail?: unknown })?.detail;
  if (!Array.isArray(detail)) return [];
  return detail
    .map((item) => {
      const loc = (item as { loc?: unknown[] })?.loc;
      if (!Array.isArray(loc)) return "";
      // A list item's loc ends in its index (["body", "extra_links", 2]).
      if (loc.includes("extra_links")) return "extra_links";
      return String(loc[loc.length - 1]);
    })
    .filter(Boolean);
}

/** Indexes of the extra_links items a FastAPI 422 body rejected, if any. */
function parseInvalidExtraLinkIndexes(body: unknown): number[] {
  const detail = (body as { detail?: unknown })?.detail;
  if (!Array.isArray(detail)) return [];
  return detail.flatMap((item) => {
    const loc = (item as { loc?: unknown[] })?.loc;
    if (!Array.isArray(loc)) return [];
    const index = loc[loc.indexOf("extra_links") + 1];
    return loc.includes("extra_links") && typeof index === "number" ? [index] : [];
  });
}

export function useUpdateMyPortalProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: PortalProfilePatch
    ): Promise<PortalProfileFields> => {
      const response = await fetch("/api/profile/me", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 400 || response.status === 422) {
        const body = await response.json().catch(() => ({}));
        throw new PortalProfileValidationError(
          parseInvalidFields(body),
          parseInvalidExtraLinkIndexes(body)
        );
      }
      if (!response.ok) {
        throw new Error(`[${response.status}] Failed to update my profile`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myPortalProfileQueryKey });
      queryClient.invalidateQueries({ queryKey: publicProfileQueryPrefix });
    },
  });
}
