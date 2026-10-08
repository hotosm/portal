import { m } from '../../paraglide/messages'
import Button from './Button'
import Dialog from './Dialog'

interface ConfirmDialogProps {
  open: boolean
  label: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
}

/** A destructive-action confirmation: a message with Cancel and a danger button. */
function ConfirmDialog({
  open,
  label,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} label={label} onWaHide={onCancel}>
      <p>{message}</p>
      <div slot="footer" className="flex gap-sm justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          {m.plan_cancel()}
        </button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={isPending}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}

export default ConfirmDialog
