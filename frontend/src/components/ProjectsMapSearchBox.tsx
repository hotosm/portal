import { useEffect, useState, useRef } from "react";
import maplibregl from "maplibre-gl";
import Icon from "./shared/Icon";
import { ProjectMapFeature } from "../types/projectsMap";

interface ProjectsMapSearchBoxProps {
  map: maplibregl.Map | null;
  onShowProjects?: (
    projects: ProjectMapFeature[],
    locationName: string
  ) => void;
}

interface SearchResult {
  place_name: string;
  center: [number, number];
  bbox?: number[];
  properties?: any;
}

export function ProjectsMapSearchBox({
  map,
  onShowProjects,
}: ProjectsMapSearchBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  // --- Search helpers ---
  const fetchSearchResults = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }
    setIsLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=geojson&limit=5&addressdetails=1`;
      const res = await fetch(url);
      const geojson = await res.json();
      const feats: SearchResult[] = (geojson.features || []).map(
        (feature: any) => {
          const center: [number, number] = [
            feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
            feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
          ];
          return {
            place_name: feature.properties.display_name,
            center,
            bbox: feature.bbox,
            properties: feature.properties,
          };
        }
      );
      setResults(feats);
      setActiveIndex(feats.length > 0 ? 0 : -1);
    } catch (e) {
      console.error("Error fetching geocoding results:", e);
      setResults([]);
      setActiveIndex(-1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = window.setTimeout(() => {
      fetchSearchResults(val);
    }, 200);
  };

  // Helper function to find projects within bounds
  const findProjectsInBounds = (bbox: number[]): ProjectMapFeature[] => {
    if (!map) return [];

    try {
      const source = map.getSource("projects") as maplibregl.GeoJSONSource;
      if (!source || !source._data) return [];

      // Get the source data
      const sourceData = source._data as any;
      if (!sourceData || !sourceData.features) return [];

      // Filter projects within bounds
      return sourceData.features.filter((feature: ProjectMapFeature) => {
        if (!feature.geometry || feature.geometry.type !== "Point")
          return false;
        const [lng, lat] = feature.geometry.coordinates;
        return (
          lng >= (bbox[0] ?? -180) &&
          lng <= (bbox[2] ?? 180) &&
          lat >= (bbox[1] ?? -90) &&
          lat <= (bbox[3] ?? 90)
        );
      }) as ProjectMapFeature[];
    } catch (error) {
      console.error("Error finding projects in bounds:", error);
      return [];
    }
  };

  const flyToResult = (r: SearchResult) => {
    if (!map) return;

    let projectsInArea: ProjectMapFeature[] = [];

    if (r.bbox && r.bbox.length === 4) {
      // Find projects in the bounding box
      projectsInArea = findProjectsInBounds(r.bbox);

      if (r.bbox && r.bbox.length >= 4) {
        map.fitBounds(
          [
            [r.bbox[0]!, r.bbox[1]!],
            [r.bbox[2]!, r.bbox[3]!],
          ],
          { padding: 20 }
        );
      }
    } else {
      // For point locations, create a small bounding box around the center
      const buffer = 0.1; // approximately 11km buffer
      const bbox = [
        r.center[0] - buffer,
        r.center[1] - buffer,
        r.center[0] + buffer,
        r.center[1] + buffer,
      ];
      projectsInArea = findProjectsInBounds(bbox);

      map.flyTo({ center: r.center, zoom: 12 });
    }

    // Show projects in the area if any found
    if (projectsInArea.length > 0 && onShowProjects) {
      onShowProjects(projectsInArea, r.place_name);
    }
  };

  const handleSelect = (index: number) => {
    if (index < 0 || index >= results.length) return;
    const r = results[index];
    if (r) {
      flyToResult(r);
    }
    setIsExpanded(false);
    setResults([]);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(activeIndex >= 0 ? activeIndex : 0);
    } else if (e.key === "Escape") {
      setResults([]);
    }
  };

  return (
    <div ref={containerRef} className="absolute top-0 right-0 p-2 z-10">
      {isExpanded ? (
        <>
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-lg p-2 w-72 animate-in fade-in duration-200">
            <Icon
              name="search"
              className="w-5 h-5 text-gray-400 flex-shrink-0"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for places..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="flex-1 outline-none text-sm bg-white"
              onBlur={() => {
                if (!searchValue) setIsExpanded(false);
              }}
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("");
                  setResults([]);
                  setActiveIndex(-1);
                  searchInputRef.current?.focus();
                }}
                className="hover:bg-gray-100 rounded transition-colors"
                aria-label="Clear search"
              >
                <Icon name="close" className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {(results.length > 0 || isLoading) && (
            <div className="mt-2 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto w-72">
              {isLoading && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Searching…
                </div>
              )}
              {!isLoading &&
                results.map((r, i) => (
                  <button
                    key={`${r.place_name}-${i}`}
                    onMouseDown={(e) => {
                      // prevent input blur before we handle selection
                      e.preventDefault();
                    }}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      i === activeIndex ? "bg-gray-100" : ""
                    }`}
                    title={r.place_name}
                  >
                    <div className="font-medium truncate">{r.place_name}</div>
                  </button>
                ))}
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          aria-label="Open search"
        >
          <Icon name="search" className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}
