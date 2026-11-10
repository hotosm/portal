import Icon from '../../components/shared/Icon'
import { m } from '../../paraglide/messages'
import { contactHref, formatLinkLabel } from '../../portal-user-profile/utils'
import type { OrgContactInfoProps } from '../types'

/**
 * An org's public contact details: email and website.
 */
function OrgContactInfo({ email, website }: OrgContactInfoProps) {
  if (!email && !website) return null

  return (
    <section className="border border-dashed border-hot-gray-300 rounded-md p-lg flex flex-col gap-md">
      <h2 className="flex items-center gap-sm text-base font-semibold text-hot-gray-900">
        <Icon name="address-book" label="" />
        {m.org_profile_contact_info()}
      </h2>
      <ul className="flex flex-col gap-sm list-none p-0 m-0 text-sm">
        {email && (
          <li className="flex items-center gap-sm min-w-0">
            <Icon name="envelope" label="" className="shrink-0 text-hot-gray-500" />
            <a
              href={contactHref('contact_email', email)}
              className="break-all"
            >
              {email}
            </a>
          </li>
        )}
        {website && (
          <li className="flex items-center gap-sm min-w-0">
            <Icon name="link" label="" className="shrink-0 text-hot-gray-500" />
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all"
            >
              {formatLinkLabel(website)}
            </a>
          </li>
        )}
      </ul>
    </section>
  )
}

export default OrgContactInfo
