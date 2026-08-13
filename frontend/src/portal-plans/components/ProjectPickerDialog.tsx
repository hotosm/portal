import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Button from '../../components/shared/Button'
import Dialog from '../../components/shared/Dialog'
import Option from '../../components/shared/Option'
import Select from '../../components/shared/Select'
import { m } from '../../paraglide/messages'
import { APP_LABELS } from '../hooks'
import { useAddProjectByUrl } from '../hooks/useAddProjectByUrl'
import type { AppName, ProjectPickerDialogProps } from '../types'
import { AddByUrlSection } from './AddByUrlSection'

type Tab = 'projects' | 'tasks'

const TABS: Tab[] = ['projects', 'tasks']

/** Tools a to-do can be filed under, alphabetical by label. */
const TASK_APPS = (Object.keys(APP_LABELS) as AppName[]).sort((a, b) =>
  APP_LABELS[a].localeCompare(APP_LABELS[b])
)

const DEFAULT_TASK_APP: AppName = 'tasking-manager'

/** Read the selected value from a Web Awesome `<wa-select>` change event. */
function selectValue(event: unknown): string {
  return (event as { target: { value?: string } }).target?.value ?? ''
}

function ProjectPickerDialog({
  open,
  existingKeys,
  onAddProject,
  onAddTask,
  onClose,
}: ProjectPickerDialogProps) {
  const [tab, setTab] = useState<Tab>('projects')
  const [taskApp, setTaskApp] = useState<AppName>(DEFAULT_TASK_APP)
  const [taskTitle, setTaskTitle] = useState('')
  const { urlInput, setUrlInput, urlError, setUrlError, isPending, handleAddUrl } =
    useAddProjectByUrl()

  useEffect(() => {
    if (!open) return
    setTab('projects')
    setTaskTitle('')
    setUrlInput('')
    setUrlError(null)
  }, [open, setUrlInput, setUrlError])

  function addProject() {
    handleAddUrl({
      localSelected: existingKeys,
      onAdded: (project) => {
        onAddProject(project)
        toast.success(m.plan_toast_project_added())
        onClose()
      },
    })
  }

  function addTask() {
    const title = taskTitle.trim()
    if (!title) return
    onAddTask({ app: taskApp, title })
    toast.success(m.plan_toast_task_added())
    onClose()
  }

  return (
    <Dialog
      open={open}
      label={m.plan_picker_label()}
      // Only close on the dialog's own wa-hide — the inner wa-select bubbles
      // wa-hide when its dropdown closes, which would otherwise close us too.
      onWaHide={(e: Event) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onWaRequestClose={(e: Event) => {
        if (isPending) e.preventDefault()
      }}
      style={{ '--width': '480px' } as React.CSSProperties}
    >
      <div role="tablist" className="flex gap-xs mb-md">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-2xl px-sm py-0 text-sm font-semibold transition-colors ${
              tab === t
                ? 'bg-hot-neutral-800 text-white'
                : 'text-hot-neutral-800 hover:bg-hot-gray-100'
            }`}
          >
            {t === 'projects' ? m.plan_picker_tab_projects() : m.plan_picker_tab_tasks()}
          </button>
        ))}
      </div>

      {tab === 'projects' ? (
        <AddByUrlSection
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          urlError={urlError}
          setUrlError={setUrlError}
          isPending={isPending}
          onAdd={addProject}
          description={m.plan_picker_url_help()}
          divider={false}
        />
      ) : (
        <div className="flex flex-col gap-xs">
          <span className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide">
            {m.plan_picker_task_heading()}
          </span>
          <p className="text-xs text-hot-gray-400">{m.plan_picker_task_help()}</p>
          <Select
            size="small"
            value={taskApp}
            onChange={(e) => setTaskApp(selectValue(e) as AppName)}
            aria-label={m.plan_picker_task_tool_label()}
          >
            {TASK_APPS.map((app) => (
              <Option key={app} value={app}>
                {APP_LABELS[app]}
              </Option>
            ))}
          </Select>
          <div className="flex gap-xs">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTask()
                }
              }}
              placeholder={m.plan_picker_task_placeholder()}
              className="flex-1 border border-hot-gray-300 rounded-lg px-sm py-xs text-sm outline-none focus:border-hot-red-500"
            />
            <Button type="button" size="small" disabled={!taskTitle.trim()} onClick={addTask}>
              {m.plan_picker_task_create()}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  )
}

export default ProjectPickerDialog
