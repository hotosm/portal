import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Button from '../../components/shared/Button'
import Dialog from '../../components/shared/Dialog'
import { m } from '../../paraglide/messages'
import { useAddProjectByUrl } from '../hooks/useAddProjectByUrl'
import type { ProjectPickerDialogProps } from '../types'
import { AddByUrlSection } from './AddByUrlSection'

type Tab = 'projects' | 'tasks'

const TABS: Tab[] = ['projects', 'tasks']

function ProjectPickerDialog({
  open,
  existingKeys,
  onAddProject,
  onAddTask,
  onClose,
}: ProjectPickerDialogProps) {
  const [tab, setTab] = useState<Tab>('projects')
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
    onAddTask(title)
    toast.success(m.plan_toast_task_added())
    onClose()
  }

  return (
    <Dialog
      open={open}
      label={m.plan_picker_label()}
      onWaHide={onClose}
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
