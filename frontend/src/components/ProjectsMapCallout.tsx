import Button from "./shared/Button";
import Divider from "./shared/Divider";
import Icon from "./shared/Icon";
import { useProjectDetails } from "../hooks/useProjectDetails";
import { m } from "../paraglide/messages";
import { ReactNode } from "react";
import { shortenText } from "../utils/utils";
import ReactMarkdown from "react-markdown";

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
          <h3>Loading...</h3>
          <Icon name="close" onClick={onClose}></Icon>
        </div>
        <Divider />
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
      <div className="flex justify-between items-start">
        <h3>{projectName}</h3>
        <Icon name="close" onClick={onClose}></Icon>
      </div>
      <Divider />
      <div className="text-sm text-hot-gray-600 mb-2">
        <strong>Project ID:</strong> #{projectId}
      </div>
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
        {m.view_project_detail}
      </Button>
    </>
  );
}
