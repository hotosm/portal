import type { PlanSummary } from '../portal-plans/types'

/**
 * Shape of GET /api/public/org/{slug} on the portal backend
 * (backend/app/models/profile.py -> PublicOrganizationRead), proxied from
 * login. Image URLs are relative to login; resolve them with resolveLoginUrl.
 */
interface PublicOrgProfile {
  name: string
  slug: string
  description: string | null
  website: string | null
  contact_email: string | null
  avatar_url: string | null
  banner_url: string | null
  members_count: number
  /** Locale the org writes its content in; the fallback for every field. */
  default_locale: string
  /** Locale each translatable field actually came back in. */
  field_locales: Record<string, string>
  /** The base locale first, then every locale the org has content for. */
  available_locales: string[]
  tagline: string | null
  /** A YouTube watch URL (https://www.youtube.com/watch?v=ID), or null. */
  video_url: string | null
}

// The org's locales as the first response reported them, keyed by slug.
interface OrgLocales {
  slug: string
  available: string[]
  base: string
}

interface OrgProfileHeroProps {
  name: string
  tagline: string | null
  /** Locale the tagline actually came back in. */
  taglineLang: string
  /** Absolute banner URL, or null for the plain dark background. */
  bannerUrl: string | null
  /** YouTube video id; null hides "See the video". */
  videoId: string | null
  /** Locale the video link came back in. */
  videoLang: string
  /** Language of the profile's content. */
  contentLang: string
  /** Language of the UI, for the action buttons. */
  uiLang: string
}

type TranslatableField = 'description' | 'tagline' | 'video_url'

interface OrgLanguageSelectProps {
  availableLocales: string[]
  baseLocale: string
  contentLang: string
  onSelect: (event: CustomEvent) => void
}

interface OrgContactInfoProps {
  email: string | null
  website: string | null
}

interface OrgPlansSectionProps {
  plans: PlanSummary[] | undefined
  loading: boolean
  uiLang: string
}

export type {
  PublicOrgProfile,
  OrgLocales,
  OrgProfileHeroProps,
  TranslatableField,
  OrgLanguageSelectProps,
  OrgContactInfoProps,
  OrgPlansSectionProps,
}
