import Button from '../../components/shared/Button'
import Icon from '../../components/shared/Icon'
import { m } from '../../paraglide/messages'

export type PlanView = 'card' | 'list'

interface ViewToggleProps {
  value: PlanView
  onChange: (value: PlanView) => void
}

const OPTIONS = [
  { value: 'card', icon: 'table-cells', label: () => m.plan_view_cards() },
  { value: 'list', icon: 'list', label: () => m.plan_view_list() },
] as const

function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <>
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          appearance="plain"
          variant={value === option.value ? 'brand' : 'neutral'}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          title={option.label()}
          className={
            value === option.value ? 'plan-view-toggle' : 'plan-view-toggle plan-view-toggle--inactive'
          }
        >
          <Icon name={option.icon} label={option.label()} />
        </Button>
      ))}
    </>
  )
}

export default ViewToggle
