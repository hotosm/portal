import ReactMarkdown from "react-markdown";
import { useProjectDetails } from "../hooks/useProjectDetails";
import { useDroneProjectDetails } from "../hooks/useDroneProjectDetails";
import { useOAMProjectDetails } from "../hooks/useOAMProjectDetails";
import { m } from "../paraglide/messages";
import { shortenText } from "../utils/utils";
import Button from "./shared/Button";
import Icon from "./shared/Icon";
import { ProjectMapFeature } from "../types/projectsMap/taskingManager";

interface ProjectsMapCalloutProps {
  // For individual project details
  projectId?: number;
  // For project lists (geographic search or zoom-based)
  projects?: ProjectMapFeature[];
  locationName?: string; // For geographic searches
  onClose: () => void;
  onProjectClick?: (projectId: number) => void;
}

export function ProjectsMapCallout({
  projectId,
  projects,
  locationName,
  onClose,
  onProjectClick,
}: ProjectsMapCalloutProps) {
  // If we have a single project ID, show individual project details
  if (projectId) {
    return <IndividualProjectCallout projectId={projectId} onClose={onClose} />;
  }

  // If we have a list of projects, show project list
  if (projects && projects.length > 0) {
    return (
      <ProjectListCallout
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
  onClose,
}: {
  projectId: number;
  onClose: () => void;
}) {
  const { data: projectDetails, isLoading } = useProjectDetails(projectId);

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
    const projectDetails = taskingManagerQuery.data;
    const { projectInfo, organisationName, percentMapped, percentValidated } =
      projectDetails || {};

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
      <div className="flex justify-between items-start text-sm mb-3">
        <span>
          <strong>Projects in {locationName || "this area"}</strong>
        </span>
        <Icon name="close" onClick={onClose} className="cursor-pointer" />
      </div>

      <div className="text-sm text-hot-gray-600 mb-3">
        Found {projects.length} project{projects.length !== 1 ? "s" : ""}
      </div>

      <div className="space-y-2">
        {projects.map((project) => {
          const projectId = project.properties.projectId;
          return (
            <div
              key={projectId}
              onClick={() => handleProjectClick(projectId)}
              className="border border-hot-gray-200 rounded-lg p-3 cursor-pointer hover:bg-hot-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    Project #{projectId}
                  </div>
                  <div className="text-xs text-hot-gray-500 mt-1">
                    Click to view details
                  </div>
                </div>
                <Icon
                  name="chevron-right"
                  className="w-4 h-4 text-hot-gray-400 flex-shrink-0 ml-2"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
