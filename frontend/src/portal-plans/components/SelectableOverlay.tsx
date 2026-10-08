import Checkbox from '../../components/shared/Checkbox'
import { m } from '../../paraglide/messages'
import { useProjectSelectionContext } from '../hooks'

interface SelectableOverlayProps {
  /** The plan_project id this card or row stands for. */
  id: string
  children: React.ReactNode
  className?: string
  /** Corner radius of the selection frame; match the wrapped card or row. */
  rounded?: string
}

/**
 * Makes a card or row selectable while the plan is in select mode.
 *
 * Outside select mode it is a plain wrapper. In select mode a transparent
 * layer covers the content, so a click toggles the selection instead of
 * opening the project dialog, and it also sits over the drag handle.
 */
function SelectableOverlay({
  id,
  children,
  className = '',
  rounded = 'rounded-xl',
}: SelectableOverlayProps) {
  const { selectMode, selectedIds, toggle } = useProjectSelectionContext()
  const selected = selectedIds.has(id)

  return (
    <div className={`relative ${className}`}>
      {children}
      {selectMode && (
        <button
          type="button"
          aria-pressed={selected}
          aria-label={m.plan_select_item_label()}
          onClick={() => toggle(id)}
          className={`absolute inset-0 z-30 h-full w-full cursor-pointer ${rounded} border-2 transition-colors ${
            selected ? 'border-hot-red-600 bg-hot-red-600/10' : 'border-transparent bg-white/30'
          }`}
        >
          <span className="pointer-events-none absolute top-2 left-2 rounded bg-white p-2xs leading-none shadow">
            <Checkbox checked={selected} tabIndex={-1} aria-hidden="true" />
          </span>
        </button>
      )}
    </div>
  )
}

export default SelectableOverlay
