import { useState, useEffect } from "react";
import placeholder from "../../assets/images/placeholder.png";
import CardProjectTitle from "../../components/shared/CardProjectTitle";
import { APP_META } from "../../utils/appMeta";
import { osmTileUrl } from "../../utils/osmTiles";
import { useUpdateProjectStatus } from "../hooks";
import type { HydratedProjectItem, AppName, ProjectStatus } from "../types";

function getProjectHref(
  app: AppName,
  projectId: string,
  upstream: Record<string, unknown> | null,
): string {
  switch (app) {
    case "tasking-manager":
      return `https://tasks.hotosm.org/projects/${projectId}`;
    case "drone-tasking-manager":
      return `https://drone.hotosm.org/projects/${projectId}`;
    case "field-tm":
      return `https://field.hotosm.org/projects/${projectId}`;
    case "fair":
      return `https://fair.hotosm.org/ai-models/${projectId}`;
    case "export-tool":
      return `https://export.hotosm.org/v3/exports/${projectId}`;
    case "open-aerial-map": {
      const bbox = upstream?.bbox;
      if (Array.isArray(bbox) && bbox.length === 4) {
        const lng = ((bbox[0] as number) + (bbox[2] as number)) / 2;
        const lat = ((bbox[1] as number) + (bbox[3] as number)) / 2;
        return `https://map.openaerialmap.org/#/${lng},${lat},14/latest/${projectId}`;
      }
      return `https://map.openaerialmap.org`;
    }
    case "umap":
      return `https://umap.hotosm.org/m/${projectId}/`;
    case "chatmap":
      return `https://chatmap.hotosm.org/#map/${projectId}`;
  }
}

function getUpstreamTitle(
  upstream: Record<string, unknown> | null,
  projectId: string,
  data: Record<string, unknown> | null,
): string {
  const src = upstream ?? data;
  if (!src) return projectId;
  const t = src.name ?? src.title ?? src.project_name;
  return typeof t === "string" && t ? t : projectId;
}

function getUpstreamImage(
  app: AppName,
  upstream: Record<string, unknown> | null,
  data: Record<string, unknown> | null,
): string {
  const src = upstream ?? data;
  if (!src) return placeholder;

  if (app === "chatmap") {
    const centroid = src.centroid as [number, number] | null | undefined;
    if (Array.isArray(centroid) && centroid.length === 2) {
      return osmTileUrl(centroid[0], centroid[1], 10);
    }
  }

  if (app === "tasking-manager") {
    const bbox = src.aoiBBOX as [number, number, number, number] | null | undefined;
    if (Array.isArray(bbox) && bbox.length === 4) {
      const lat = (bbox[1] + bbox[3]) / 2;
      const lon = (bbox[0] + bbox[2]) / 2;
      return osmTileUrl(lat, lon, 10);
    }
  }

  const img =
    src.image_url ??
    src.thumbnail_url ??
    src.thumbnail ??
    src.image;
  return typeof img === "string" && img ? img : placeholder;
}

interface PlanProjectCardProps {
  project: HydratedProjectItem;
  isOwner?: boolean;
  planId?: string;
}

function StatusDot({
  status,
  isOwner,
  onToggle,
  isPending,
}: {
  status: ProjectStatus;
  isOwner: boolean;
  onToggle: () => void;
  isPending: boolean;
}) {
  const colorClass = status === "done" ? "bg-green-500" : "bg-yellow-400";
  if (isOwner) {
    return (
      <button
        onClick={onToggle}
        disabled={isPending}
        title={status === "done" ? "Mark as in progress" : "Mark as done"}
        className={`w-3 h-3 rounded-full ${colorClass} ${isPending ? "opacity-50" : "hover:ring-2 hover:ring-offset-1 hover:ring-gray-400"} transition-opacity`}
      />
    );
  }
  return <span className={`w-3 h-3 rounded-full ${colorClass} inline-block`} />;
}

function PlanProjectCard({ project, isOwner = false, planId = "" }: PlanProjectCardProps) {
  const [chatmapName, setChatmapName] = useState<string | null>(null);
  const { mutate: updateStatus, isPending: statusPending } = useUpdateProjectStatus();

  function handleStatusToggle() {
    const next = project.status === "done" ? "in_progress" : "done";
    updateStatus({ planId, app: project.app, projectId: project.project_id, status: next });
  }

  useEffect(() => {
    if (project.app !== "chatmap" || project.upstream || project.data) return;
    fetch(`https://chatmap.hotosm.org/api/v1/map/${project.project_id}`, {
      credentials: "include",
      headers: { accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Record<string, unknown> | null) => {
        if (typeof d?.name === "string" && d.name) setChatmapName(d.name);
      })
      .catch(() => {});
  }, [project.app, project.project_id, project.upstream, project.data]);

  const meta = APP_META[project.app];
  const title = chatmapName ?? getUpstreamTitle(project.upstream, project.project_id, project.data);
  const image = getUpstreamImage(project.app, project.upstream, project.data);
  const href = getProjectHref(
    project.app,
    project.project_id,
    project.upstream,
  );

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <div className="relative">
          <img
            src={image}
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
          <div className="absolute top-2 right-2">
            <StatusDot
              status={project.status}
              isOwner={isOwner}
              onToggle={handleStatusToggle}
              isPending={statusPending}
            />
          </div>
        </div>

        {href ? (
          <CardProjectTitle href={href} title={title} />
        ) : (
          <span className="text-base font-bold">{title}</span>
        )}
      </div>
    </div>
  );
}

export default PlanProjectCard;
