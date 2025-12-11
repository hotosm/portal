import ReactMarkdown from "react-markdown";
import { useProjectDetails } from "../hooks/useProjectDetails";
import { useDroneProjectDetails } from "../hooks/useDroneProjectDetails";
import { useOAMProjectDetails } from "../hooks/useOAMProjectDetails";
import { m } from "../paraglide/messages";
import { shortenText } from "../utils/utils";
import Button from "./shared/Button";
import Icon from "./shared/Icon";
import { ProjectMapFeature } from "../types/projectsMap";
import { ProjectMapListCallout } from "./ProjectsMapListCallout";

interface ProjectsMapCalloutProps {
  // For individual project details
  projectId?: number | string;
  product?: string;
  // For project lists (geographic search or zoom-based)
  projects?: ProjectMapFeature[];
  locationName?: string; // For geographic searches
  onClose: () => void;
  onProjectClick?: (projectId: number | string, product?: string) => void;
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
    return (
      <IndividualProjectCallout
        projectId={projectId}
        product={product || "tasking-manager"}
        onClose={onClose}
      />
    );
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

  // Get the active query data
  const projectData =
    product === "tasking-manager"
      ? taskingManagerQuery.data
      : product === "drone-tasking-manager"
      ? droneTaskingManagerQuery.data
      : product === "imagery"
      ? oamQuery.data
      : null;

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

  if (!projectData) {
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
          Details not available for this project.
        </p>
      </>
    );
  }

  // Unified render using normalized data
  return (
    <>
      <div className="flex justify-between items-start text-sm mb-2">
        <span className="text-hot-gray-500">{projectData.productName}</span>
        <Icon name="close" onClick={onClose} className="cursor-pointer" />
      </div>

      <p className="text-xl leading-tight font-semibold mb-3">
        {projectData.name}
      </p>

      {projectData.thumbnail && (
        <div className="mb-3">
          <img
            src={projectData.thumbnail}
            alt={projectData.name}
            className="w-full h-32 object-cover rounded"
          />
        </div>
      )}

      {projectData.description && (
        <div className="text-sm text-hot-gray-600 mb-3">
          <ReactMarkdown>{shortenText(projectData.description)}</ReactMarkdown>
        </div>
      )}

      {projectData.metadata && projectData.metadata.length > 0 && (
        <div className="text-sm text-hot-gray-600 mb-3 space-y-1">
          {projectData.metadata.map((item, index) => (
            <div key={index}>
              <strong>{item.label}:</strong> {item.value}
            </div>
          ))}
        </div>
      )}

      <Button href={projectData.url} target="_blank">
        {m.view_project_detail()}
      </Button>
    </>
  );
}
