import ReactMarkdown from "react-markdown";
import { useMapProjectDetails } from "../hooks/useMapProjectDetails";
import { m } from "../paraglide/messages";
import { shortenText } from "../utils/utils";
import Button from "./shared/Button";
import Icon from "./shared/Icon";
import { ProjectMapFeature } from "../types/projectsMap";
import { ProjectMapListCallout } from "./ProjectsMapListCallout";
import type { ProductType } from "../types/projectsMap/products";

interface ProjectsMapCalloutProps {
  // For individual project details
  projectId?: number | string;
  product?: string;
  // For project lists (geographic search or zoom-based)
  projects?: ProjectMapFeature[];
  locationName?: string; // For geographic searches
  onClose: () => void;
  onProjectClick?: (projectId: number | string, product?: string) => void;
  // Application filter (shared with map layer visibility)
  enabledFilters?: Set<string>;
  onToggleFilter?: (type: string) => void;
}

export function ProjectsMapCallout({
  projectId,
  product,
  projects,
  locationName,
  onClose,
  onProjectClick,
  enabledFilters,
  onToggleFilter,
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
        enabledFilters={enabledFilters}
        onToggleFilter={onToggleFilter}
      />
    );
  }

  // Empty state
  return (
    <>
      <div className="flex justify-between items-start text-sm">
        <span></span>
        <Icon name="close" onClick={onClose} className="cursor-pointer" style={{ color: "white", background: "black", padding: "5px 6px", borderRadius: "100px" }} />
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
  const detailsQuery = useMapProjectDetails(
    product as ProductType,
    projectId
  );

  const projectData = detailsQuery.data;
  const isLoading = detailsQuery.isLoading;

  if (isLoading) {
    return (
      <>
        <div className="flex justify-between items-start">
          <span></span>
          <Icon name="close" onClick={onClose} className="cursor-pointer" style={{ color: "white", background: "black", padding: "5px 6px", borderRadius: "100px" }} />
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
          <Icon name="close" onClick={onClose} className="cursor-pointer" style={{ color: "white", background: "black", padding: "5px 6px", borderRadius: "100px" }} />
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
        <Icon name="close" onClick={onClose} className="cursor-pointer" style={{ color: "white", background: "black", padding: "5px 6px", borderRadius: "100px" }} />
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
