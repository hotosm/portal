import Button from "../../components/shared/Button";
import Checkbox from "../../components/shared/Checkbox";
import Dialog from "../../components/shared/Dialog";
import { APP_LABELS } from "../hooks";
import { useLinkProject } from "../hooks/useLinkProject";
import { AddByUrlSection } from "./AddByUrlSection";
import type { AppName, ProjectOption } from "../types";

interface SelectProjectDialogProps {
  open: boolean;
  app: AppName;
  onClose: () => void;
  onDelete?: () => void;
  onConfirm: (project: ProjectOption) => void;
}

function LinkProjectDialog({
  open,
  app,
  onClose,
  onDelete,
  onConfirm,
}: SelectProjectDialogProps) {
  const {
    selected,
    setSelected,
    allProjects,
    isLoading,
    isError,
    urlInput,
    setUrlInput,
    urlError,
    setUrlError,
    isPending,
    handleAddUrl,
  } = useLinkProject({ open, app });

  return (
    <Dialog
      open={open}
      label="Link project"
      onWaHide={onClose}
      style={{ "--width": "480px" } as React.CSSProperties}
    >
      <p>{`Is this project already created in ${APP_LABELS[app]}? Select it from the list.`}</p>
      <div className="overflow-y-auto max-h-[50vh] flex flex-col gap-xs">
        {isLoading && allProjects.length === 0 ? (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 bg-hot-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </>
        ) : isError && allProjects.length === 0 ? (
          <p className="text-sm text-hot-gray-400">Failed to load projects.</p>
        ) : allProjects.length === 0 ? (
          <p className="text-sm text-hot-gray-400">
            No projects found. Add one by URL below.
          </p>
        ) : (
          allProjects.map((p) => (
            <Checkbox
              key={p.project_id}
              checked={selected?.project_id === p.project_id}
              onChange={() =>
                setSelected((prev) =>
                  prev?.project_id === p.project_id ? null : p,
                )
              }
            >
              {p.title}
            </Checkbox>
          ))
        )}
      </div>

      <AddByUrlSection
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        urlError={urlError}
        setUrlError={setUrlError}
        isPending={isPending}
        onAdd={handleAddUrl}
      />

      <div slot="footer" className="flex gap-sm justify-between w-full">
        <Button
          appearance="outlined"
          variant="danger"
          onClick={() => {
            onDelete?.();
            onClose();
          }}
        >
          Delete
        </Button>
        <Button
          type="button"
          disabled={!selected}
          onClick={() => {
            if (selected) {
              onConfirm(selected);
              onClose();
            }
          }}
        >
          Link
        </Button>
      </div>
    </Dialog>
  );
}

export default LinkProjectDialog;
