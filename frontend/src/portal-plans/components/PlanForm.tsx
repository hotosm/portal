import { useState } from "react";
import Button from "../../components/shared/Button";
import { m } from "../../paraglide/messages";
import type { PlanFormValues, PlanImageRead } from "../types";
import { usePlanImageUpload } from "../hooks/usePlanImageUpload";
import PlanNameField from "./form/PlanNameField";
import PlanDescriptionField from "./form/PlanDescriptionField";
import PlanImagesField from "./form/PlanImagesField";

interface PlanFormProps {
  initialName?: string;
  initialDescription?: string;
  initialImages?: PlanImageRead[];
  planId?: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: PlanFormValues) => Promise<void>;
  onCancel: () => void;
}

function PlanForm({
  initialName = "",
  initialDescription = "",
  initialImages = [],
  planId,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: PlanFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const {
    displayImages,
    pendingImages,
    fileInputRef,
    isUploading,
    isDeleting,
    handleFileChange,
    handleRemoveImage,
  } = usePlanImageUpload({ planId, initialImages });

  const busy = isPending || isUploading || isDeleting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, description, pendingImages });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-lg px-0 lg:px-2xl py-lg"
    >
      <PlanNameField value={name} onChange={setName} />

      <PlanDescriptionField value={description} onChange={setDescription} />

      <PlanImagesField
        displayImages={displayImages}
        fileInputRef={fileInputRef}
        isUploading={isUploading}
        handleFileChange={handleFileChange}
        handleRemoveImage={handleRemoveImage}
      />
      <div className="flex items-center gap-md pt-2xl">
        <Button type="submit" disabled={busy || !name.trim()}>
          {isPending ? m.plan_form_saving() : submitLabel}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          {m.plan_cancel()}
        </button>
      </div>
    </form>
  );
}

export default PlanForm;
