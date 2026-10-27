import { useParams } from 'react-router-dom'
import CardDataError from '../components/shared/CardDataError'
import PageWrapper from '../components/shared/PageWrapper'
import { RichTextContent } from '../components/shared/RichTextContent'
import Spinner from '../components/shared/Spinner'
import NotFoundPage from '../pages/NotFoundPage'
import { m } from '../paraglide/messages'
import { PublicProfileUnavailableError } from '../portal-user-profile/hooks/usePublicProfile'
import { resolveLoginUrl } from '../utils/envConfig'
import OrgContactInfo from './components/OrgContactInfo'
import OrgLanguageSelect from './components/OrgLanguageSelect'
import OrgPlansSection from './components/OrgPlansSection'
import OrgProfileHero from './components/OrgProfileHero'
import { useOrgContentLang } from './hooks/useOrgContentLang'
import { usePublicOrgPlans } from './hooks/usePublicOrgPlans'
import { fallbackContentLang, fieldLang, languageName, youtubeVideoId } from './utils'

function ProfileOrgPage() {
  const { locale = '', slug } = useParams()
  const { org, isLoading, error, contentLang, selectContentLang } = useOrgContentLang(
    slug,
    locale
  )
  const { data: plans, isLoading: plansLoading } = usePublicOrgPlans(slug)

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-xl">
          <Spinner size="md" label={m.org_profile_loading()} />
        </div>
      </PageWrapper>
    )
  }

  // 502 means portal couldn't reach login; anything else is just as unrenderable.
  if (error) {
    return (
      <PageWrapper>
        <div className="py-xl">
          <CardDataError />
          {error instanceof PublicProfileUnavailableError && (
            <p className="text-sm text-hot-gray-600 mt-sm">{m.profile_error_upstream()}</p>
          )}
        </div>
      </PageWrapper>
    )
  }

  if (!org) return <NotFoundPage />

  const videoId = youtubeVideoId(org.video_url)
  const fallbackLang = fallbackContentLang(org, contentLang, videoId)

  return (
    <>
      <OrgProfileHero
        name={org.name}
        tagline={org.tagline}
        taglineLang={fieldLang(org, 'tagline')}
        bannerUrl={resolveLoginUrl(org.banner_url)}
        videoId={videoId}
        videoLang={fieldLang(org, 'video_url')}
        contentLang={contentLang}
        uiLang={locale}
      />

      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-xl lg:gap-2xl">
          {/* Content language; the UI text inside (note, plans) keeps the page's */}
          <div lang={contentLang} className="min-w-0">
            {fallbackLang && (
              <p lang={locale} className="text-sm text-hot-gray-500 mb-lg">
                {m.org_profile_content_fallback({
                  language: languageName(fallbackLang, locale),
                })}
              </p>
            )}
            {org.description && (
              <section
                lang={fieldLang(org, 'description')}
                className="org-profile-description text-hot-gray-700 mb-2xl"
              >
                <RichTextContent content={org.description} />
              </section>
            )}
            <OrgPlansSection plans={plans} loading={plansLoading} uiLang={locale} />
          </div>

          <aside>
            <OrgLanguageSelect
              availableLocales={org.available_locales}
              baseLocale={org.default_locale}
              contentLang={contentLang}
              onSelect={selectContentLang}
            />
            <OrgContactInfo email={org.contact_email} website={org.website} />
          </aside>
        </div>
      </PageWrapper>
    </>
  )
}

export default ProfileOrgPage
