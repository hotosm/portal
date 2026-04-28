import { useState } from 'react'
import Button from '../../components/shared/Button'
import RichTextEditor from '../../components/shared/RichTextEditor'
import Tag from '../../components/shared/Tag'
import { APP_LABELS, useAllUserProjects } from '../hooks'
import type { ProjectOption } from '../hooks'
import type { AppName } from '../types'
import ProjectPickerDialog from './ProjectPickerDialog'

export interface PlanFormValues {
  name: string
  description: string
  selectedProjects: { app: AppName; project_id: string }[]
}

interface PlanFormProps {
  initialName?: string
  initialDescription?: string
  initialProjectKeys?: Set<string>
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
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: PlanFormProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [selected, setSelected] = useState<Set<string>>(initialProjectKeys)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { sources, projects, isLoading } = useAllUserProjects()

  function toggleProject(project: ProjectOption, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      checked ? next.add(projectKey(project)) : next.delete(projectKey(project))
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const selectedProjects = projects
      .filter((p) => selected.has(projectKey(p)))
      .map(({ app, project_id }) => ({ app, project_id }))
    await onSubmit({ name, description, selectedProjects })
  }

  const selectedTags = projects.filter((p) => selected.has(projectKey(p)))
  const loadingCount = selected.size - selectedTags.length

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
        <Button type="submit" disabled={isPending || !name.trim()}>
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
