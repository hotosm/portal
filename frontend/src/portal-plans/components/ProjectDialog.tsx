import { toast } from "sonner";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import { m } from "../../paraglide/messages";
import { APP_META } from "../../utils/appMeta";
import type { HydratedProjectItem } from "../types";

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  href: string;
  project: HydratedProjectItem;
  onDelete?: () => void;
}

function extractMeta(upstream: Record<string, unknown> | null) {
  if (!upstream) return { createdAt: null, author: null };

  const rawDate = upstream.created_at ?? upstream.created ?? upstream.uploaded_at;
  const createdAt =
    typeof rawDate === "string" && rawDate
      ? new Date(rawDate).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  const userObj = upstream.user as Record<string, unknown> | null | undefined;
  const rawAuthor =
    upstream.author_name ??
    upstream.author ??
    userObj?.username ??
    upstream.organisationName ??
    upstream.provider;
  const author = typeof rawAuthor === "string" && rawAuthor ? rawAuthor : null;

  return { createdAt, author };
}

function ProjectDialog({
  open,
  onClose,
  title,
  href,
  project,
  onDelete,
}: ProjectDialogProps) {
  const meta = APP_META[project.app];
  const { createdAt, author } = extractMeta(project.upstream);

  return (
    <Dialog open={open} label={title} onWaHide={onClose}>
      <div className="flex flex-col gap-md">
        <div className="flex items-center gap-sm text-sm text-hot-gray-600">
          <img src={meta.icon} alt={meta.name} className="w-5 h-5" />
          <span>{meta.name}</span>
        </div>

        {(author || createdAt) && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-md gap-y-xs text-sm">
            {author && (
              <>
                <dt className="text-hot-gray-500">Author</dt>
                <dd className="text-hot-gray-800">{author}</dd>
              </>
            )}
            {createdAt && (
              <>
                <dt className="text-hot-gray-500">Created</dt>
                <dd className="text-hot-gray-800">{createdAt}</dd>
              </>
            )}
          </dl>
        )}
      </div>

      <div slot="footer" className="flex gap-sm justify-end">
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
              toast.success(m.plan_toast_project_removed());
            }}
            className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
          >
            Delete
          </button>
        )}
        <Button href={href} target="_blank" rel="noopener noreferrer">
          Open Project
        </Button>
      </div>
    </Dialog>
  );
}

export default ProjectDialog;
