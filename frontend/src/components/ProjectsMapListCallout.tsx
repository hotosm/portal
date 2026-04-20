import { useQueries } from "@tanstack/react-query";
import { ProjectMapFeature } from "../types/projectsMap";
import Icon from "./shared/Icon";
import { getProductConfig } from "../utils/productConfig";

// Fetch fAIr model name by ID
async function fetchFAIRModelName(modelId: number): Promise<string | null> {
  try {
    const response = await fetch(`/api/fair/model/${modelId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.name || null;
  } catch {
    return null;
  }
}

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
  // Get all fAIr project IDs that need name fetching
  const fairProjects = projects.filter(
    (p) => p.properties.product === "fair" && !p.properties.name
  );

  // Fetch names for all fAIr projects in parallel
  const fairNameQueries = useQueries({
    queries: fairProjects.map((project) => ({
      queryKey: ["fair-model-name", project.properties.projectId],
      queryFn: () => fetchFAIRModelName(Number(project.properties.projectId)),
      staleTime: 5 * 60 * 1000,
    })),
  });

  // Create a map of projectId -> name for fAIr projects
  const fairNamesMap = new Map<string | number, string | null>();
  fairProjects.forEach((project, index) => {
    fairNamesMap.set(
      project.properties.projectId,
      fairNameQueries[index]?.data ?? null
    );
  });

  const handleProjectClick = (projectId: number | string, product?: string) => {
    if (onProjectClick) {
      onProjectClick(projectId, product);
    }
  };

  // Helper to get display name for a project
  const getProjectName = (project: ProjectMapFeature): string => {
    const projectId = project.properties.projectId;

    // If project already has a name, use it
    if (project.properties.name) {
      return project.properties.name;
    }

    // For fAIr projects, check if we fetched the name
    if (project.properties.product === "fair") {
      const fetchedName = fairNamesMap.get(projectId);
      if (fetchedName) {
        return fetchedName;
      }
      return `Model #${projectId}`;
    }

    return `Project #${projectId}`;
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
          const productInfo = getProductConfig(project.properties.product);
          const projectId = project.properties.projectId;

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
                    {getProjectName(project)}
                  </div>
                  <div className="text-xs text-hot-gray-500 mt-0.5">
                    #{projectId} · {productInfo.name}
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
