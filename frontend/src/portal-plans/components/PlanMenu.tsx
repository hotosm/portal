import chevronDownIcon from '../../assets/icons/chevron-down.svg?url'
import Button from '../../components/shared/Button'
import Dialog from '../../components/shared/Dialog'
import Dropdown from '../../components/shared/Dropdown'
import DropdownItem from '../../components/shared/DropdownItem'
import Icon from '../../components/shared/Icon'
import { m } from '../../paraglide/messages'
import { usePlanMenu } from '../hooks'
import type { PlanReadHydrated } from '../types'
import PlanShareDialog from './PlanShareDialog'

interface PlanMenuProps {
  plan: PlanReadHydrated
}

function PlanMenu({ plan }: PlanMenuProps) {
  const {
    onSelect,
    isDeleting,
    isPublishing,
    confirmDeleteOpen,
    onConfirmDelete,
    onCancelDelete,
    permissionsOpen,
    onClosePermissions,
  } = usePlanMenu(plan)

  const canEdit = plan.can_edit
  const isOwner = plan.is_owner
  // Publishing toggles the "anyone with the link" grant, which only owners manage.
  const canPublish = isOwner

  return (
    <>
      <Dropdown onSelect={onSelect}>
        <Button slot="trigger">
          {m.plan_menu_trigger()}
          <Icon slot="end" src={chevronDownIcon} label="" />
        </Button>
        {canEdit && (
          <DropdownItem value="edit">
            <Icon slot="icon" library="bootstrap" name="pencil" />
            {m.plan_menu_edit()}
          </DropdownItem>
        )}
        {/* {canPublish && (
          <DropdownItem value="publish" disabled={isPublishing}>
            <Icon slot="icon" library="bootstrap" name={plan.is_public ? 'globe2' : 'globe'} />
            {plan.is_public ? m.plan_menu_unpublish() : m.plan_menu_publish()}
          </DropdownItem>
        )} */}
        <DropdownItem value="permissions">
          <Icon slot="icon" library="bootstrap" name="people" />
          {m.plan_menu_share()}
        </DropdownItem>
        {isOwner && (
          <DropdownItem value="delete" variant="danger">
            <Icon slot="icon" library="bootstrap" name="trash" />
            {m.plan_menu_delete()}
          </DropdownItem>
        )}
      </Dropdown>

      {/* Share dialog: editable for owners, read-only for everyone else */}
      <PlanShareDialog plan={plan} open={permissionsOpen} onClose={onClosePermissions} />

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteOpen}
        label={m.plan_delete_dialog_label()}
        onWaHide={onCancelDelete}
      >
        <p>{m.plan_delete_confirm_message()}</p>
        <div slot="footer" className="flex gap-sm justify-end">
          <button
            type="button"
            onClick={onCancelDelete}
            className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
          >
            {m.plan_cancel()}
          </button>
          <Button type="button" variant="danger" onClick={onConfirmDelete} disabled={isDeleting}>
            {isDeleting ? m.plan_deleting_button() : m.plan_delete_button()}
          </Button>
        </div>
      </Dialog>
    </>
  )
}

export default PlanMenu
