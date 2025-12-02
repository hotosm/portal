import ReactMarkdown from "react-markdown";
import { useProjectDetails } from "../hooks/useProjectDetails";
import { m } from "../paraglide/messages";
import { shortenText } from "../utils/utils";
import Button from "./shared/Button";
import Icon from "./shared/Icon";

interface ProjectsMapCalloutProps {
  projectId: number;
  onViewDetails: () => void;
  onClose: () => void;
}

export function ProjectsMapCallout({
  projectId,
  onClose,
}: ProjectsMapCalloutProps) {
  const { data: projectDetails, isLoading } = useProjectDetails(projectId);

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
