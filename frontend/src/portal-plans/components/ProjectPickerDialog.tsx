import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Button from '../../components/shared/Button'
import Dialog from '../../components/shared/Dialog'
import { Tab, TabGroup, TabPanel } from '../../components/shared/Tabs'
import { m } from '../../paraglide/messages'
import { useAddProjectByUrl } from '../hooks/useAddProjectByUrl'
import type { ProjectPickerDialogProps } from '../types'
import { AddByUrlSection } from './AddByUrlSection'
import SketchmapNameStep from './SketchmapNameStep'

type PickerTab = 'projects' | 'tasks'

function ProjectPickerDialog({
  open,
  existingKeys,
  onAddProject,
  onAddTask,
  onClose,
}: ProjectPickerDialogProps) {
  const [tab, setTab] = useState<PickerTab>('projects')
  const [taskTitle, setTaskTitle] = useState('')
  const [sketchmapName, setSketchmapName] = useState('')
  const {
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isPending,
    handleAddUrl,
    pendingSketchmap,
    cancelSketchmapAdd,
    confirmSketchmapAdd,
  } = useAddProjectByUrl()

  useEffect(() => {
    if (!open) return
    setTab('projects')
    setTaskTitle('')
    setSketchmapName('')
    setUrlInput('')
    setUrlError(null)
    cancelSketchmapAdd()
    // cancelSketchmapAdd is stable across renders (useState setter), safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function confirmSketchmap() {
    confirmSketchmapAdd(sketchmapName, {
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
      <TabGroup
        active={tab}
        onWaTabShow={(e) => setTab(e.detail.name as PickerTab)}
        className="wa-tabs-equal-height wa-tabs-compact"
      >
        <Tab panel="projects">{m.plan_picker_tab_projects()}</Tab>
        <Tab panel="tasks">{m.plan_picker_tab_tasks()}</Tab>

        <TabPanel name="projects">
          {pendingSketchmap ? (
            <SketchmapNameStep
              app={pendingSketchmap.app}
              projectId={pendingSketchmap.project_id}
              value={sketchmapName}
              onChange={setSketchmapName}
              onConfirm={confirmSketchmap}
              onBack={() => {
                setSketchmapName('')
                cancelSketchmapAdd()
              }}
            />
          ) : (
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
          )}
        </TabPanel>

        <TabPanel name="tasks">
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
        </TabPanel>
      </TabGroup>
    </Dialog>
  )
}

export default ProjectPickerDialog
