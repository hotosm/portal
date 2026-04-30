import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import Dropdown from "../../components/shared/Dropdown";
import DropdownItem from "../../components/shared/DropdownItem";
import Icon from "../../components/shared/Icon";
import { m } from "../../paraglide/messages";
import { usePlanMenu } from "../hooks";
import type { PlanReadHydrated } from "../types";

interface PlanMenuProps {
  plan: PlanReadHydrated;
}

function PlanMenu({ plan }: PlanMenuProps) {
  const {
    onSelect,
    planUrl,
    isDeleting,
    isPublishing,
    confirmDeleteOpen,
    onConfirmDelete,
    onCancelDelete,
    shareOpen,
    onCopyLink,
    onNativeShare,
    onCloseShare,
    publishFirstOpen,
    onClosePublishFirst,
  } = usePlanMenu(plan);

  return (
    <>
      <Dropdown onSelect={onSelect}>
        <Button slot="trigger">{m.plan_menu_trigger()}</Button>
        <DropdownItem value="edit">
          <Icon slot="icon" library="bootstrap" name="pencil" />
          {m.plan_menu_edit()}
        </DropdownItem>
        <DropdownItem value="publish" disabled={isPublishing}>
          <Icon
            slot="icon"
            library="bootstrap"
            name={plan.is_public ? "globe2" : "globe"}
          />
          {plan.is_public ? m.plan_menu_unpublish() : m.plan_menu_publish()}
        </DropdownItem>
        <DropdownItem value="share">
          <Icon slot="icon" library="bootstrap" name="share" />
          {m.plan_menu_share()}
        </DropdownItem>
        <DropdownItem value="delete" variant="danger">
          <Icon slot="icon" library="bootstrap" name="trash" />
          {m.plan_menu_delete()}
        </DropdownItem>
      </Dropdown>

      {/* Share dialog */}
      <Dialog open={shareOpen} label={m.plan_share_dialog_label()} onWaHide={onCloseShare}>
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-sm bg-hot-gray-50 rounded-lg px-sm py-xs text-sm text-hot-gray-600 break-all">
            <Icon library="bootstrap" name="link-45deg" />
            <span className="flex-1">{planUrl}</span>
          </div>
          <div className="flex gap-sm">
            <Button
              type="button"
              appearance="outlined"
              onClick={onCopyLink}
              className="flex-1"
            >
              <Icon slot="start" library="bootstrap" name="clipboard" />
              {m.plan_share_copy_link()}
            </Button>
            {typeof navigator.share === "function" && (
              <Button
                type="button"
                appearance="outlined"
                onClick={onNativeShare}
                className="flex-1"
              >
                <Icon slot="start" library="bootstrap" name="share" />
                {m.plan_share_native()}
              </Button>
            )}
          </div>
        </div>
      </Dialog>

      {/* Publish first dialog */}
      <Dialog
        open={publishFirstOpen}
        label={m.plan_publish_first_label()}
        onWaHide={onClosePublishFirst}
      >
        <p>{m.plan_publish_first_message()}</p>
        <div slot="footer" className="flex gap-sm justify-end">
          <button
            type="button"
            onClick={onClosePublishFirst}
            className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
          >
            {m.plan_cancel()}
          </button>
          <Button type="button" onClick={onClosePublishFirst}>
            {m.plan_publish_first_got_it()}
          </Button>
        </div>
      </Dialog>

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
          <Button
            type="button"
            variant="danger"
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? m.plan_deleting_button() : m.plan_delete_button()}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

export default PlanMenu;
