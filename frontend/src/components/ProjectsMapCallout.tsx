import ReactMarkdown from "react-markdown";
import { useProjectDetails } from "../hooks/useProjectDetails";
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

// Component for project lists (new functionality)
function ProjectListCallout({
  projects,
  locationName,
  onClose,
  onProjectClick,
}: {
  projects: ProjectMapFeature[];
  locationName?: string;
  onClose: () => void;
  onProjectClick?: (projectId: number) => void;
}) {
  const handleProjectClick = (projectId: number) => {
    if (onProjectClick) {
      onProjectClick(projectId);
    }
  };

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
