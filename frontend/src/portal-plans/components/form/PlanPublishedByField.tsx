import Option from '../../../components/shared/Option'
import Select from '../../../components/shared/Select'
import { m } from '../../../paraglide/messages'
import { useMyGroups } from '../../hooks'

// wa-select treats an empty value as "nothing selected", so "Personal" uses
// this value and the form gets ''.
const PERSONAL = 'personal'
const ORG_MANAGER_ROLES = ['owner', 'manager']

interface PlanPublishedByFieldProps {
  // Organization id, or '' for personal.
  value: string
  // The plan's current organization, shown even if the user no longer
  // manages it so saving doesn't change it silently.
  currentId: string
  currentName: string | null
  onChange: (v: string) => void
}

function PlanPublishedByField({ value, currentId, currentName, onChange }: PlanPublishedByFieldProps) {
  const { data: groups = [] } = useMyGroups()
  const orgs = groups.filter(
    (g) =>
      g.type === 'organization' && g.status === 'approved' && ORG_MANAGER_ROLES.includes(g.role)
  )
  const showCurrent = !!currentId && !orgs.some((g) => g.id === currentId)
  // Nothing to choose: no organization to pick and no attribution to keep.
  if (orgs.length === 0 && !currentId) return null

  return (
    <Select
      label={m.plan_form_published_by_label()}
      value={value || PERSONAL}
      onChange={(e) => {
        const next = (e.target as HTMLSelectElement).value
        onChange(next === PERSONAL ? '' : next)
      }}
    >
      <div slot="hint">
        {m.plan_form_published_by_help()}
        {showCurrent && ` ${m.plan_form_published_by_unmanaged()}`}
      </div>
      <Option value={PERSONAL}>{m.plan_form_published_by_personal()}</Option>
      {showCurrent && <Option value={currentId}>{currentName ?? currentId}</Option>}
      {orgs.map((g) => (
        <Option key={g.id} value={g.id}>
          {g.name}
        </Option>
      ))}
    </Select>
  )
}

export default PlanPublishedByField
