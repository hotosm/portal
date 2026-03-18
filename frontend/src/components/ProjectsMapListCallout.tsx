import { useState, useMemo } from "react";
import { ProjectMapFeature } from "../types/projectsMap";
import Icon from "./shared/Icon";
import { getProductConfig } from "../utils/productConfig";

const PRODUCT_FILTERS = [
  { type: "drone-tasking-manager", label: "Drone TM" },
  { type: "imagery", label: "Open Aerial Map" },
  { type: "tasking-manager", label: "Tasking Manager" },
  { type: "fair", label: "fAIr" },
  { type: "field", label: "Field TM" },
  { type: "chatmap", label: "ChatMap" },
  { type: "export", label: "Export Tool" },
  { type: "umap", label: "uMap" },
] as const;

const ALL_FILTER_TYPES = new Set(PRODUCT_FILTERS.map((f) => f.type as string));

// Default set used as fallback when no controlled filters are passed
const DEFAULT_ENABLED = new Set(ALL_FILTER_TYPES);

const PRODUCT_SHORT_LABEL: Record<string, string> = {
  "drone-tasking-manager": "Drone project",
  "tasking-manager": "Tasks project",
  imagery: "Open Aerial Map project",
  fair: "AI project",
  field: "Field project",
  umap: "uMap project",
};

function getProductShortLabel(product?: string): string {
  return (product && PRODUCT_SHORT_LABEL[product]) || "Project";
}

export function ProjectMapListCallout({
  projects,
  locationName,
  onClose,
  onProjectClick,
  enabledFilters: controlledFilters,
  onToggleFilter,
}: {
  projects: ProjectMapFeature[];
  locationName?: string;
  onClose: () => void;
  onProjectClick?: (projectId: number | string, product?: string) => void;
  enabledFilters?: Set<string>;
  onToggleFilter?: (type: string) => void;
}) {
  const [searchText, setSearchText] = useState("");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Use controlled filters from parent (synced with map) or fall back to default
  const enabledFilters = controlledFilters ?? DEFAULT_ENABLED;

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const product = p.properties.product ?? "";
      // If the product type is not in our filter list, always show it
      const isKnownType = ALL_FILTER_TYPES.has(product);
      if (isKnownType && !enabledFilters.has(product)) return false;
      if (searchText.trim()) {
        const name = (
          p.properties.name ?? `Project #${p.properties.projectId}`
        ).toLowerCase();
        if (!name.includes(searchText.toLowerCase())) return false;
      }
      return true;
    });
  }, [projects, enabledFilters, searchText]);

  // Summary counters from all projects in the area (no filter applied)
  const counts = useMemo(
    () => ({
      layers: projects.filter(
        (p) =>
          p.properties.product === "imagery" ||
          p.properties.product === "drone-tasking-manager"
      ).length,
      tasks: projects.filter(
        (p) => p.properties.product === "tasking-manager"
      ).length,
      field: projects.filter((p) => p.properties.product === "field").length,
      maps: projects.filter((p) => p.properties.product === "umap").length,
    }),
    [projects]
  );

  const getProjectName = (project: ProjectMapFeature): string => {
    if (project.properties.name) return project.properties.name;
    return `Project #${project.properties.projectId}`;
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-start text-sm mb-3">
        <strong className="leading-tight pr-2">
          Projects in {locationName || "this area"}
        </strong>
        <Icon name="close" onClick={onClose} className="cursor-pointer flex-shrink-0" style={{ color: "white", background: "black", padding: "5px 6px", borderRadius: "100px" }} />
      </div>

      {/* Project search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full border border-hot-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-hot-red-500 transition-colors"
        />
      </div>

      {/* Project list */}
      <div
        className="space-y-2 overflow-y-auto mb-2 transition-all duration-300 ease-in-out"
        style={{ maxHeight: filtersExpanded ? "80px" : "160px" }}
      >
        {filteredProjects.length === 0 && (
          <p className="text-sm text-hot-gray-500 py-2 text-center">
            No projects match your filters.
          </p>
        )}
        {filteredProjects.map((project) => {
          const productInfo = getProductConfig(project.properties.product);
          const projectId = project.properties.projectId;
          return (
            <div
              key={projectId}
              onClick={() =>
                onProjectClick?.(projectId, project.properties.product)
              }
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
                    {getProductShortLabel(project.properties.product)}
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

      {/* Application filter toggle */}
      <div className="mb-2">
        <button
          onClick={() => setFiltersExpanded((v) => !v)}
          className="flex items-center gap-1 text-sm text-hot-gray-500 hover:text-hot-gray-700 transition-colors mb-1"
          aria-expanded={filtersExpanded}
        >
          <Icon
            name={filtersExpanded ? "chevron-up" : "chevron-down"}
            className="w-3 h-3"
          />
        </button>

        {filtersExpanded && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2 border-t border-b border-hot-gray-100 mb-2">
            {PRODUCT_FILTERS.map(({ type, label }) => (
              <label
                key={type}
                className="flex items-center gap-2 text-sm cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={enabledFilters.has(type)}
                  onChange={() => onToggleFilter?.(type)}
                  className="w-4 h-4 rounded text-black bg-white border border-black"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Footer counters */}
      <div className="mt-3 pt-3 border-t border-hot-gray-100 flex items-center gap-4 text-sm text-hot-gray-600">
        <span className="flex items-center gap-1" title="Imagery & Drone layers">
          <Icon name="layer-group" className="w-4 h-4" />
          <span>{counts.layers}</span>
        </span>
        <span className="flex items-center gap-1" title="Tasking Manager tasks">
          <Icon name="pencil" className="w-4 h-4" />
          <span>{counts.tasks}</span>
        </span>
        <span className="flex items-center gap-1" title="Field mapping projects">
          <Icon name="mobile" className="w-4 h-4" />
          <span>{counts.field}</span>
        </span>
        <span className="flex items-center gap-1" title="uMap maps">
          <Icon name="map" className="w-4 h-4" />
          <span>{counts.maps}</span>
        </span>
      </div>
    </>
  );
}
