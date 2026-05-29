import { useEffect, useState } from "react";
import placeholder from "../../assets/images/placeholder.png";
import Dropdown from "../../components/shared/Dropdown";
import ProjectDialog from "./ProjectDialog";
import DropdownItem from "../../components/shared/DropdownItem";
import Tag from "../../components/shared/Tag";
import { APP_META } from "../../utils/appMeta";
import {
  getChatMapBaseUrl,
  getDroneTmBaseUrl,
  getExportToolBaseUrl,
  getFairBaseUrl,
  getFieldTmBaseUrl,
  getUmapBaseUrl,
} from "../../utils/envConfig";
import { osmTileUrl } from "../../utils/osmTiles";
import { formatProjectStatus } from "../../utils/utils";
import type { AppName, HydratedProjectItem, ProjectStatus } from "../types";

const STATUS_OPTIONS: ProjectStatus[] = ["pending", "in_progress", "done"];

function statusVariant(status: ProjectStatus): "neutral" | "success" {
  return status === "done" ? "success" : "neutral";
}

function resolveTitle(
  upstream: Record<string, unknown> | null,
  projectId: string,
  data: Record<string, unknown> | null,
): string {
  const src = upstream ?? data;
  if (!src) return projectId;
  const t = src.name ?? src.title ?? src.project_name;
  return typeof t === "string" && t ? t : projectId;
}

function resolveImageUrl(
  app: AppName,
  upstream: Record<string, unknown> | null,
  data: Record<string, unknown> | null,
): string {
  if (app === "chatmap" || app === "umap") {
    const centroid = (upstream?.centroid ?? data?.centroid) as
      | [number, number]
      | null
      | undefined;
    if (Array.isArray(centroid) && centroid.length === 2) {
      return osmTileUrl(centroid[0], centroid[1], 10);
    }
  }

  if (app === "tasking-manager") {
    const src = upstream ?? data;
    const bbox = src?.aoiBBOX as
      | [number, number, number, number]
      | null
      | undefined;
    if (Array.isArray(bbox) && bbox.length === 4) {
      const lat = (bbox[1] + bbox[3]) / 2;
      const lon = (bbox[0] + bbox[2]) / 2;
      return osmTileUrl(lat, lon, 10);
    }
  }

  const src = upstream ?? data;
  if (!src) return placeholder;
  const img = src.image_url ?? src.thumbnail_url ?? src.thumbnail ?? src.image;
  return typeof img === "string" && img ? img : placeholder;
}

function resolveHref(
  app: AppName,
  projectId: string,
  upstream: Record<string, unknown> | null,
  data: Record<string, unknown> | null,
): string {
  switch (app) {
    case 'tasking-manager':
      return `https://tasks.hotosm.org/projects/${projectId}`
    case 'drone-tasking-manager':
      return `${getDroneTmBaseUrl()}/projects/${projectId}`
    case 'field-tm': {
      const base = (data?.base_url ?? upstream?.base_url ?? getFieldTmBaseUrl()) as string
      return `${base}/projects/${projectId}`
    }
    case 'fair':
      return `${getFairBaseUrl()}/ai-models/${projectId}`
    case 'export-tool':
      return `${getExportToolBaseUrl()}/v3/exports/${projectId}`
    case 'open-aerial-map': {
      const bbox = (upstream?.bbox ?? data?.bbox) as
        | [number, number, number, number]
        | null
        | undefined;
      if (Array.isArray(bbox) && bbox.length === 4) {
        const lng = ((bbox[0] as number) + (bbox[2] as number)) / 2;
        const lat = ((bbox[1] as number) + (bbox[3] as number)) / 2;
        return `https://map.openaerialmap.org/#/${lng},${lat},14/latest/${projectId}`;
      }
      return `https://map.openaerialmap.org`;
    }
    case "umap": {
      const href = (upstream?.href ?? data?.href) as string | null | undefined;
      return href ?? `${getUmapBaseUrl()}/m/${projectId}/`;
    }
    case "chatmap":
      return `${getChatMapBaseUrl()}/#map/${projectId}`;
  }
}

