import type { RefObject } from "react";
import Button from "../../../components/shared/Button";
import { m } from "../../../paraglide/messages";

interface PlanImagesFieldProps {
  displayImages: { id: string; url: string }[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (id: string) => void;
}

function PlanImagesField({
  displayImages,
  fileInputRef,
  isUploading,
  handleFileChange,
  handleRemoveImage,
}: PlanImagesFieldProps) {
  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-hot-gray-700">Images</p>
        <input
          ref={fileInputRef}
          id="plan-images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          appearance="outlined"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? m.plan_form_uploading() : m.plan_form_add_images()}
        </Button>
      </div>
      {displayImages.length > 0 && (
        <div className="flex flex-wrap gap-sm">
          {displayImages.map((img) => (
            <div
              key={img.id}
              className="relative w-24 h-24 rounded-lg overflow-hidden group"
            >
              <img
                src={img.url}
                alt={`Image ${img.id}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(img.id)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlanImagesField;
