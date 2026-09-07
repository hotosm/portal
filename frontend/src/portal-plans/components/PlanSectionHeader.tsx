import Breadcrumb from '../../components/shared/Breadcrumb'
import BreadcrumbItem from '../../components/shared/BreadcrumbItem'
import Button from '../../components/shared/Button'
import PageWrapper from '../../components/shared/PageWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { m } from '../../paraglide/messages'
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

  // A plan is shared when it carries a group; otherwise it's personal and we
  // credit the owner. The owner's name is only known when they're the viewer —
  // plan reads expose owner_id, not a display name.
  const sharedGroup =
    plan?.group_type && plan?.group_id ? groups?.find((g) => g.id === plan.group_id) : undefined
  const ownerName = plan?.is_owner ? (user?.username ?? user?.email) : null

  const attribution = sharedGroup
    ? {
        label:
          sharedGroup.type === 'organization'
            ? m.plan_permissions_scope_org()
            : m.plan_permissions_scope_team(),
        name: sharedGroup.name,
      }
    : ownerName
      ? { label: m.plan_header_owner_author(), name: ownerName }
      : null

  return (
    <div
      style={{
        background: 'linear-gradient(to right, #FFE6DE 0%, #E6F6F5 100%)',
      }}
    >
      <PageWrapper>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            {breadcrumbs.map((item) => (
              <BreadcrumbItem key={item.label} href={item.href}>
                {item.label}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        )}
        <div
          className={`flex flex-col md:flex-row gap-sm w-full justify-between items-start md:items-center ${breadcrumbs && breadcrumbs.length > 0 ? '' : 'pt-md'}`}
        >
          <div>
            <div className="text-2xl/tight break-words min-w-0 w-full md:w-auto">{children}</div>
            {attribution && (
              <span className="flex items-center gap-xs mt-xs text-sm">
                <span className="text-white font-semibold bg-hot-neutral-800 rounded-xl px-xs py-2xs">
                  {attribution.label}
                </span>
                <span>{attribution.name}</span>
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
