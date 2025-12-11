import ReactMarkdown from "react-markdown";
import { useProjectDetails } from "../hooks/useProjectDetails";
import { useDroneProjectDetails } from "../hooks/useDroneProjectDetails";
import { useOAMProjectDetails } from "../hooks/useOAMProjectDetails";
import { m } from "../paraglide/messages";
import { shortenText } from "../utils/utils";
import Button from "./shared/Button";
import Icon from "./shared/Icon";
import { ProjectMapFeature } from "../types/projectsMap/taskingManager";
import { ProjectMapListCallout } from "./ProjectsMapListCallout";

interface ProjectsMapCalloutProps {
  // For individual project details
  projectId?: number | string;
  product?: string;
  // For project lists (geographic search or zoom-based)
  projects?: ProjectMapFeature[];
  locationName?: string; // For geographic searches
  onClose: () => void;
  onProjectClick?: (projectId: number) => void;
}

export function ProjectsMapCallout({
  projectId,
  product,
  projects,
  locationName,
  onClose,
  onProjectClick,
}: ProjectsMapCalloutProps) {
  // If we have a single project ID, show individual project details
  if (projectId) {
    return <IndividualProjectCallout projectId={projectId} product={product || "tasking-manager"} onClose={onClose} />;
  }

  // If we have a list of projects, show project list
  if (projects && projects.length > 0) {
    return (
      <ProjectMapListCallout
        projects={projects}
        locationName={locationName}
        onClose={onClose}
        onProjectClick={onProjectClick}
      />
    );
  }

  // Empty state
  return (
    <>
      <div className="flex justify-between items-start text-sm">
        <span></span>
        <Icon name="close" onClick={onClose} className="cursor-pointer" />
      </div>
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-hot-gray-600">No projects found in this area.</p>
      </div>
    </>
  );
}

