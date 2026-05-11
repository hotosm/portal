import { useRef, useState } from "react";
import { optimizeImage } from "../../utils/optimizeImage";
import { useDeletePlanImage, useUploadPlanImage } from "./usePlanImages";
import type { PlanImageRead } from "../types";

interface UsePlanImageUploadOptions {
  planId?: string;
  initialImages?: PlanImageRead[];
}

export function usePlanImageUpload({
  planId,
  initialImages = [],
}: UsePlanImageUploadOptions) {
  const [pendingFiles, setPendingFiles] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [savedImages, setSavedImages] = useState<PlanImageRead[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadPlanImage(planId ?? "");
  const deleteMutation = useDeletePlanImage(planId ?? "");

  const displayImages = planId
    ? savedImages.map((img) => ({ id: img.id, url: img.url }))
    : pendingFiles.map((p, i) => ({ id: `pending-${i}`, url: p.previewUrl }));

  const pendingImages = pendingFiles.map((p) => p.file);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const optimized = await Promise.all(files.map((f) => optimizeImage(f)));

    if (planId) {
      setIsUploading(true);
      try {
        const uploaded = await Promise.all(
          optimized.map((f) => uploadMutation.mutateAsync(f)),
        );
        setSavedImages((prev) => [...prev, ...uploaded]);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } else {
      const newEntries = optimized.map((f) => ({
        file: f,
        previewUrl: URL.createObjectURL(f),
      }));
      setPendingFiles((prev) => [...prev, ...newEntries]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemoveImage(id: string) {
    if (planId) {
      deleteMutation.mutate(id, {
        onSuccess: () =>
          setSavedImages((prev) => prev.filter((img) => img.id !== id)),
      });
    } else {
      const idx = parseInt(id.replace("pending-", ""), 10);
      setPendingFiles((prev) => {
        const removed = prev[idx];
        if (removed) URL.revokeObjectURL(removed.previewUrl);
        return prev.filter((_, i) => i !== idx);
      });
    }
  }

  return {
    displayImages,
    pendingImages,
    fileInputRef,
    isUploading,
    isDeleting: deleteMutation.isPending,
    handleFileChange,
    handleRemoveImage,
  };
}
