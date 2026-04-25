import { useState } from 'react'
import Button from '../../components/shared/Button'
import CardSkeleton from '../../components/shared/CardSkeleton'
import Checkbox from '../../components/shared/Checkbox'
import RichTextEditor from '../../components/shared/RichTextEditor'
import { APP_LABELS, useAllUserProjects } from '../hooks'
import type { ProjectOption } from '../hooks'
import type { AppName } from '../types'

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
  const { projects, isLoading: projectsLoading } = useAllUserProjects()

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
        {projectsLoading ? (
          <div className="flex flex-col gap-sm">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} linesCount={1} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-sm text-hot-gray-400">No projects found across your tools.</p>
        ) : (
          <div className="flex flex-col gap-xs">
            {projects.map((project) => (
              <Checkbox
                key={projectKey(project)}
                checked={selected.has(projectKey(project))}
                onChange={(e) => {
                  const el = e.target as HTMLElement & { checked: boolean }
                  toggleProject(project, el.checked)
                }}
              >
                {project.title}{' '}
                <span className="text-hot-gray-400">— {APP_LABELS[project.app]}</span>
              </Checkbox>
            ))}
          </div>
        )}
      </div>

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
