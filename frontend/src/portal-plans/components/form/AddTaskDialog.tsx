import { useEffect, useState } from "react";
import Button from "../../../components/shared/Button";
import Dialog from "../../../components/shared/Dialog";
import { m } from "../../../paraglide/messages";
import { APP_META } from "../../../utils/appMeta";
import type { AppName } from "../../types";

interface AddTaskDialogProps {
  open: boolean;
  onConfirm: (title: string, tool: AppName) => void;
  onClose: () => void;
}

function AddTaskDialog({ open, onConfirm, onClose }: AddTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [tool, setTool] = useState<AppName>("drone-tasking-manager");

  useEffect(() => {
    if (open) {
      setTitle("");
      setTool("drone-tasking-manager");
    }
  }, [open]);

  function handleConfirm() {
    if (!title.trim()) return;
    onConfirm(title.trim(), tool);
    onClose();
  }

  return (
    <Dialog
      open={open}
      label="Add task"
      onWaHide={onClose}
      style={{ "--width": "400px" } as React.CSSProperties}
    >
      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <label className="text-sm font-medium text-hot-gray-700">
            Title <span className="text-hot-red-600">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            placeholder="Describe the task"
            autoFocus
            className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
          />
        </div>
        <div className="flex flex-col gap-xs">
          <label className="text-sm font-medium text-hot-gray-700">Tool</label>
          <select
            value={tool}
            onChange={(e) => setTool(e.target.value as AppName)}
            className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500 bg-white"
          >
            {(Object.keys(APP_META) as AppName[]).map((app) => (
              <option key={app} value={app}>
                {APP_META[app].label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div slot="footer" className="flex gap-sm justify-end">
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
        >
          {m.plan_cancel()}
        </button>
        <Button type="button" disabled={!title.trim()} onClick={handleConfirm}>
          Add task
        </Button>
      </div>
    </Dialog>
  );
}

export default AddTaskDialog;
