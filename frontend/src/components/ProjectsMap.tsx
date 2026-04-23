import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import mapMarkerSvg from "../assets/images/map-marker.svg";
import markerTasking from "../assets/images/marker-tasking-manager.svg";
import markerDroneTasking from "../assets/images/marker-drone-tasking-manager.svg";
import markerFair from "../assets/images/marker-fair.svg";
import markerField from "../assets/images/marker-field.svg";
import markerImagery from "../assets/images/marker-imagery.svg";
import markerUmap from "../assets/images/marker-umap.svg";
import { ProjectsMapSearchBox } from "./ProjectsMapSearchBox";
import { ProjectsMapCallout } from "./ProjectsMapCallout";
import { ProjectsMapResults, ProjectMapFeature } from "../types/projectsMap";
import type { ProjectListData } from "../types/projectsMap/mapCallout";

const ALL_FILTER_TYPES = new Set([
  "drone-tasking-manager",
  "imagery",
  "tasking-manager",
  "fair",
  "field",
  "chatmap",
  "export",
  "umap",
]);

interface ProjectsMapProps {
  mapResults?: ProjectsMapResults;
  onProjectClick?: (
    projectId: number | string,
    data?: ProjectListData | string,
  ) => void;
  selectedProjectId?: number | string | null;
  selectedProduct?: string;
  selectedProjects?: ProjectMapFeature[];
  locationName?: string;
  onCloseDetails?: () => void;
  className?: string;
}

const DEFAULT_MAP_STYLE = import.meta.env.VITE_MAP_STYLE || {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    positron: {
      type: "raster",
      tiles: [
        "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        "https://cartodb-basemaps-b.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        "https://cartodb-basemaps-c.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        "https://cartodb-basemaps-d.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "positron",
      type: "raster",
      source: "positron",
    },
  ],
};

// Generic loader for an external image
const loadImage = async (
  src: string,
  width = 50,
  height = 50,
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image(width, height);
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const addMapLayers = (
  map: maplibregl.Map,
  mapResults: ProjectsMapProps["mapResults"],
  onProjectClick?: (projectId: number | string, product: string) => void,
) => {
  // Add GeoJSON source with clustering
  map.addSource("projects", {
    type: "geojson",
    data: mapResults || { type: "FeatureCollection", features: [] },
    cluster: true,
    clusterRadius: 35,
    clusterMaxZoom: 14,
  });

  // Cluster
  map.addLayer({
    id: "projectsClusters",
    type: "circle",
    source: "projects",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "rgba(234, 91, 94, 0.8)",
      "circle-radius": [
        "step",
        ["get", "point_count"],
        14,
        10,
        22,
        50,
        30,
        500,
        37,
      ],
    },
  });

  // Cluster count labels
  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "projects",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["Open Sans Semibold"],
      "text-size": 14,
    },
    paint: {
      "text-color": "#fff",
    },
  });

  // Individual project markers
  map.addLayer({
    id: "projects-unclustered-points",
    type: "symbol",
    source: "projects",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": [
        "match",
        ["get", "product"],
        "tasking-manager",
        "marker-tasking-manager",
        "drone-tasking-manager",
        "marker-drone-tasking-manager",
        "fair",
        "marker-fair",
        "field",
        "marker-field",
        "imagery",
        "marker-imagery",
        "umap",
        "marker-umap",
        "mapMarker", // fallback
      ],
      "icon-size": 1,
      "icon-allow-overlap": true,
      "text-font": ["Open Sans Semibold"],
      "text-offset": [0, 0.6],
      "text-anchor": "top",
      "text-size": 12,
    },
    paint: {
      "text-color": "#2c3038",
      "text-halo-width": 1,
      "text-halo-color": "#fff",
    },
  });

  // Cursor pointer on hover
  map.on("mouseenter", "projects-unclustered-points", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "projects-unclustered-points", () => {
    map.getCanvas().style.cursor = "";
  });

  // Handle cluster clicks - zoom in
  map.on("click", "projectsClusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["projectsClusters"],
    });

    if (features.length > 0 && features[0]) {
      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource("projects") as maplibregl.GeoJSONSource;

      if (clusterId !== undefined) {
        source
          .getClusterExpansionZoom(clusterId)
          .then((zoom) => {
            if (features[0]?.geometry) {
              const coordinates = (features[0].geometry as any).coordinates;
              map.easeTo({
                center: coordinates,
                zoom: zoom,
              });
            }
          })
          .catch((err) => {
            console.error("Error getting cluster expansion zoom:", err);
          });
      }
    }
  });

  // Handle marker clicks - trigger callback to fetch details
  map.on("click", "projects-unclustered-points", (e) => {
    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    if (!feature) return;

    const projectId = feature.properties?.projectId;
    const product = feature.properties?.product || "tasking-manager";

    // Trigger callback to fetch project details
    if (projectId && onProjectClick) {
      onProjectClick(projectId, product);
    }
  });
};

