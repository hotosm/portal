import Icon from '../../components/shared/Icon'
import { m } from '../../paraglide/messages'
import type { PublicProfileCertificate } from '../hooks/usePublicProfile'

interface CertificationsProps {
  /**
   * Certificates earned at learn.hotosm.org, newest first. An empty list is a
   * real answer — not every course issues one — so the section simply does not
   * render, same as when the data could not be fetched.
   */
  certificates: PublicProfileCertificate[] | null | undefined
  /** Which language to format the dates in. */
  locale: string
}

export function Certifications({ certificates, locale }: CertificationsProps) {
  if (!certificates || certificates.length === 0) return null

  return (
    <>
      <h2 className="text-base font-bold">{m.profile_certifications_title()}</h2>
      <p className="text-sm text-hot-gray-600 mt-2xs mb-sm">
        {m.profile_certifications_subtitle()}
      </p>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-sm list-none p-0 m-0">
        {certificates.map((certificate) => {
          const issued = certificate.issued
            ? new Date(certificate.issued).toLocaleDateString(locale, {
                month: 'short',
                year: 'numeric',
              })
            : null

          // Linked when the school gave us a public URL, so a reader can check
          // the claim rather than take the profile's word for it.
          const content = (
            <>
              <span className="flex items-center justify-center shrink-0 w-[32px] h-[32px] rounded-sm bg-[#E6F6F5]">
                <Icon name="star" variant="regular" label="" />
              </span>
              <span className="min-w-0">
                <span className="block font-bold">{certificate.title}</span>
                {issued && (
                  <span className="block text-sm text-hot-gray-600">{issued}</span>
                )}
              </span>
            </>
          )

          return (
            <li
              key={`${certificate.title}-${certificate.issued ?? ''}`}
              className="m-0 flex items-center gap-sm border border-hot-gray-100 rounded-lg p-sm"
            >
              {certificate.url ? (
                <a
                  href={certificate.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-sm no-underline text-inherit min-w-0"
                >
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
