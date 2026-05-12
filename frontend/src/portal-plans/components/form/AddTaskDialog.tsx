import { useEffect, useRef, useState } from "react";
import Button from "../../../components/shared/Button";
import Dialog from "../../../components/shared/Dialog";
import Dropdown from "../../../components/shared/Dropdown";
import DropdownItem from "../../../components/shared/DropdownItem";
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
  const [tool, setTool] = useState<AppName | "">("");
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = dropdownWrapperRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("wa-hide", stop);
    return () => el.removeEventListener("wa-hide", stop);
  }, []);

  useEffect(() => {
    if (open) {
      setTitle("");
      setTool("");
    }
  }, [open]);

  function handleConfirm() {
    if (!title.trim() || !tool) return;
    onConfirm(title.trim(), tool as AppName);
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
          <label className="text-sm font-medium text-hot-gray-700">
            Tool <span className="text-hot-red-600">*</span>
          </label>
          <div ref={dropdownWrapperRef}>
          <Dropdown
            onSelect={(e: CustomEvent) => setTool(e.detail.item.value as AppName)}
          >
            <button
              slot="trigger"
              type="button"
              className="w-full flex justify-between items-center border border-hot-gray-300 rounded-lg px-md py-sm text-base bg-white focus:border-hot-red-500 focus:outline-none"
            >
              <span className={tool ? "text-hot-gray-900" : "text-hot-gray-400"}>
                {tool ? APP_META[tool].name : "Select tool"}
              </span>
              <span className="text-hot-gray-400">&#x25BE;</span>
            </button>
            {(Object.keys(APP_META) as AppName[]).map((app) => (
              <DropdownItem key={app} value={app}>
                {APP_META[app].name}
              </DropdownItem>
            ))}
          </Dropdown>
          </div>
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
        <Button
          type="button"
          disabled={!title.trim() || !tool}
          onClick={handleConfirm}
        >
          Add task
        </Button>
      </div>
    </Dialog>
  );
}

export default AddTaskDialog;
