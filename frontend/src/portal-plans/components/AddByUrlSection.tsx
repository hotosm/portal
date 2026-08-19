import Button from '../../components/shared/Button'
import { m } from '../../paraglide/messages'

interface AddByUrlSectionProps {
  urlInput: string
  setUrlInput: (value: string) => void
  urlError: string | null
  setUrlError: (value: string | null) => void
  isPending: boolean
  onAdd: () => void
  /** Optional help line under the heading. */
  description?: string
  /** Top divider — on when the section sits below other dialog content. */
  divider?: boolean
}

export function AddByUrlSection({
  urlInput,
  setUrlInput,
  urlError,
  setUrlError,
  isPending,
  onAdd,
  description,
  divider = true,
}: AddByUrlSectionProps) {
  return (
    <div
      className={`flex flex-col gap-xs ${divider ? 'border-t border-hot-gray-200 pt-md mt-md' : ''}`}
    >
      <span className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide">
        {m.plan_picker_url_heading()}
      </span>
      {description && <p className="text-xs text-hot-gray-400">{description}</p>}
      <div className="flex gap-xs">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value)
            setUrlError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd()
            }
          }}
          placeholder={m.plan_picker_url_placeholder()}
          className="flex-1 border border-hot-gray-300 rounded-lg px-sm py-xs text-sm outline-none focus:border-hot-red-500"
        />
        <Button type="button" size="small" disabled={!urlInput.trim() || isPending} onClick={onAdd}>
          {isPending ? m.plan_picker_url_checking() : m.plan_picker_url_add()}
        </Button>
      </div>
      {urlError && <p className="text-xs text-hot-red-600">{urlError}</p>}
    </div>
  )
}
