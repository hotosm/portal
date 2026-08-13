import { useEffect, useState } from "react";
import { toast } from "sonner";
import placeholder from "../../assets/images/placeholder.png";
import Button from "../../components/shared/Button";
import Dialog from "../../components/shared/Dialog";
import Dropdown from "../../components/shared/Dropdown";
import DropdownItem from "../../components/shared/DropdownItem";
import boxArrowUpRight from "../../assets/icons/box-arrow-up-right.svg";
import starFill from "../../assets/icons/star-fill.svg";
import starOutline from "../../assets/icons/star.svg";
import Icon from "../../components/shared/Icon";
import Spinner from "../../components/shared/Spinner";
import Tag from "../../components/shared/Tag";
import { m } from "../../paraglide/messages";
import { APP_META } from "../../utils/appMeta";
import { formatProjectStatus } from "../../utils/utils";
import { useCollections, useSetProjectCollections } from "../hooks";
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
  onFeaturedChange?: (featured: boolean) => void | Promise<void>;
  /**
   * Plan the project is being viewed in. Set it to offer collection assignment;
   * leave it out for read-only views, like the other edit affordances here.
   */
  planId?: string;
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
  onFeaturedChange,
  planId,
}: ProjectDialogProps) {
  const meta = APP_META[project.app];
  const { createdAt, author } = extractMeta(project.upstream);
  const [localStatus, setLocalStatus] = useState<ProjectStatus>(initialStatus ?? project.status);

  const { data: collections = [] } = useCollections();
  const setCollections = useSetProjectCollections(planId ?? "");
  // Wire name: `groups` is the collections the project already belongs to.
  const assigned = new Set(project.groups.map((c) => c.id));

  useEffect(() => {
    setLocalStatus(initialStatus ?? project.status);
  }, [initialStatus, project.status]);

  function handleStatusSelect(event: CustomEvent) {
    const status = event.detail.item.value as ProjectStatus;
    setLocalStatus(status);
    onStatusChange?.(status);
  }

  // The endpoint replaces the whole set, so picking a collection means sending
  // the current ids with that one added — or removed, if it was already there.
  function handleCollectionSelect(event: CustomEvent) {
    const id = event.detail.item.value as string | undefined;
    if (!id) return;
    const next = assigned.has(id)
      ? [...assigned].filter((c) => c !== id)
      : [...assigned, id];
    setCollections.mutate(
      { planProjectId: project.id, collectionIds: next },
      { onSuccess: () => toast.success(m.plan_toast_project_collections_saved()) },
    );
  }

  async function handleFeaturedChange() {
    const next = !project.featured;
    try {
      await onFeaturedChange?.(next);
      toast.success(next ? m.plan_toast_project_featured() : m.plan_toast_project_unfeatured());
    } catch {
      toast.error(m.plan_toast_featured_error());
    }
  }

  return (
    <Dialog open={open} label=" " aria-label={title} onWaHide={onClose}>
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between gap-sm">
          <h4>{title}</h4>
          {onFeaturedChange ? (
            <button
              type="button"
              onClick={handleFeaturedChange}
              title={project.featured ? "Remove from featured" : "Mark as featured"}
              className={`shrink-0 leading-none transition-colors ${project.featured ? "text-hot-yellow-600" : "text-hot-gray-300 hover:text-hot-gray-500"}`}
            >
              <Icon src={project.featured ? starFill : starOutline} label={project.featured ? "Remove from featured" : "Mark as featured"} />
            </button>
          ) : project.featured ? (
            <span className="shrink-0 leading-none text-hot-yellow-600">
              <Icon src={starFill} label="Featured" />
            </span>
          ) : null}
        </div>

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

        {planId && (
          <div className="flex flex-col gap-xs">
            <span className="text-xs font-medium text-hot-gray-500 uppercase tracking-wide">
              {m.plan_collections_assign_collections_label()}
            </span>
            <div className="flex items-center gap-xs flex-wrap">
              {project.groups.map((collection) => (
                <Tag
                  key={collection.id}
                  variant="brand"
                  appearance="filled"
                  size="small"
                >
                  {collection.name}
                </Tag>
              ))}
              <Dropdown onSelect={handleCollectionSelect}>
                <Tag
                  slot="trigger"
                  variant="neutral"
                  appearance="outlined"
                  size="small"
                  className="cursor-pointer"
                >
                  {m.plan_project_add_to_collection()} ▾
                </Tag>
                {collections.length === 0 ? (
                  <DropdownItem disabled>
                    {m.plan_collections_empty_collections()}
                  </DropdownItem>
                ) : (
                  collections.map((collection) => (
                    <DropdownItem
                      key={collection.id}
                      value={collection.id}
                      type="checkbox"
                      checked={assigned.has(collection.id)}
                    >
                      {collection.name}
                    </DropdownItem>
                  ))
                )}
              </Dropdown>
              {setCollections.isPending && <Spinner />}
            </div>
          </div>
        )}

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
