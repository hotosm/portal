import Button from "./shared/Button";
import Divider from "./shared/Divider";
import Icon from "./shared/Icon";
import { useProjectDetails } from "../hooks/useProjectDetails";

interface ProjectsMapCalloutProps {
  projectId: number;
  onViewDetails: () => void;
  onClose: () => void;
}

export function ProjectsMapCallout({
  projectId,
  onViewDetails,
  onClose,
}: ProjectsMapCalloutProps) {
  const { data: projectDetails, isLoading } = useProjectDetails(projectId);

  if (isLoading) {
    return (
      <div
        className="bg-white p-lg w-[300px]
      min-h-[500px] rounded-lg border border-hot-gray-300"
      >
        <div className="flex justify-between items-start">
          <h3>Loading...</h3>
          <Icon name="close" onClick={onClose}></Icon>
        </div>
        <Divider />
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-hot-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  const { projectInfo, organisationName, percentMapped, percentValidated } =
    projectDetails || {};

  const projectName = projectInfo?.name || `Project #${projectId}`;
  const description = projectInfo?.description;
  return (
    <div
      className="bg-white p-lg w-[300px]
    min-h-[500px] rounded-lg border border-hot-gray-300"
    >
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
          <p>{description}</p>
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
      <Button onClick={onViewDetails}>View Project Details</Button>
    </div>
  );
}
