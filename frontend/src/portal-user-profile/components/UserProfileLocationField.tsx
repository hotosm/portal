import { useState } from 'react'
import LocationAutocomplete from '../../components/shared/LocationAutocomplete'
import { m } from '../../paraglide/messages'
import type { UserProfileLocationFieldProps } from '../types'
import { EditActions, EditError, EditTrigger } from './EditActions'

function UserProfileLocationField({
  location,
  draft,
  onDraftChange,
  isEditing,
  canEdit,
  isPending,
  saveError,
  onStartEditing,
  onSave,
  onCancel,
}: UserProfileLocationFieldProps) {
  // Typed location text that isn't a picked suggestion can't be saved.
  const [locationDirty, setLocationDirty] = useState(false)

  const startEditing = () => {
    setLocationDirty(false)
    onStartEditing()
  }

  if (isEditing) {
    return (
      <div className="mt-xs flex flex-col gap-xs">
        <div className="flex items-center gap-xs">
          <div className="flex-1 w-full max-w-[400px]">
            <LocationAutocomplete
              label={m.profile_edit_location_label()}
              value={draft}
              onChange={onDraftChange}
              onDirtyChange={setLocationDirty}
            />
          </div>
          <EditActions
            onSave={onSave}
            onCancel={onCancel}
            isPending={isPending}
            saveDisabled={locationDirty}
          />
        </div>
        <EditError error={saveError} />
      </div>
    )
  }

  if (location) {
    return (
      <span className="mt-xs text-sm flex items-center gap-2xs h-[38px]">
        {location}
        {canEdit && (
          <EditTrigger label={m.profile_edit_location_button()} onClick={startEditing} />
        )}
      </span>
    )
  }

  return canEdit ? (
    <span className="mt-xs text-sm h-[38px] block">
      <EditTrigger text={m.profile_add_location()} onClick={startEditing} />
    </span>
  ) : null
}

export default UserProfileLocationField
