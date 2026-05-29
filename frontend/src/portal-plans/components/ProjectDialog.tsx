import { useEffect, useState } from "react";
import { toast } from "sonner";
import placeholder from "../../assets/images/placeholder.png";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import Dropdown from "../../components/shared/Dropdown";
import DropdownItem from "../../components/shared/DropdownItem";
import boxArrowUpRight from "../../assets/icons/box-arrow-up-right.svg";
import Icon from "../../components/shared/Icon";
import Tag from "../../components/shared/Tag";
import { m } from "../../paraglide/messages";
import { APP_META } from "../../utils/appMeta";
import { formatProjectStatus } from "../../utils/utils";
import type { HydratedProjectItem, ProjectStatus } from "../types";

const STATUS_OPTIONS: ProjectStatus[] = ["pending", "in_progress", "done"];

function statusVariant(status: ProjectStatus): "neutral" | "success" {
  return status === "done" ? "success" : "neutral";
}

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  href: string;
  project: HydratedProjectItem;
  imageUrl?: string;
  onDelete?: () => void;
  onStatusChange?: (status: ProjectStatus) => void;
  initialStatus?: ProjectStatus;
}

function extractMeta(upstream: Record<string, unknown> | null) {
  if (!upstream) return { createdAt: null, author: null };

  const rawDate =
    upstream.created_at ?? upstream.created ?? upstream.uploaded_at;
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
  imageUrl,
  onDelete,
  onStatusChange,
  initialStatus,
}: ProjectDialogProps) {
  const meta = APP_META[project.app];
  const { createdAt, author } = extractMeta(project.upstream);
  const [localStatus, setLocalStatus] = useState<ProjectStatus>(initialStatus ?? project.status);

  useEffect(() => {
    setLocalStatus(initialStatus ?? project.status);
  }, [initialStatus, project.status]);

  function handleStatusSelect(event: CustomEvent) {
    const status = event.detail.item.value as ProjectStatus;
    setLocalStatus(status);
    onStatusChange?.(status);
  }

  return (
    <Dialog open={open} label={title} onWaHide={onClose}>
      <div className="flex flex-col gap-md">
        <img
          src={imageUrl ?? placeholder}
          alt={title}
          className="w-full h-40 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm text-sm text-hot-gray-600">
            <img src={meta.icon} alt={meta.name} className="w-5 h-5" />
            <span>{meta.name}</span>
          </div>

          {onStatusChange ? (
            <Dropdown onSelect={handleStatusSelect}>
              <Tag
                slot="trigger"
                variant={statusVariant(localStatus)}
                className="cursor-pointer"
              >
                {formatProjectStatus(localStatus)} ▾
              </Tag>
              {STATUS_OPTIONS.map((s) => (
                <DropdownItem key={s} value={s}>
                  {formatProjectStatus(s)}
                </DropdownItem>
              ))}
            </Dropdown>
          ) : (
            <Tag variant={statusVariant(localStatus)}>
              {formatProjectStatus(localStatus)}
            </Tag>
          )}
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

      <div slot="footer" className="flex gap-sm justify-between w-full">
        {onDelete && (
          <Button
            variant="danger"
            appearance="outlined"
            onClick={() => {
              onDelete();
              onClose();
              toast.success(m.plan_toast_project_removed());
            }}
          >
            Remove from plan
          </Button>
        )}
        <Button href={href} target="_blank" rel="noopener noreferrer">
          Open Project
          <Icon slot="end" src={boxArrowUpRight} label="Opens in new tab" />
        </Button>
      </div>
    </Dialog>
  );
}

export default ProjectDialog;
