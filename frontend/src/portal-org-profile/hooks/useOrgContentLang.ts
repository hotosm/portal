import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { OrgLocales } from '../types'
import { resolveContentLang } from '../utils'
import { usePublicOrgProfile } from './usePublicOrgProfile'

/**
 * Fetches an org's public profile in its content language and keeps that
 * language in sync with `?lang=`.
 */
export function useOrgContentLang(slug: string | undefined, uiLocale: string) {
  const [searchParams, setSearchParams] = useSearchParams()
  const langParam = searchParams.get('lang')

  // Which locales exist only comes with a response, so the first fetch asks
  // for `?lang=` (or the UI language) and, if the rule settles elsewhere, the
  // query key changes once and it refetches. No loop: the key is the
  // resolved language, which doesn't change with the refetch.
  const [orgLocales, setOrgLocales] = useState<OrgLocales | null>(null)
  const knownLocales = orgLocales?.slug === slug ? orgLocales : null
  const contentLang = knownLocales
    ? resolveContentLang(knownLocales, langParam, uiLocale)
    : (langParam ?? uiLocale)

  const { data: org, isLoading, error } = usePublicOrgProfile(slug, contentLang)

  useEffect(() => {
    if (!org || !slug) return
    setOrgLocales((previous) =>
      previous?.slug === slug &&
      previous.base === org.default_locale &&
      previous.available.join() === org.available_locales.join()
        ? previous
        : { slug, available: org.available_locales, base: org.default_locale }
    )
  }, [org, slug])

  // A `?lang=` the org doesn't have is dropped from the URL, not kept around.
  useEffect(() => {
    if (!knownLocales || !langParam || knownLocales.available.includes(langParam)) return
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('lang')
        return next
      },
      { replace: true }
    )
  }, [knownLocales, langParam, setSearchParams])

  // A new history entry, so Back returns to the previous language.
  const selectContentLang = (event: CustomEvent) => {
    const code: string | undefined = event.detail.item.value
    if (!code || code === contentLang) return
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      next.set('lang', code)
      return next
    })
  }

  return { org, isLoading, error, contentLang, selectContentLang }
}