function usePlanProjectDisplay(project: HydratedProjectItem) {
  const [chatmapTitle, setChatmapTitle] = useState<string | null>(null);

  useEffect(() => {
    if (project.app !== "chatmap" || project.upstream || project.data) return;
    fetch(`${getChatMapBaseUrl()}/api/v1/map/${project.project_id}`, {
      credentials: "include",
      headers: { accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Record<string, unknown> | null) => {
        if (typeof d?.name === "string" && d.name) setChatmapTitle(d.name);
      })
      .catch(() => {});
  }, [project.app, project.project_id, project.upstream, project.data]);

  const isTask = !project.project_exists;
  return {
    title: isTask
      ? typeof project.data?.title === "string" && project.data.title
        ? project.data.title
        : "Untitled task"
      : (chatmapTitle ??
        resolveTitle(project.upstream, project.project_id ?? "", project.data)),
    imageUrl: resolveImageUrl(project.app, project.upstream, project.data),
    href: resolveHref(
      project.app,
      project.project_id ?? "",
      project.upstream,
      project.data,
    ),
  };
}

interface PlanProjectCardProps {
  project: HydratedProjectItem;
  onStatusChange?: (status: ProjectStatus) => void;
  onSelectClick?: () => void;
  onDelete?: () => void;
}

function PlanProjectCard({
  project,
  onStatusChange,
  onSelectClick,
  onDelete,
}: PlanProjectCardProps) {
  const { title, imageUrl, href } = usePlanProjectDisplay(project);
  const meta = APP_META[project.app];
  const [localStatus, setLocalStatus] = useState<ProjectStatus>(project.status);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setLocalStatus(project.status);
  }, [project.status]);

  function handleStatusSelect(event: CustomEvent) {
    const status = event.detail.item.value as ProjectStatus;
    setLocalStatus(status);
    onStatusChange?.(status);
  }

  const cardContent = (
    <div className="flex flex-col gap-sm w-full">
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-36 object-cover"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <img src={meta.icon} alt={meta.label} className="w-6 h-6" />
          </div>
        </div>
        {!project.project_exists ? null : onStatusChange ? (
          <div className="absolute top-1 right-1 z-10">
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
          </div>
        ) : (
          <Tag
            variant={statusVariant(project.status)}
            className="absolute top-1 right-1 z-10"
          >
            {formatProjectStatus(project.status)}
          </Tag>
        )}
      </div>

      {project.project_exists ? (
        <div className="flex flex-col justify-start">
          <span className="text-sm text-hot-gray-600">{meta.name}</span>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="block w-full text-left whitespace-normal text-base font-bold hover:text-black"
          >
            <span className="line-clamp-2">{title}</span>
          </button>
        </div>
      ) : (
        <span className="text-base font-bold whitespace-normal">
          <span className="text-sm text-hot-gray-600">{meta.name}</span>
          <span className="line-clamp-2">{title}</span>
        </span>
      )}
    </div>
  );

  const cardClassName = `w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col gap-lg${!project.project_exists ? " opacity-50" : ""}`;

  return (
    <>
      {project.project_exists && (
        <ProjectDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={title}
          href={href}
          project={project}
          imageUrl={imageUrl}
          onDelete={onDelete}
          onStatusChange={onStatusChange ? (status) => {
            setLocalStatus(status);
            onStatusChange(status);
          } : undefined}
        />
      )}
      {!project.project_exists ? (
        <button
          type="button"
          onClick={onSelectClick}
          className={`${cardClassName} text-left cursor-pointer`}
        >
          {cardContent}
        </button>
      ) : (
        <div className={cardClassName}>{cardContent}</div>
      )}
    </>
  );
}

export default PlanProjectCard;
