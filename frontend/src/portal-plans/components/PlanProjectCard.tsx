import placeholder from "../../assets/images/placeholder.png";
import CardProjectTitle from "../../components/shared/CardProjectTitle";
import { APP_META } from "../../utils/appMeta";
import type { HydratedProjectItem, AppName } from "../types";

function getProjectHref(app: AppName, projectId: string): string {
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
    case "open-aerial-map":
      return `https://map.openaerialmap.org/#/latest/${projectId}`;
    case "umap":
      return `https://umap.hotosm.org/m/${projectId}/`;
    case "chatmap":
      return `https://chatmap.hotosm.org/#map/${projectId}`;
  }
}

function getUpstreamTitle(
  upstream: Record<string, unknown> | null,
  projectId: string,
): string {
  if (!upstream) return projectId;
  const t = upstream.name ?? upstream.title;
  return typeof t === "string" && t ? t : projectId;
}

function getUpstreamImage(upstream: Record<string, unknown> | null): string {
  if (!upstream) return placeholder;
  const img =
    upstream.image_url ??
    upstream.thumbnail_url ??
    upstream.thumbnail ??
    upstream.image;
  return typeof img === "string" && img ? img : placeholder;
}

interface PlanProjectCardProps {
  project: HydratedProjectItem;
}

function PlanProjectCard({ project }: PlanProjectCardProps) {
  const meta = APP_META[project.app];
  const title = getUpstreamTitle(project.upstream, project.project_id);
  const image = getUpstreamImage(project.upstream);
  const href = getProjectHref(
    project.app,
    project.project_id,
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
        </div>

        <CardProjectTitle href={href} title={title} />
      </div>
    </div>
  );
}

export default PlanProjectCard;
