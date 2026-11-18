import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Avatar from '../../components/shared/Avatar'
import Button from '../../components/shared/Button'
import Callout from '../../components/shared/Callout'
import Dialog from '../../components/shared/Dialog'
import Dropdown from '../../components/shared/Dropdown'
import DropdownItem from '../../components/shared/DropdownItem'
import Icon from '../../components/shared/Icon'
import Input from '../../components/shared/Input'
import Option from '../../components/shared/Option'
import Select from '../../components/shared/Select'
import Separator from '../../components/shared/Separator'
import { useLanguage } from '../../contexts/LanguageContext'
import { m } from '../../paraglide/messages'
import {
  useAddPlanUserByEmail,
  useMyGroups,
  usePlanAccess,
  useRemovePlanGrant,
  useSetPlanAttribution,
  useSetPlanGrant,
  useSetPlanLink,
} from '../hooks'
import type { GrantRole, GrantSubjectType, PlanGrant, PlanReadHydrated, UserGroup } from '../types'

interface PlanShareDialogProps {
  plan: PlanReadHydrated
  open: boolean
  onClose: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Org roles that may attribute a plan to the org (mirrors the backend).
const ORG_MANAGER_ROLES = new Set(['owner', 'manager'])
// The "By" select's value for "no organization": the owner, personally.
const PERSONAL = 'personal'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function subjectTypeLabel(type: GrantSubjectType): string {
  if (type === 'organization') return m.plan_permissions_scope_org()
  if (type === 'team') return m.plan_permissions_scope_team()
  return m.plan_access_type_person()
}

function roleLabel(role: GrantRole): string {
  return role === 'editor' ? m.plan_access_role_editor() : m.plan_access_role_viewer()
}

function summaryText(grants: PlanGrant[]): string | null {
  const count = (type: GrantSubjectType) => grants.filter((g) => g.subject_type === type).length
  const people = count('user')
  const teams = count('team')
  const orgs = count('organization')
  const parts = [
    people > 0 &&
      (people === 1
        ? m.plan_access_count_people_singular({ count: people })
        : m.plan_access_count_people_plural({ count: people })),
    teams > 0 &&
      (teams === 1
        ? m.plan_access_count_teams_singular({ count: teams })
        : m.plan_access_count_teams_plural({ count: teams })),
    orgs > 0 &&
      (orgs === 1
        ? m.plan_access_count_orgs_singular({ count: orgs })
        : m.plan_access_count_orgs_plural({ count: orgs })),
  ].filter((part): part is string => Boolean(part))
  return parts.length > 0 ? m.plan_access_summary({ list: parts.join(', ') }) : null
}

interface AccessRowProps {
  name: string
  subtitle: string
  children?: React.ReactNode
}

function AccessRow({ name, subtitle, children }: AccessRowProps) {
  return (
    <li className="flex items-center gap-sm ml-0">
      <Avatar shape="square" initials={initials(name)} label={name} />
      <div className="flex flex-1 flex-col min-w-0">
        <span className="truncate">{name}</span>
        <span className="text-sm text-hot-gray-500">{subtitle}</span>
      </div>
      {children}
    </li>
  )
}

/**
 * The one share dialog for a plan: who it's "by", the owner, people/teams/
 * organizations it is shared with, and "anyone with the link". Only the owner
 * opens it; every change is applied immediately.
 */
function PlanShareDialog({ plan, open, onClose }: PlanShareDialogProps) {
  const { currentLanguage } = useLanguage()
  const { data: access } = usePlanAccess(plan.id, open && plan.is_owner)
  const { data: groups = [] } = useMyGroups()

  const setGrant = useSetPlanGrant(plan.id)
  const addUser = useAddPlanUserByEmail(plan.id)
  const removeGrant = useRemovePlanGrant(plan.id)
  const setLink = useSetPlanLink(plan.id)
  const setAttribution = useSetPlanAttribution(plan.id)

  const [query, setQuery] = useState('')
  const [inputFocused, setInputFocused] = useState(false)

  const planUrl = useMemo(
    () => `${window.location.origin}/${currentLanguage}/plan/${plan.id}`,
    [currentLanguage, plan.id]
  )

  const onCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(planUrl)
      toast.success(m.plan_toast_link_copied())
    } catch {
      toast.error(m.plan_toast_link_copy_error())
    }
  }, [planUrl])

  const grants = access?.grants ?? []

  // The caller's own teams and organizations, filtered by what they typed and
  // without the ones already in the list.
  const trimmed = query.trim()
  const groupOptions = groups.filter(
    (g) =>
      !grants.some((grant) => grant.subject_type === g.type && grant.subject_id === g.id) &&
      g.name.toLowerCase().includes(trimmed.toLowerCase())
  )
  const emailOption = EMAIL_RE.test(trimmed) ? trimmed : null
  const showOptions = (inputFocused || trimmed !== '') && (groupOptions.length > 0 || emailOption)

  function addGroup(group: UserGroup) {
    setGrant.mutate({
      subjectType: group.type,
      subjectId: group.id,
      role: 'viewer',
    })
    setQuery('')
  }

  function addEmail(email: string) {
    addUser.mutate({ email, role: 'viewer' })
    setQuery('')
  }

  // "By" can be the owner personally or an organization the caller owns or
  // manages. A current attribution outside that list (the owner stopped
  // managing it) is still shown so it doesn't change silently.
  const attribution = access?.attribution ?? null
  const attributionOptions = groups.filter(
    (g) => g.type === 'organization' && ORG_MANAGER_ROLES.has(g.role)
  )
  const attributionValue = attribution?.id ?? PERSONAL

  function onAttributionChange(value: string) {
    if (value === attributionValue) return
    setAttribution.mutate(value === PERSONAL ? null : value)
  }

  function onGrantAction(grant: PlanGrant, action: string) {
    if (action === 'remove') {
      removeGrant.mutate({
        subjectType: grant.subject_type,
        subjectId: grant.subject_id,
      })
    } else if (action !== grant.role) {
      setGrant.mutate({
        subjectType: grant.subject_type,
        subjectId: grant.subject_id,
        role: action as GrantRole,
      })
    }
  }

  const ownerName = access?.owner.name ?? plan.owner_name ?? ''
  const summary = summaryText(grants)
  const linkRole = access?.link_role ?? (plan.is_public ? 'viewer' : null)

  return (
    <Dialog
      open={open}
      label={m.plan_permissions_dialog_label()}
      // Only close on the dialog's own wa-hide — the inner dropdowns and
      // selects bubble wa-hide when they close, which would close us too.
      onWaHide={(e: Event) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex flex-col gap-md">
        

        <div className="relative">
          <Input
            value={query}
            placeholder={m.plan_access_add_placeholder()}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value ?? '')}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            autocomplete="off"
          />
          {showOptions && (
            <div className="absolute z-10 mt-xs flex w-full flex-col rounded-lg border border-hot-gray-200 bg-white py-xs shadow-md">
              {groupOptions.map((g) => (
                <Button
                  key={`${g.type}:${g.id}`}
                  type="button"
                  appearance="plain"
                  className="w-full [&::part(base)]:justify-start"
                  // Keep the input focused until the click lands.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addGroup(g)}
                >
                  <Icon
                    slot="start"
                    library="bootstrap"
                    name={g.type === 'organization' ? 'building' : 'people'}
                  />
                  {g.name}
                </Button>
              ))}
              {emailOption && (
                <Button
                  type="button"
                  appearance="plain"
                  className="w-full [&::part(base)]:justify-start"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addEmail(emailOption)}
                >
                  <Icon slot="start" library="bootstrap" name="person-plus" />
                  {m.plan_access_add_email({ email: emailOption })}
                </Button>
              )}
            </div>
          )}
        </div>

        {access && (
          <section className="flex flex-col gap-sm">
            <h3 className="text-sm font-semibold">{m.plan_access_section()}</h3>
            <ul className="flex flex-col gap-sm">
              <AccessRow name={ownerName} subtitle={m.plan_access_type_person()}>
                <span className="text-sm">{m.plan_access_owner()}</span>
              </AccessRow>
              {grants.map((grant) => {
                const name = grant.subject_name ?? m.plan_access_unknown_name()
                return (
                  <AccessRow
                    key={`${grant.subject_type}:${grant.subject_id}`}
                    name={name}
                    subtitle={subjectTypeLabel(grant.subject_type)}
                  >
                    <Dropdown onSelect={(e) => onGrantAction(grant, e.detail.item.value)}>
                      <Button slot="trigger" appearance="outlined" size="small" withCaret>
                        {roleLabel(grant.role)}
                      </Button>
                      <DropdownItem
                        value="viewer"
                        type="checkbox"
                        checked={grant.role === 'viewer'}
                      >
                        {m.plan_access_role_viewer()}
                      </DropdownItem>
                      <DropdownItem
                        value="editor"
                        type="checkbox"
                        checked={grant.role === 'editor'}
                      >
                        {m.plan_access_role_editor()}
                      </DropdownItem>
                      <Separator />
                      <DropdownItem value="remove" variant="danger">
                        {m.plan_access_remove()}
                      </DropdownItem>
                    </Dropdown>
                  </AccessRow>
                )
              })}
            </ul>
            {summary && <p className="text-sm text-hot-gray-500">{summary}</p>}
          </section>
        )}
        
        {access && (
          <>
            <div className="flex items-center gap-sm">
              <Icon library="bootstrap" name="link-45deg" />
              <span className="flex-1">{m.plan_access_link_label()}</span>
              <Dropdown
                onSelect={(e) => {
                  const next = e.detail.item.value === 'viewer' ? 'viewer' : null
                  if (next !== linkRole) setLink.mutate(next)
                }}
              >
                <Button slot="trigger" appearance="outlined" size="small" withCaret>
                  {linkRole ? m.plan_access_role_viewer() : m.plan_access_link_none()}
                </Button>
                <DropdownItem value="none" type="checkbox" checked={linkRole == null}>
                  {m.plan_access_link_none()}
                </DropdownItem>
                <DropdownItem value="viewer" type="checkbox" checked={linkRole === 'viewer'}>
                  {m.plan_access_role_viewer()}
                </DropdownItem>
              </Dropdown>
            </div>
            {linkRole === 'viewer' && (
              <Callout variant="warning">
                <Icon slot="icon" library="bootstrap" name="exclamation-triangle" />
                {m.plan_access_link_warning()}
              </Callout>
            )}
          </>
        )}

        {access && (
          <div className="flex flex-col gap-xs">
            <Select
              label={m.plan_attribution_label()}
              size="small"
              value={attributionValue}
              onChange={(e) => onAttributionChange((e.target as HTMLSelectElement).value)}
            >
              <Option value={PERSONAL}>{m.plan_attribution_personal({ name: ownerName })}</Option>
              {attribution && !attributionOptions.some((g) => g.id === attribution.id) && (
                <Option value={attribution.id}>
                  {attribution.name ?? m.plan_access_unknown_name()}
                </Option>
              )}
              {attributionOptions.map((g) => (
                <Option key={g.id} value={g.id}>
                  {g.name}
                </Option>
              ))}
            </Select>
            <p className="text-sm text-hot-gray-500">{m.plan_attribution_help()}</p>
          </div>
        )}

        
      </div>

      <div slot="footer" className="flex justify-between w-full">
        <Button type="button" size="small" appearance="outlined" onClick={onCopyLink}>
          <Icon slot="start" library="bootstrap" name="clipboard" />
          {m.plan_share_copy_link()}
        </Button>
        <Button type="button" appearance="accent" variant="neutral" onClick={onClose}>
          Done
        </Button>
      </div>
    </Dialog>
  )
}

export default PlanShareDialog
