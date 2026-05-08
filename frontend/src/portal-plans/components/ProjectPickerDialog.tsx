import { useEffect, useState } from 'react'
import Button from '../../components/shared/Button'
import Checkbox from '../../components/shared/Checkbox'
import Dialog from '../../components/shared/Dialog'
import { m } from '../../paraglide/messages'
import { APP_LABELS } from '../hooks'
import type { ProjectOption, ProjectSource } from '../hooks'
import { useResolveProjectUrl } from '../hooks/usePlans'
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
  extraProjects: ProjectOption[]
  sources: ProjectSource[]
  onConfirm: (selected: Set<string>, extraProjects: ProjectOption[]) => void
  onClose: () => void
}

function ProjectPickerDialog({
  open,
  selected,
  extraProjects,
  sources,
  onConfirm,
  onClose,
}: ProjectPickerDialogProps) {
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set())
  const [localExtraProjects, setLocalExtraProjects] = useState<ProjectOption[]>([])
  const [listKey, setListKey] = useState(0)
  const [activeApp, setActiveApp] = useState<AppName | 'all'>('all')
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const resolveUrl = useResolveProjectUrl()

  // biome-ignore lint/correctness/useExhaustiveDependencies: only sync on open-transition, not on every selected change
  useEffect(() => {
    if (open) {
      setLocalSelected(new Set(selected))
      setLocalExtraProjects(extraProjects)
      setActiveApp('all')
      setUrlInput('')
      setUrlError(null)
    }
  }, [open])

  function toggle(key: string) {
    setLocalSelected((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function handleAddUrl() {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    setUrlError(null)
    try {
      const result = await resolveUrl.mutateAsync(trimmed)
      const key = projectKey(result.app, result.project_id)
      if (localSelected.has(key)) {
        setUrlError('This project is already in your selection.')
        return
      }
      let resolvedUpstream = result.upstream
      if (result.app === "chatmap" && !resolvedUpstream) {
        try {
          const r = await fetch(
            `https://chatmap.hotosm.org/api/v1/map/${result.project_id}`,
            { credentials: "include", headers: { accept: "application/json" } },
          )
          if (r.ok) {
            const d = await r.json()
            if (d?.name) resolvedUpstream = { name: d.name, id: d.id ?? result.project_id }
          }
        } catch {
          // CORS or network error — fall back to UUID title
        }
      }
      if (result.app === 'chatmap' && !resolvedUpstream) {
        setUrlError('This ChatMap project is private. Only public maps or your own private maps can be added.')
        return
      }

      const upstream = resolvedUpstream ?? {}
      const title =
        (upstream.name as string | undefined) ??
        (upstream.title as string | undefined) ??
        result.project_id
      setLocalExtraProjects((prev) => [
        ...prev,
        { app: result.app, project_id: result.project_id, title, upstream: resolvedUpstream },
      ])
      setLocalSelected((prev) => new Set(prev).add(key))
      setListKey((k) => k + 1)
      setUrlInput('')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      if (msg.includes('project_not_found')) {
        setUrlError('Project not found. Check the URL.')
      } else if (msg.includes('upstream_unavailable')) {
        setUrlError('Could not reach the service. Try again later.')
      } else {
        setUrlError(
          'URL not recognized. Supported: Tasking Manager, Drone TM, Field TM, fAIr, OAM, Export Tool, uMap.',
        )
      }
    }
  }

  const sourceApps = new Set(sources.map((s) => s.app))
  const allSources: ProjectSource[] = [
    ...sources,
    ...[...new Set(localExtraProjects.map((p) => p.app).filter((a) => !sourceApps.has(a)))].map(
      (app) => ({ app, label: APP_LABELS[app], projects: [], isLoading: false, isError: false }),
    ),
  ]

  const visibleSources = activeApp === 'all' ? allSources : allSources.filter((s) => s.app === activeApp)

  const allLoaded = allSources.every((s) => !s.isLoading)
  const allEmpty =
    allLoaded &&
    allSources.every((s) => s.projects.length === 0 && !s.isError) &&
    localExtraProjects.length === 0

  const hasAnyContent = visibleSources.some(
    (s) => s.isLoading || s.isError || s.projects.length > 0 || localExtraProjects.some((p) => p.app === s.app),
  )

  return (
    <Dialog
      open={open}
      label={m.plan_picker_label()}
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
          {m.plan_picker_all()}
        </Button>
        {allSources
          .filter((s) => s.isLoading || s.projects.length > 0 || localExtraProjects.some((p) => p.app === s.app))
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

      <div key={listKey} className="overflow-y-auto max-h-[50vh] flex flex-col gap-md mt-md">
        {allEmpty ? (
          <p className="text-sm text-hot-gray-400">{m.plan_picker_no_projects()}</p>
        ) : !hasAnyContent ? (
          <p className="text-sm text-hot-gray-400">
            {APP_LABELS[activeApp as AppName]} — {m.plan_picker_no_app_projects()}{' '}
            <button
              type="button"
              className="underline hover:text-hot-gray-600"
              onClick={() => setActiveApp('all')}
            >
              {m.plan_picker_all_apps()}
            </button>
          </p>
        ) : (
          allSources.map((source) => {
            const extras = localExtraProjects.filter((p) => p.app === source.app)
            if (!source.isLoading && !source.isError && source.projects.length === 0 && extras.length === 0) return null
            const hidden = activeApp !== 'all' && source.app !== activeApp

            return (
              <div key={source.app} className={hidden ? 'hidden' : undefined}>
                <p className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide mb-xs">
                  {source.label}
                  {source.isLoading && (
                    <span className="ml-xs font-normal normal-case tracking-normal text-hot-gray-400">
                      {' '}
                      {m.plan_picker_loading()}
                    </span>
                  )}
                </p>
                {source.isError ? (
                  <p className="text-sm text-hot-gray-400">
                    {source.label} — {m.plan_picker_error()}
                  </p>
                ) : source.isLoading ? (
                  <div className="flex flex-col gap-xs">
                    <CheckboxSkeleton />
                    <CheckboxSkeleton />
                    <CheckboxSkeleton />
                  </div>
                ) : (
                  <div className="flex flex-col gap-xs">
                    {[...source.projects, ...extras].map((p) => {
                      const key = projectKey(p.app, p.project_id)
                      const isChecked = localSelected.has(key)
                      return (
                        <Checkbox
                          key={key}
                          checked={isChecked}
                          defaultChecked={isChecked}
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

      <div className="border-t border-hot-gray-200 pt-md mt-md flex flex-col gap-xs">
        <p className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide">
          Add by URL
        </p>
        <div className="flex gap-xs">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => {
              setUrlInput(e.target.value)
              setUrlError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddUrl()
              }
            }}
            placeholder="https://tasks.hotosm.org/projects/123"
            className="flex-1 border border-hot-gray-300 rounded-lg px-sm py-xs text-sm outline-none focus:border-hot-red-500"
          />
          <Button
            type="button"
            size="small"
            disabled={!urlInput.trim() || resolveUrl.isPending}
            onClick={handleAddUrl}
          >
            {resolveUrl.isPending ? 'Checking…' : 'Add'}
          </Button>
        </div>
        {urlError && <p className="text-xs text-hot-red-600">{urlError}</p>}
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
          onClick={() => {
            onConfirm(localSelected, localExtraProjects)
            onClose()
          }}
        >
          {m.plan_picker_done()}{localSelected.size > 0 ? ` (${localSelected.size})` : ''}
        </Button>
      </div>
    </Dialog>
  )
}

export default ProjectPickerDialog
