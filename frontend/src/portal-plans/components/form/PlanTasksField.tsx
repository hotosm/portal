import { useState } from "react";
import Button from "../../../components/shared/Button";
import type { AppName } from "../../types";
import AddTaskDialog from "./AddTaskDialog";

interface PlanTasksFieldProps {
  onTaskAdded: (title: string, tool: AppName) => void;
}

function PlanTasksField({ onTaskAdded }: PlanTasksFieldProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-sm">
      <span className="text-sm font-medium text-hot-gray-700">Tasks</span>
      <Button
        type="button"
        appearance="outlined"
        onClick={() => setDialogOpen(true)}
      >
        Add task
      </Button>
      <AddTaskDialog
        open={dialogOpen}
        onConfirm={onTaskAdded}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}

export default PlanTasksField;
