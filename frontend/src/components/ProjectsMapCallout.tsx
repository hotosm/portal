import ReactMarkdown from "react-markdown";
import { useProjectDetails } from "../hooks/useProjectDetails";
import { useDroneProjectDetails } from "../hooks/useDroneProjectDetails";
import { m } from "../paraglide/messages";
import { shortenText } from "../utils/utils";
import Button from "./shared/Button";
import Icon from "./shared/Icon";

type ProductType = "tasking-manager" | "drone-tasking-manager" | "fair" | "field" | "imagery";

interface ProjectsMapCalloutProps {
  projectId: number | string;
  product: ProductType;
  onViewDetails: () => void;
  onClose: () => void;
}

export function ProjectsMapCallout({
  projectId,
  product,
  onClose,
}: ProjectsMapCalloutProps) {
  // Use appropriate hook based on product type
  const taskingManagerQuery = useProjectDetails(
    product === "tasking-manager" ? Number(projectId) : null
  );
  const droneTaskingManagerQuery = useDroneProjectDetails(
    product === "drone-tasking-manager" ? String(projectId) : null
  );

  const isLoading =
    product === "tasking-manager"
      ? taskingManagerQuery.isLoading
      : product === "drone-tasking-manager"
        ? droneTaskingManagerQuery.isLoading
        : false;

  if (isLoading) {
    return (
      <>
        <div className="flex justify-between items-start">
          <span></span>
          <Icon name="close" onClick={onClose}></Icon>
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
          <Icon name="close" onClick={onClose}></Icon>
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
        ? Math.round((completedTasks || 0) / totalTasks * 100)
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
              <strong>Progress:</strong> {progressPercent}% ({completedTasks}/{totalTasks} tasks)
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

  // Fallback for unsupported product types
  return (
    <>
      <div className="flex justify-between items-start text-sm">
        <span>
          <strong>Project ID:</strong> {projectId}
        </span>
        <Icon name="close" onClick={onClose}></Icon>
      </div>
      <p className="text-xl leading-tight">Project #{projectId}</p>
      <p className="text-sm text-hot-gray-600">
        Details not available for this product type.
      </p>
    </>
  );
}
