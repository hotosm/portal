import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import { m } from "../../paraglide/messages";
import { useCreateProjectGroup } from "../hooks";
import type { ProjectGroup } from "../types";

interface GroupsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Receives the new group, e.g. to assign it to a project right away. */
  onCreated?: (group: ProjectGroup) => void;
}

/**
 * Creates a project group without leaving the plan. Groups belong to the user
 * (or a team/org they share with) and are reusable across plans — the scope
 * picker, renaming and deleting stay on the groups & tags page.
 */
function GroupsDialog({ open, onClose, onCreated }: GroupsDialogProps) {
  const createGroup = useCreateProjectGroup();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Open on an empty form rather than on whatever was typed and abandoned last time.
  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
  }, [open]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !createGroup.isPending;

  function submit() {
    if (!canSubmit) return;
    createGroup.mutate(
      // Personal by default: sharing with a team or organization needs the scope
      // picker, which lives on the groups & tags page.
      {
        name: trimmedName,
        description: description.trim() || null,
        group_type: null,
        group_id: null,
      },
      {
        onSuccess: (group) => {
          toast.success(m.plan_groups_toast_group_created());
          onCreated?.(group);
          onClose();
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      label={m.plan_groups_section_groups()}
      onWaHide={(e: Event) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-sm"
      >
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-hot-red-600">
            {m.plan_groups_dialog_add_label()}
          </h4>
          <p className="text-sm text-hot-gray-500">{m.plan_groups_dialog_add_hint()}</p>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={m.plan_groups_new_group_placeholder()}
          className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
        />
        <textarea
          value={description}
          rows={2}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={m.plan_groups_description_placeholder()}
          className="border border-hot-gray-300 rounded-lg px-md py-sm text-sm outline-none focus:border-hot-red-500 resize-y"
        />
        {/* Submit lives in the dialog footer, so keep a hidden one here for Enter. */}
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>

      <div slot="footer" className="flex gap-sm justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          {m.plan_cancel()}
        </button>
        <Button type="button" onClick={submit} disabled={!canSubmit}>
          {createGroup.isPending ? m.plan_groups_adding() : m.plan_groups_dialog_create()}
        </Button>
      </div>
    </Dialog>
  );
}

export default GroupsDialog;
