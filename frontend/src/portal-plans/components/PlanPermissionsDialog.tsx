import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import Option from "../../components/shared/Option";
import Select from "../../components/shared/Select";
import { m } from "../../paraglide/messages";
import { useMyGroups, useUpdatePlan } from "../hooks";
import type {
  EditScope,
  PlanReadHydrated,
  PlanUpdate,
  Visibility,
} from "../types";

type Scope = "personal" | "team" | "organization";

interface PlanPermissionsDialogProps {
  plan: PlanReadHydrated;
  open: boolean;
  onClose: () => void;
}

/** Read the selected value from a Web Awesome `<wa-select>` change event. */
function selectValue(event: unknown): string {
  return (event as { target: { value?: string } }).target?.value ?? "";
}

function PlanPermissionsDialog({ plan, open, onClose }: PlanPermissionsDialogProps) {
  const { data: groups = [] } = useMyGroups();
  const { mutate: updatePlan, isPending } = useUpdatePlan();

  const [scope, setScope] = useState<Scope>(plan.group_type ?? "personal");
  const [groupId, setGroupId] = useState<string | null>(plan.group_id);
  const [editScope, setEditScope] = useState<EditScope>(plan.edit_scope);
  const [visibility, setVisibility] = useState<Visibility>(plan.visibility);

  // Re-seed the form from the plan every time the dialog is (re)opened so it
  // always reflects the persisted permissions rather than a stale edit.
  useEffect(() => {
    if (!open) return;
    setScope(plan.group_type ?? "personal");
    setGroupId(plan.group_id);
    setEditScope(plan.edit_scope);
    setVisibility(plan.visibility);
  }, [open, plan.group_type, plan.group_id, plan.edit_scope, plan.visibility]);

  const teamGroups = groups.filter((g) => g.type === "team");
  const orgGroups = groups.filter((g) => g.type === "organization");
  const hasGroups = groups.length > 0;
  const scopeGroups = scope === "team" ? teamGroups : orgGroups;

  function handleScopeChange(next: Scope) {
    setScope(next);
    if (next === "personal") {
      setGroupId(null);
      // Personal plans only expose private/public visibility.
      if (visibility === "group") setVisibility("private");
      return;
    }
    const list = next === "team" ? teamGroups : orgGroups;
    const stillValid = groupId != null && list.some((g) => g.id === groupId);
    setGroupId(stillValid ? groupId : (list[0]?.id ?? null));
  }

  const groupMissing = scope !== "personal" && !groupId;

  function handleSave() {
    let payload: PlanUpdate;
    if (scope === "personal") {
      payload = {
        visibility: visibility === "group" ? "private" : visibility,
        group_type: null,
        group_id: null,
        edit_scope: "owner",
      };
    } else {
      if (!groupId) return;
      payload = {
        visibility,
        group_type: scope,
        group_id: groupId,
        edit_scope: editScope,
      };
    }
    updatePlan(
      { id: plan.id, payload },
      {
        onSuccess: () => {
          toast.success(m.plan_toast_permissions_saved());
          onClose();
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      label={m.plan_permissions_dialog_label()}
      // Only close on the dialog's own wa-hide — the inner wa-selects bubble
      // wa-hide when their dropdown closes, which would otherwise close us too.
      onWaHide={(e: Event) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col gap-lg">
        {/* Step 1 — pick the scope (personal / team / organization). */}
        <Select
          label={m.plan_permissions_scope_label()}
          value={scope}
          onChange={(e) => handleScopeChange(selectValue(e) as Scope)}
        >
          <Option value="personal">{m.plan_permissions_scope_personal()}</Option>
          {teamGroups.length > 0 && (
            <Option value="team">{m.plan_permissions_scope_team()}</Option>
          )}
          {orgGroups.length > 0 && (
            <Option value="organization">
              {m.plan_permissions_scope_org()}
            </Option>
          )}
        </Select>

        {!hasGroups && (
          <p className="text-sm text-hot-gray-500">
            {m.plan_permissions_no_groups_hint()}
          </p>
        )}

        {/* Concrete group of the chosen type. */}
        {scope !== "personal" && (
          <Select
            label={m.plan_permissions_group_label()}
            value={groupId ?? ""}
            placeholder={m.plan_permissions_group_placeholder()}
            onChange={(e) => setGroupId(selectValue(e) || null)}
          >
            {scopeGroups.map((g) => (
              <Option key={g.id} value={g.id}>
                {g.name}
              </Option>
            ))}
          </Select>
        )}

        {/* Step 2 — conditional permissions. */}
        {scope === "personal" ? (
          <Select
            label={m.plan_permissions_view_label()}
            value={visibility}
            onChange={(e) => setVisibility(selectValue(e) as Visibility)}
          >
            <Option value="private">{m.plan_permissions_view_private()}</Option>
            <Option value="public">{m.plan_permissions_view_public()}</Option>
          </Select>
        ) : (
          <>
            <Select
              label={m.plan_permissions_edit_label()}
              value={editScope}
              onChange={(e) => setEditScope(selectValue(e) as EditScope)}
            >
              <Option value="owner">{m.plan_permissions_edit_owner()}</Option>
              <Option value="group">{m.plan_permissions_edit_group()}</Option>
            </Select>
            <Select
              label={m.plan_permissions_view_label()}
              value={visibility}
              onChange={(e) => setVisibility(selectValue(e) as Visibility)}
            >
              <Option value="private">
                {m.plan_permissions_view_private()}
              </Option>
              <Option value="group">{m.plan_permissions_view_group()}</Option>
              <Option value="public">{m.plan_permissions_view_public()}</Option>
            </Select>
          </>
        )}
      </div>

      <div slot="footer" className="flex gap-sm justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          {m.plan_cancel()}
        </button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending || groupMissing}
        >
          {isPending ? m.plan_permissions_saving() : m.plan_permissions_save()}
        </Button>
      </div>
    </Dialog>
  );
}

export default PlanPermissionsDialog;
