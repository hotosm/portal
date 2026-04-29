import { useRef, useState } from 'react'
import Button from '../../components/shared/Button'
import RichTextEditor from '../../components/shared/RichTextEditor'
import Tag from '../../components/shared/Tag'
import { APP_LABELS, useAllUserProjects } from '../hooks'
import type { ProjectOption } from '../hooks'
import type { AppName, PlanImageRead } from '../types'
import { useDeletePlanImage, useUploadPlanImage } from '../hooks/usePlanImages'
import ImageCarousel from './ImageCarousel'
import ProjectPickerDialog from './ProjectPickerDialog'

export interface PlanFormValues {
  name: string
  description: string
  selectedProjects: { app: AppName; project_id: string }[]
  pendingImages: File[]
}

interface PlanFormProps {
  initialName?: string
  initialDescription?: string
  initialProjectKeys?: Set<string>
  initialImages?: PlanImageRead[]
  planId?: string
  submitLabel: string
  isPending: boolean
  onSubmit: (values: PlanFormValues) => Promise<void>
  onCancel: () => void
}

function projectKey(p: ProjectOption) {
  return `${p.app}:${p.project_id}`
}

function PlanForm({
  initialName = '',
  initialDescription = '',
  initialProjectKeys = new Set(),
  initialImages = [],
  planId,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: PlanFormProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [selected, setSelected] = useState<Set<string>>(initialProjectKeys)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [savedImages, setSavedImages] = useState<PlanImageRead[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { sources, projects, isLoading } = useAllUserProjects()
  const uploadMutation = useUploadPlanImage(planId ?? '')
  const deleteMutation = useDeletePlanImage(planId ?? '')

  const previewImages = pendingFiles.map((f, i) => ({
    id: `pending-${i}`,
    url: URL.createObjectURL(f),
  }))

  const displayImages = planId
    ? savedImages.map((img) => ({ id: img.id, url: img.url }))
    : previewImages

  function toggleProject(project: ProjectOption, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      checked ? next.add(projectKey(project)) : next.delete(projectKey(project))
      return next
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    if (planId) {
      setIsUploading(true)
      Promise.all(files.map((f) => uploadMutation.mutateAsync(f)))
        .then((uploaded) => setSavedImages((prev) => [...prev, ...uploaded]))
        .finally(() => {
          setIsUploading(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        })
    } else {
      setPendingFiles((prev) => [...prev, ...files])
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemoveImage(id: string) {
    if (planId) {
      deleteMutation.mutate(id, {
        onSuccess: () => setSavedImages((prev) => prev.filter((img) => img.id !== id)),
      })
    } else {
      const idx = parseInt(id.replace('pending-', ''), 10)
      setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const selectedProjects = projects
      .filter((p) => selected.has(projectKey(p)))
      .map(({ app, project_id }) => ({ app, project_id }))
    await onSubmit({ name, description, selectedProjects, pendingImages: pendingFiles })
  }

  const selectedTags = projects.filter((p) => selected.has(projectKey(p)))
  const loadingCount = selected.size - selectedTags.length
  const busy = isPending || isUploading || deleteMutation.isPending

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg max-w-lg py-lg">
      <div className="flex flex-col gap-xs">
        <label htmlFor="plan-name" className="text-sm font-medium text-hot-gray-700">
          Name <span className="text-hot-red-600">*</span>
        </label>
        <input
          id="plan-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="My plan"
          className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
        />
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="plan-description" className="text-sm font-medium text-hot-gray-700">
          Description
        </label>
        <RichTextEditor
          id="plan-description"
          value={description}
          onChange={setDescription}
          placeholder="Optional description"
        />
      </div>

      <div className="flex flex-col gap-sm">
        <p className="text-sm font-medium text-hot-gray-700">Images</p>
        {displayImages.length > 0 && (
          <ImageCarousel images={displayImages} onRemove={handleRemoveImage} />
        )}
        <div>
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
            {isUploading ? 'Uploading…' : 'Add images'}
          </Button>
          {displayImages.length > 0 && (
            <span className="ml-sm text-sm text-hot-gray-400">
              {displayImages.length} image{displayImages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <p className="text-sm font-medium text-hot-gray-700">Projects</p>
        <Button type="button" appearance="outlined" onClick={() => setDialogOpen(true)}>
          {selected.size === 0
            ? 'Select projects…'
            : `${selected.size} project${selected.size !== 1 ? 's' : ''} selected`}
        </Button>

        {selected.size > 0 && (
          <div className="flex flex-wrap gap-xs">
            {selectedTags.map((p) => (
              <Tag
                key={projectKey(p)}
                size="small"
                withRemove
                onWaRemove={() => toggleProject(p, false)}
              >
                {p.title}
                <span className="text-hot-gray-400 ml-1">— {APP_LABELS[p.app]}</span>
              </Tag>
            ))}
            {isLoading && loadingCount > 0 && (
              <span className="text-sm text-hot-gray-400 self-center">
                +{loadingCount} loading…
              </span>
            )}
          </div>
        )}
      </div>

      <ProjectPickerDialog
        open={dialogOpen}
        selected={selected}
        sources={sources}
        onConfirm={(next) => setSelected(next)}
        onClose={() => setDialogOpen(false)}
      />

      <div className="flex items-center gap-md">
        <Button type="submit" disabled={busy || !name.trim()}>
          {isPending ? 'Saving…' : submitLabel}
        </Button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default PlanForm
