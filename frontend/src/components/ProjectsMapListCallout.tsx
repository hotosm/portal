import { ProjectMapFeature } from "../types/projectsMap/taskingManager";
import Icon from "./shared/Icon";

export function ProjectMapListCallout({
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
          const numericProjectId = typeof projectId === 'string' ? Number(projectId) : projectId;
          return (
            <div
              key={projectId}
              onClick={() => handleProjectClick(numericProjectId)}
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
