import { ProjectMapFeature } from "../types/projectsMap";
import Icon from "./shared/Icon";
import { getProductConfig } from "../utils/productConfig";

export function ProjectMapListCallout({
  projects,
  locationName,
  onClose,
  onProjectClick,
}: {
  projects: ProjectMapFeature[];
  locationName?: string;
  onClose: () => void;
  onProjectClick?: (projectId: number | string, product?: string) => void;
}) {
  const handleProjectClick = (projectId: number | string, product?: string) => {
    if (onProjectClick) {
      onProjectClick(projectId, product);
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
          const productInfo = getProductConfig(project.properties.product);
          const projectName = project.properties.name || `Project #${projectId}`;
          
          return (
            <div
              key={projectId}
              onClick={() => handleProjectClick(projectId, project.properties.product)}
              className="border border-hot-gray-200 rounded-lg p-3 cursor-pointer hover:bg-hot-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <img 
                  src={productInfo.icon} 
                  alt={productInfo.name}
                  className="w-6 h-6 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {projectName}
                  </div>
                  <div className="text-xs text-hot-gray-500 mt-0.5">
                    {productInfo.name}
                  </div>
                </div>
                <Icon
                  name="chevron-right"
                  className="w-4 h-4 text-hot-gray-400 flex-shrink-0 mt-1"
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
