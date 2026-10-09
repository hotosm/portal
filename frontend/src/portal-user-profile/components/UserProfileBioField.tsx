import Textarea from '../../components/shared/Textarea'
import { m } from '../../paraglide/messages'
import type { UserProfileBioFieldProps } from '../types'
import { EditActions, EditError, EditTrigger } from './EditActions'

function UserProfileBioField({
  bio, draft, onDraftChange, fieldError,
  isEditing, canEdit, isPending, saveError,
  onStartEditing, onSave, onCancel,
}: UserProfileBioFieldProps) {
  if (isEditing) {
    return (
      <>
        <div className="flex flex-col items-start gap-xs w-full">
          <Textarea
            placeholder={m.profile_edit_bio_label()}
            rows={6}
            value={draft}
            customError={fieldError ?? null}
            hint={fieldError}
            onInput={(e) => onDraftChange(e.currentTarget.value ?? '')}
            className="w-full"
          />
          <EditActions onSave={onSave} onCancel={onCancel} isPending={isPending} />
        </div>
        <EditError error={saveError} />
      </>
    )
  }

  if (bio) {
    return (
      <div className="flex items-start gap-2xs mb-xl">
        <p className="leading-relaxed">{bio}</p>
        {canEdit && <EditTrigger label={m.profile_edit_bio_button()} onClick={onStartEditing} />}
      </div>
    )
  }

  return canEdit ? <EditTrigger text={m.profile_add_bio()} onClick={onStartEditing} /> : null
}

export default UserProfileBioField