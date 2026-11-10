import { TRANSLATABLE_FIELDS } from './constants'
import type { OrgLocales, PublicOrgProfile, TranslatableField } from './types'

// Locale a translatable field actually came back in.
function fieldLang(org: PublicOrgProfile, field: TranslatableField): string {
  return org.field_locales[field] ?? org.default_locale
}

// Login stores video_url as https://www.youtube.com/watch?v=ID; null when it
// isn't in that shape, so nothing is embedded.
function youtubeVideoId(url: string | null): string | null {
  if (!url) return null
  try {
    const parsed = new URL(url)
    const id = parsed.searchParams.get('v')
    return parsed.hostname === 'www.youtube.com' &&
      parsed.pathname === '/watch' &&
      id &&
      /^[A-Za-z0-9_-]{11}$/.test(id)
      ? id
      : null
  } catch {
    return null
  }
}

// A language's name in the page's language; the bare code if the browser
// can't name it (or the URL locale isn't a valid tag).
function languageName(code: string, pageLocale: string): string {
  try {
    return new Intl.DisplayNames([pageLocale], { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}

// A language's name in that same language (e.g. "Español"), for picking one.
function nativeLanguageName(code: string): string {
  const name = languageName(code, code)
  return name.charAt(0).toLocaleUpperCase(code) + name.slice(1)
}

// Language of the profile's content, independent of the UI's: `?lang=` when
// the org has it, else the UI language when the org has it, else its base.
function resolveContentLang(
  locales: OrgLocales,
  langParam: string | null,
  uiLocale: string
): string {
  if (langParam && locales.available.includes(langParam)) return langParam
  if (locales.available.includes(uiLocale)) return uiLocale
  return locales.base
}

function fallbackContentLang(
  org: PublicOrgProfile,
  contentLang: string,
  videoId: string | null
): string | undefined {
  // Translatable fields the page actually shows: a video only counts when it
  // can be embedded.
  const shownFields = TRANSLATABLE_FIELDS.filter((field) =>
    field === 'video_url' ? videoId : org[field]
  )
  // Shown fields that fell back to another language. Fallback is always to the
  // org's base locale, so one language name covers them all.
  return shownFields
    .map((field) => fieldLang(org, field))
    .find((lang) => lang !== contentLang)
}

export {
  fieldLang,
  youtubeVideoId,
  languageName,
  nativeLanguageName,
  resolveContentLang,
  fallbackContentLang,
}
