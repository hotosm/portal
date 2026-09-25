import Button from '../../components/shared/Button'
import { m } from '../../paraglide/messages'
import type { AppName } from '../types'
import { resolveAppLabel } from './PlanProjectCard'

interface SketchmapNameStepProps {
  app: AppName
  projectId: string
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  onBack: () => void
}

/**
 * Name step for a pasted SketchMap Tool URL, shared by the add and link dialogs.
 *
 * SketchMap Tool projects have no name of their own upstream, so the row would
 * otherwise be titled with its raw project_id. Both dialogs that accept a URL
 * have to render this, or pasting a SketchMap URL into one of them looks like
 * nothing happened at all.
 */
function SketchmapNameStep({
  app,
  projectId,
  value,
  onChange,
  onConfirm,
  onBack,
}: SketchmapNameStepProps) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide">
        {m.plan_picker_sketchmap_name_heading()}
      </span>
      <p className="text-xs text-hot-gray-400">{resolveAppLabel(app, projectId)}</p>
      <div className="flex gap-xs">
        <input
          type="text"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onConfirm()
            }
          }}
          placeholder={m.plan_picker_sketchmap_name_placeholder()}
          className="flex-1 border border-hot-gray-300 rounded-lg px-sm py-xs text-sm outline-none focus:border-hot-red-500"
        />
        <Button type="button" size="small" disabled={!value.trim()} onClick={onConfirm}>
          {m.plan_picker_sketchmap_name_confirm()}
        </Button>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="self-start text-xs text-hot-gray-500 underline hover:text-hot-gray-700"
      >
        {m.plan_picker_sketchmap_name_back()}
      </button>
    </div>
  )
}

export default SketchmapNameStep