// Component for individual project details (existing functionality)
function IndividualProjectCallout({
  projectId,
  product,
  onClose,
}: {
  projectId: number | string;
  product: string;
  onClose: () => void;
}) {
  // Use appropriate hook based on product type
  const taskingManagerQuery = useProjectDetails(
    product === "tasking-manager" ? Number(projectId) : null
  );
  const droneTaskingManagerQuery = useDroneProjectDetails(
    product === "drone-tasking-manager" ? String(projectId) : null
  );
  const oamQuery = useOAMProjectDetails(
    product === "imagery" ? String(projectId) : null
  );
  
  const isLoading =
    product === "tasking-manager"
      ? taskingManagerQuery.isLoading
      : product === "drone-tasking-manager"
        ? droneTaskingManagerQuery.isLoading
        : product === "imagery"
          ? oamQuery.isLoading
          : false;

  if (isLoading) {
    return (
      <>
        <div className="flex justify-between items-start">
          <span></span>
          <Icon name="close" onClick={onClose} className="cursor-pointer" />
        </div>
        <p className="text-xl leading-tight">Loading...</p>
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-hot-gray-600">Loading project details...</p>
        </div>
      </>
    );
  }

  // Render Tasking Manager project
  if (product === "tasking-manager") {
    const { projectInfo, organisationName, percentMapped, percentValidated } =
      taskingManagerQuery.data || {};

    const projectName = projectInfo?.name || `Project #${projectId}`;
    const description = projectInfo?.description;

    return (
      <>
        <div className="flex justify-between items-start text-sm">
          <span>
            <strong>Project ID:</strong> #{projectId}
          </span>
          <Icon name="close" onClick={onClose} className="cursor-pointer" />
        </div>
        <p className="text-xl leading-tight">{projectName}</p>
        {organisationName && (
          <div className="text-sm text-hot-gray-600 mb-2">
            <strong>Organisation:</strong> {organisationName}
          </div>
        )}
        {description && (
          <div className="text-sm text-hot-gray-600 mb-3">
            <ReactMarkdown>{shortenText(description)}</ReactMarkdown>
          </div>
        )}
        {(percentMapped !== undefined || percentValidated !== undefined) && (
          <div className="text-sm text-hot-gray-600 mb-2">
            {percentMapped !== undefined && (
              <div>
                <strong>Mapped:</strong> {percentMapped}%
              </div>
            )}
            {percentValidated !== undefined && (
              <div>
                <strong>Validated:</strong> {percentValidated}%
              </div>
            )}
          </div>
        )}
        <Button
          href={`https://tasks.hotosm.org/projects/${projectId}`}
          target="_blank"
        >
          {m.view_project_detail()}
        </Button>
      </>
    );
  }

  // Render Drone Tasking Manager project
  if (product === "drone-tasking-manager") {
    const droneDetails = droneTaskingManagerQuery.data;
    const projectName = droneDetails?.name || `Drone Project #${projectId}`;
    const description = droneDetails?.description;
    const totalTasks = droneDetails?.total_task_count;
    const completedTasks = droneDetails?.completed_task_count;
    const progressPercent =
      totalTasks && totalTasks > 0
        ? Math.round(((completedTasks || 0) / totalTasks) * 100)
        : undefined;

    return (
      <>
        <div className="flex justify-between items-start text-sm">
          <span>
            <strong>Project ID:</strong> {projectId}
          </span>
          <Icon name="close" onClick={onClose}></Icon>
        </div>
        <p className="text-xl leading-tight">{projectName}</p>
        {droneDetails?.author_name && (
          <div className="text-sm text-hot-gray-600 mb-2">
            <strong>Author:</strong> {droneDetails.author_name}
          </div>
        )}
        {description && (
          <div className="text-sm text-hot-gray-600 mb-3">
            <ReactMarkdown>{shortenText(description)}</ReactMarkdown>
          </div>
        )}
        {progressPercent !== undefined && (
          <div className="text-sm text-hot-gray-600 mb-2">
            <div>
              <strong>Progress:</strong> {progressPercent}% ({completedTasks}/
              {totalTasks} tasks)
            </div>
          </div>
        )}
        <Button
          href={`https://dronetm.org/projects/${projectId}`}
          target="_blank"
        >
          {m.view_project_detail()}
        </Button>
      </>
    );
  }

  // Render Open Aerial Map imagery
  if (product === "imagery") {
    const oamDetails = oamQuery.data;
    const title = oamDetails?.title || `Imagery #${projectId}`;
    const provider = oamDetails?.provider;
    const platform = oamDetails?.platform;
    const acquisitionDate = oamDetails?.acquisition_start
      ? new Date(oamDetails.acquisition_start).toLocaleDateString()
      : undefined;
    const thumbnail = oamDetails?.properties?.thumbnail;
    // Calculate center from bbox for fallback URL
    const bbox = oamDetails?.bbox;
    const centerLon = bbox && bbox.length === 4 ? (bbox[0]! + bbox[2]!) / 2 : 0;
    const centerLat = bbox && bbox.length === 4 ? (bbox[1]! + bbox[3]!) / 2 : 0;

    return (
      <>
        <div className="flex justify-between items-start text-sm">
          <span>
            <strong>Imagery ID:</strong> {projectId}
          </span>
          <Icon name="close" onClick={onClose}></Icon>
        </div>
        <p className="text-xl leading-tight">{title}</p>
        {thumbnail && (
          <div className="mb-3">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-32 object-cover rounded"
            />
          </div>
        )}
        {provider && (
          <div className="text-sm text-hot-gray-600 mb-2">
            <strong>Provider:</strong> {provider}
          </div>
        )}
        {platform && (
          <div className="text-sm text-hot-gray-600 mb-2">
            <strong>Platform:</strong> {platform}
          </div>
        )}
        {acquisitionDate && (
          <div className="text-sm text-hot-gray-600 mb-2">
            <strong>Acquisition:</strong> {acquisitionDate}
          </div>
        )}
        <Button
          href={`https://map.openaerialmap.org/#/${centerLon},${centerLat},14`}
          target="_blank"
        >
          {m.view_project_detail()}
        </Button>
      </>
    );
  }

  // Fallback for unsupported product types
  return (
    <>
      <div className="flex justify-between items-start text-sm">
        <span>
          <strong>Project ID:</strong> {projectId}
        </span>
        <Icon name="close" onClick={onClose} className="cursor-pointer" />
      </div>
      <p className="text-xl leading-tight">Project #{projectId}</p>
      <p className="text-sm text-hot-gray-600">
        Details not available for this product type.
      </p>
    </>
  );
}
