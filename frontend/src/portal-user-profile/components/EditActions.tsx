import Button from "../../components/shared/Button";
import { EditActionsProps, EditErrorProps, EditTriggerProps } from "../types";
import { m } from '../../paraglide/messages'
import Icon from "../../components/shared/Icon";

function EditActions({
  onSave,
  onCancel,
  isPending,
  saveDisabled = false,
}: EditActionsProps) {
  return (
    <div className="flex items-center gap-xs shrink-0">
      <Button
        appearance="accent"
        size="small"
        onClick={onSave}
        disabled={isPending || saveDisabled}
      >
        {isPending ? m.profile_edit_saving() : m.profile_edit_save()}
      </Button>
      <Button
        appearance="plain"
        size="small"
        onClick={onCancel}
        disabled={isPending}
      >
        {m.profile_edit_cancel()}
      </Button>
    </div>
  )
}


function EditTrigger({
  label = '',
  text,
  onClick,
  className
}: EditTriggerProps) {

  return (
    <Button appearance="plain" size="small" className={className} onClick={onClick}>
      {text}
      <Icon
        slot={text ? 'end' : undefined}
        library="bootstrap"
        name="pencil"
        label={text ? '' : label}
      />
    </Button>
  )
}

function EditError({ error }: EditErrorProps) {
  if (!error) return null

  return (
    <p className="text-sm text-hot-red-600 m-0" role="alert">
      {error}
    </p>
  )
}

export {EditActions, EditTrigger, EditError}