export function ProjectsMap({
  mapResults,
  onProjectClick,
  selectedProjectId,
  selectedProduct,
  selectedProjects,
  locationName,
  onCloseDetails,
}: ProjectsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [enabledFilters, setEnabledFilters] = useState<Set<string>>(
    () => new Set(ALL_FILTER_TYPES),
  );

  // Reset closing state when panel opens
  useEffect(() => {
    if (
      selectedProjectId ||
      (selectedProjects && selectedProjects.length > 0)
    ) {
      setIsClosing(false);
    }
  }, [selectedProjectId, selectedProjects]);

  const handleClose = useCallback(() => {
    // If individual project has a backing list, go back instantly (no slide-out)
    if (selectedProjectId && selectedProjects && selectedProjects.length > 0) {
      onCloseDetails?.();
      return;
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCloseDetails?.();
    }, 300);
  }, [onCloseDetails, selectedProjectId, selectedProjects]);

  const handleToggleFilter = useCallback((type: string) => {
    setEnabledFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: DEFAULT_MAP_STYLE,
      center: [0, 0],
      zoom: 1.5,
      attributionControl: false,
      scrollZoom: true,
      dragRotate: false,
      pitchWithRotate: false,
      dragPan: true,
    });

    // Prevent context menu on right-click
    const canvas = map.current.getCanvas();
    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // Enable panning with right mouse button
    // We need to manually handle right-click drag since dragPan only uses left button
    let isRightDragging = false;
    let lastPos = { x: 0, y: 0 };

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 2) {
        // Right mouse button
        isRightDragging = true;
        lastPos = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = "grabbing";
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      if (isRightDragging && map.current) {
        const deltaX = e.clientX - lastPos.x;
        const deltaY = e.clientY - lastPos.y;

        // Pan the map by the delta
        map.current.panBy([-deltaX, -deltaY], { duration: 0 });

        lastPos = { x: e.clientX, y: e.clientY };
      }
    });

    canvas.addEventListener("mouseup", (e) => {
      if (e.button === 2) {
        isRightDragging = false;
        canvas.style.cursor = "";
      }
    });

    canvas.addEventListener("mouseleave", () => {
      isRightDragging = false;
      canvas.style.cursor = "";
    });

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: false }),
    );

    map.current.addControl(new maplibregl.NavigationControl(), "bottom-right");

    map.current.on("load", async () => {
      if (!map.current) return;

      try {
        const iconsToLoad = [
          ["mapMarker", mapMarkerSvg],
          ["marker-tasking-manager", markerTasking],
          ["marker-drone-tasking-manager", markerDroneTasking],
          ["marker-fair", markerFair],
          ["marker-field", markerField],
          ["marker-imagery", markerImagery],
          ["marker-umap", markerUmap],
        ] as const;

        await Promise.all(
          iconsToLoad.map(async ([name, src]) => {
            try {
              const icon = await loadImage(src);
              if (!map.current || map.current.hasImage(name)) return;
              map.current.addImage(name, icon, { pixelRatio: 2 });
            } catch (iconError) {
              console.error(`Failed to load marker icon ${name}:`, iconError);
            }
          }),
        );
      } catch (error) {
        console.error("Failed to load marker icons:", error);
      }

      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Define handleShowProjects before using it in useEffect
  const handleShowProjects = useCallback(
    (projects: ProjectMapFeature[], locationName: string) => {
      if (onProjectClick) {
        onProjectClick("projects-list", { projects, locationName });
      }
    },
    [onProjectClick],
  );

  // Update map data (re-runs when mapResults OR enabledFilters changes)
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const raw = mapResults || {
      type: "FeatureCollection" as const,
      features: [],
    };
    const filteredData = {
      ...raw,
      features: raw.features.filter((f) => {
        const product: string = (f as any).properties?.product ?? "";
        // Unknown product types always show; known ones respect the filter
        if (!ALL_FILTER_TYPES.has(product)) return true;
        return enabledFilters.has(product);
      }),
    };

    const source = map.current.getSource(
      "projects",
    ) as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(filteredData);
    } else {
      addMapLayers(map.current, filteredData, onProjectClick);
    }
  }, [mapResults, mapLoaded, onProjectClick, enabledFilters, ALL_FILTER_TYPES]);

  // Add zoom event listener for zoom-based project display
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const getProjectsInView = () => {
      if (!map.current) return [];

      try {
        const bounds = map.current.getBounds();
        const source = map.current.getSource(
          "projects",
        ) as maplibregl.GeoJSONSource;
        if (!source || !source._data) return [];

        const sourceData = source._data as any;
        if (!sourceData || !sourceData.features) return [];

        return sourceData.features.filter((feature: any) => {
          if (!feature.geometry || feature.geometry.type !== "Point")
            return false;
          const [lng, lat] = feature.geometry.coordinates;
          return bounds.contains([lng, lat]);
        });
      } catch (error) {
        console.error("Error getting projects in view:", error);
        return [];
      }
    };

    const handleZoomEnd = () => {
      if (!map.current) return;
      const zoom = map.current.getZoom();

      // Show projects when zoomed in close (zoom level 10 or higher)
      if (zoom >= 10) {
        const projectsInView = getProjectsInView();
        if (projectsInView.length > 0 && projectsInView.length <= 20) {
          // Only show if there's a reasonable number of projects
          const center = map.current.getCenter();
          // Create a more user-friendly location name
          const locationName = `this area (${center.lat.toFixed(
            2,
          )}°, ${center.lng.toFixed(2)}°)`;
          handleShowProjects(projectsInView, locationName);
        }
      }
    };

    map.current.on("zoomend", handleZoomEnd);

    return () => {
      if (map.current) {
        map.current.off("zoomend", handleZoomEnd);
      }
    };
  }, [mapLoaded, handleShowProjects]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {!selectedProjectId &&
        !(selectedProjects && selectedProjects.length > 0) && (
          <ProjectsMapSearchBox
            map={map.current}
            onShowProjects={handleShowProjects}
          />
        )}
      <div ref={mapContainer} className="w-full h-full overflow-hidden" />
      {(selectedProjectId ||
        (selectedProjects && selectedProjects.length > 0) ||
        isClosing) && (
        <div
          className={`absolute top-0 right-0 h-full bg-white p-lg border border-hot-gray-100 z-10 w-[250px] sm:w-[340px] duration-300 overflow-hidden flex flex-col ${isClosing ? "animate-out slide-out-to-right" : "animate-in slide-in-from-right"}`}
          style={{
            margin: "20px",
            borderRadius: "20px",
            height: "calc(100% - 40px)",
          }}
        >
          <ProjectsMapCallout
            projectId={selectedProjectId || undefined}
            product={selectedProduct}
            projects={selectedProjects}
            locationName={locationName}
            onProjectClick={onProjectClick}
            onClose={handleClose}
            enabledFilters={enabledFilters}
            onToggleFilter={handleToggleFilter}
          />
        </div>
      )}
    </div>
  );
}
