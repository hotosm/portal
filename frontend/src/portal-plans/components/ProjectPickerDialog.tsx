import { useEffect, useState } from 'react'
import Button from '../../components/shared/Button'
import Checkbox from '../../components/shared/Checkbox'
import Dialog from '../../components/shared/Dialog'
import { APP_LABELS } from '../hooks'
import type { ProjectSource } from '../hooks'
import type { AppName } from '../types'

function projectKey(app: AppName, project_id: string) {
  return `${app}:${project_id}`
}

function CheckboxSkeleton() {
  return (
    <div className="flex items-center gap-sm py-xs animate-pulse">
      <div className="w-4 h-4 bg-hot-gray-200 rounded flex-shrink-0" />
      <div className="h-4 bg-hot-gray-200 rounded w-3/5" />
    </div>
  )
}

interface ProjectPickerDialogProps {
  open: boolean
  selected: Set<string>
  sources: ProjectSource[]
  onConfirm: (selected: Set<string>) => void
  onClose: () => void
}

function ProjectPickerDialog({
  open,
  selected,
  sources,
  onConfirm,
  onClose,
}: ProjectPickerDialogProps) {
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set())
  const [activeApp, setActiveApp] = useState<AppName | 'all'>('all')

  // biome-ignore lint/correctness/useExhaustiveDependencies: only sync on open-transition, not on every selected change
  useEffect(() => {
    if (open) {
      setLocalSelected(new Set(selected))
      setActiveApp('all')
    }
  }, [open])

  function toggle(key: string) {
    setLocalSelected((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const visibleSources = activeApp === 'all' ? sources : sources.filter((s) => s.app === activeApp)

  const allLoaded = sources.every((s) => !s.isLoading)
  const allEmpty = allLoaded && sources.every((s) => s.projects.length === 0 && !s.isError)

  const hasAnyContent = visibleSources.some(
    (s) => s.isLoading || s.isError || s.projects.length > 0
  )

  return (
    <Dialog
      open={open}
      label="Select Projects"
      onWaHide={onClose}
      style={{ '--width': '560px' } as React.CSSProperties}
    >
      <div className="flex flex-wrap gap-xs">
        <Button
          type="button"
          size="small"
          appearance={activeApp === 'all' ? 'filled' : 'outlined'}
          onClick={() => setActiveApp('all')}
        >
          All
        </Button>
        {sources
          .filter((s) => s.isLoading || s.projects.length > 0)
          .map((s) => (
            <Button
              key={s.app}
              type="button"
              size="small"
              appearance={activeApp === s.app ? 'filled' : 'outlined'}
              onClick={() => setActiveApp(s.app)}
            >
              {s.label}
            </Button>
          ))}
      </div>

      <div className="overflow-y-auto max-h-[50vh] flex flex-col gap-md mt-md">
        {allEmpty ? (
          <p className="text-sm text-hot-gray-400">You have no projects in any connected tool.</p>
        ) : !hasAnyContent ? (
          <p className="text-sm text-hot-gray-400">
            No {APP_LABELS[activeApp as AppName]} projects found.{' '}
            <button
              type="button"
              className="underline hover:text-hot-gray-600"
              onClick={() => setActiveApp('all')}
            >
              All apps
            </button>
          </p>
        ) : (
          visibleSources.map((source) => {
            if (!source.isLoading && !source.isError && source.projects.length === 0) return null

            return (
              <div key={source.app}>
                <p className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide mb-xs">
                  {source.label}
                  {source.isLoading && (
                    <span className="ml-xs font-normal normal-case tracking-normal text-hot-gray-400">
                      {' '}
                      — loading…
                    </span>
                  )}
                </p>
                {source.isError ? (
                  <p className="text-sm text-hot-gray-400">
                    Could not load {source.label} projects.
                  </p>
                ) : source.isLoading ? (
                  <div className="flex flex-col gap-xs">
                    <CheckboxSkeleton />
                    <CheckboxSkeleton />
                    <CheckboxSkeleton />
                  </div>
                ) : (
                  <div className="flex flex-col gap-xs">
                    {source.projects.map((p) => {
                      const key = projectKey(p.app, p.project_id)
                      return (
                        <Checkbox
                          key={key}
                          checked={localSelected.has(key)}
                          onChange={() => toggle(key)}
                        >
                          {p.title}
                        </Checkbox>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div slot="footer" className="flex gap-sm justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          Cancel
        </button>
        <Button
          type="button"
          onClick={() => {
            onConfirm(localSelected)
            onClose()
          }}
        >
          Done{localSelected.size > 0 ? ` (${localSelected.size})` : ''}
        </Button>
      </div>
    </Dialog>
  )
}

export default ProjectPickerDialog
