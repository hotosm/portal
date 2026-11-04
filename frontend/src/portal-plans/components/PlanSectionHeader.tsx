import { Link } from 'react-router-dom'
import Breadcrumb from '../../components/shared/Breadcrumb'
import BreadcrumbItem from '../../components/shared/BreadcrumbItem'
import Button from '../../components/shared/Button'
import PageWrapper from '../../components/shared/PageWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { m } from '../../paraglide/messages'
import { useMyPortalProfile } from '../../portal-user-profile/hooks/useMyPortalProfile'
import { getUsername } from '../../utils/username'
import { useMyGroups } from '../hooks'
import type { PlanRead, PlanReadHydrated } from '../types'

export interface BreadcrumbItemDef {
  label: string
  href?: string
}

interface PlanSectionHeaderProps {
  children?: any
  buttonText?: string
  buttonLink?: string
  onButtonClick?: () => void
  menu?: React.ReactNode
  breadcrumbs?: BreadcrumbItemDef[]
  plan?: PlanRead | PlanReadHydrated
  showPublicTag?: boolean
}

function PlanSectionHeader({
  children,
  buttonText,
  buttonLink,
  onButtonClick,
  menu,
  breadcrumbs,
  plan,
}: PlanSectionHeaderProps) {
  const label = buttonText
  const { user } = useAuth()
  const { data: groups } = useMyGroups()
  const { data: me } = useMyPortalProfile()
  const { currentLanguage } = useLanguage()

  // A plan is shared when it carries a group; otherwise it's personal and we
  // credit the owner. The owner sees their own freshest name; everyone else
  // gets the name the hydrated plan carries.
  // The viewer's own groups give the freshest name; anyone outside the group,
  // signed in or not, falls back to the name the plan carries.
  const hasGroup = !!plan?.group_type && !!plan?.group_id
  const groupName = hasGroup
    ? (groups?.find((g) => g.id === plan.group_id)?.name ?? plan.group_name)
    : null
  const ownerName = plan?.is_owner
    ? getUsername({ first_name: me?.first_name, last_name: me?.last_name, email: user?.email })
    : plan && 'owner_name' in plan
      ? plan.owner_name
      : null
  // Link to the public profile only when the backend found one.
  const groupSlug = plan && 'group_slug' in plan ? plan.group_slug : null
  const ownerSlug = plan && 'owner_slug' in plan ? plan.owner_slug : null

  const attribution = groupName
    ? {
        label:
          plan?.group_type === 'organization'
            ? m.plan_permissions_scope_org()
            : m.plan_permissions_scope_team(),
        name: groupName,
        href:
          plan?.group_type === 'organization' && groupSlug
            ? `/${currentLanguage}/org/${groupSlug}`
            : undefined,
      }
    : ownerName
      ? {
          label: m.plan_header_owner_author(),
          name: ownerName,
          href: ownerSlug ? `/${currentLanguage}/people/${ownerSlug}` : undefined,
        }
      : null

  return (
    <div
      className="flow-root"
      style={{
        background: 'linear-gradient(to right, #FFE6DE 0%, #E6F6F5 100%)',
      }}
    >
      <PageWrapper>
        <div
          className={`flex flex-col md:flex-row gap-sm w-full justify-between items-start md:items-center`}
        >
          <div>
            {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            {breadcrumbs.map((item) => (
              <BreadcrumbItem key={item.label} href={item.href}>
                {item.label}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        )}
            <div className="flex items-center gap-xs">
              <div className="text-2xl/tight break-words min-w-0 w-full md:w-auto">{children}</div>
            </div>
            {attribution && (
              <span className="flex items-center gap-xs mt-xs text-sm">
                <span className="text-white font-semibold bg-hot-neutral-800 rounded-xl px-xs py-2xs">
                  {attribution.label}
                </span>
                {attribution.href ? (
                  <Link to={attribution.href} className="text-inherit no-underline hover:underline">
                    {attribution.name}
                  </Link>
                ) : (
                  <span>{attribution.name}</span>
                )}
              </span>
            )}
          </div>
          {menu ??
            ((label || buttonLink) && (
              <Button href={buttonLink} onClick={onButtonClick}>
                {label}
              </Button>
            ))}
        </div>
      </PageWrapper>
    </div>
  )
}

export default PlanSectionHeader
