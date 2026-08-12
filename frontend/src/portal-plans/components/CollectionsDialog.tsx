import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import { m } from "../../paraglide/messages";
import { useCreateCollection } from "../hooks";
import type { Collection } from "../types";
import Input from "../../components/shared/Input";
import Textarea from "../../components/shared/Textarea";

interface CollectionsDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (collection: Collection) => void;
}


function CollectionsDialog({ open, onClose, onCreated }: CollectionsDialogProps) {
  const createCollection = useCreateCollection();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
  }, [open]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !createCollection.isPending;

  function submit() {
    if (!canSubmit) return;
    createCollection.mutate(
      // Personal by default: sharing with a team or organization needs the scope
      // picker, which lives on the collections & tags page.
      {
        name: trimmedName,
        description: description.trim() || null,
        group_type: null,
        group_id: null,
      },
      {
        onSuccess: (collection) => {
          toast.success(m.plan_collections_toast_collection_created());
          onCreated?.(collection);
          onClose();
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      label={m.plan_collections_section_collections()}
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
          <h4 className="text-xs font-semibold uppercase tracking-wide">
            {m.plan_collections_dialog_add_label()}
          </h4>
          <p className="text-sm text-hot-gray-500">{m.plan_collections_dialog_add_hint()}</p>
        </div>
        <Input
          type="text"
          value={name}
          onInput={(e) => setName(e.currentTarget.value ?? '')}
          placeholder={m.plan_collections_new_collection_placeholder()}
        />
        <Textarea
          value={description}
          rows={2}
          onInput={(e) => setDescription(e.currentTarget.value ?? '')}
          placeholder={m.plan_collections_description_placeholder()}
        />
        {/* Submit lives in the dialog footer, so keep a hidden one here for Enter. */}
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>

      <div slot="footer" className="flex justify-end">
        <Button type="button" onClick={submit} disabled={!canSubmit}>
          {createCollection.isPending ? m.plan_collections_adding() : m.plan_collections_dialog_create()}
        </Button>
      </div>
    </Dialog>
  );
}

export default CollectionsDialog;
