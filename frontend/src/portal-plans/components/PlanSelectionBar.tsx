import Button from '../../components/shared/Button'
import Icon from '../../components/shared/Icon'
import { m } from '../../paraglide/messages'

interface PlanSelectionBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onCancel: () => void
  onRemove: () => void
}

/** Actions for the projects picked in select mode. */
function PlanSelectionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onCancel,
  onRemove,
}: PlanSelectionBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-white shadow-md">
      <div className="container flex flex-wrap items-center gap-sm py-sm">
        <span className="text-sm font-semibold">
          {m.plan_select_count({ count: selectedCount })}
        </span>
        <button
          type="button"
          onClick={onSelectAll}
          disabled={totalCount === 0 || selectedCount === totalCount}
          className="text-sm text-hot-gray-600 hover:text-hot-gray-800 underline cursor-pointer disabled:no-underline disabled:opacity-50 disabled:cursor-default"
        >
          {m.plan_select_all()}
        </button>
        <div className="ml-auto flex items-center gap-xs">
          <Button appearance="outlined" onClick={onCancel}>
            {m.plan_cancel()}
          </Button>
          <Button variant="danger" disabled={selectedCount === 0} onClick={onRemove}>
            <Icon name="trash" />
            {m.plan_select_remove_button({ count: selectedCount })}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PlanSelectionBar
