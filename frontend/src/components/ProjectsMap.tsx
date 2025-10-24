import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapMarkerSvg from "../assets/images/map-marker.svg";
import markerTasking from "../assets/images/marker-tasking-manager.svg";
import markerDroneTasking from "../assets/images/marker-drone-tasking-manager.svg";
import markerFair from "../assets/images/marker-fair.svg";
import markerField from "../assets/images/marker-field.svg";
import markerImagery from "../assets/images/marker-imagery.svg";
import { ProjectsMapSearchBox } from "./ProjectsMapSearchBox";
import { ProjectsMapCallout } from "./ProjectsMapCallout";

// TODO types will be defined when API is ready
type ProductType =
  | "tasking-manager"
  | "drone-tasking-manager"
  | "fair"
  | "field"
  | "imagery";

interface ProjectMapFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    projectId: number;
    name: string;
    product?: ProductType;
    [key: string]: any;
  };
}

interface ProjectsMapProps {
  mapResults?: {
    type: "FeatureCollection";
    features: ProjectMapFeature[];
  };
  onProjectClick?: (projectId: number) => void;
  className?: string;
}

const DEFAULT_MAP_STYLE = import.meta.env.VITE_MAP_STYLE || {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

// Generic loader for an external image
const loadImage = async (
  src: string,
  width = 50,
  height = 50
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
  onProjectClick?: (projectId: number) => void,
  setSelectedProject?: (
    project: { projectId: number; projectName: string; status: string } | null
  ) => void
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
        "mapMarker", // fallback
      ],
      "icon-size": 1,
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

    if (features.length > 0) {
      const clusterId = features[0].properties?.cluster_id;
      const source = map.getSource("projects") as maplibregl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        const coordinates = (features[0].geometry as any).coordinates;
        map.easeTo({
          center: coordinates,
          zoom: zoom,
        });
      });
    }
  });

  // Handle marker clicks - show callout
  map.on("click", "projects-unclustered-points", (e) => {
    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const projectId = feature.properties?.projectId;
    const projectName = feature.properties?.name || `Project #${projectId}`;
    const status = feature.properties?.status || "PUBLISHED";

    // Update selected project state
    if (setSelectedProject) {
      setSelectedProject({ projectId, projectName, status });
    }

    // Trigger callback
    if (projectId && onProjectClick) {
      onProjectClick(projectId);
    }
  });
};

export function ProjectsMap({ mapResults, onProjectClick }: ProjectsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<{
    projectId: number;
    projectName: string;
    status: string;
  } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: DEFAULT_MAP_STYLE,
      center: [0, 0],
      zoom: 1.5,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: false })
    );

    map.current.addControl(new maplibregl.NavigationControl(), "bottom-right");

    // Add language control
    try {
      map.current.addControl(new MapboxLanguage({ defaultLanguage: "en" }));
    } catch (e) {
      console.warn("MapboxLanguage control not compatible with MapLibre", e);
    }

    map.current.on("load", async () => {
      if (!map.current) return;

      try {
        const [
          defaultIcon,
          taskingIcon,
          droneIcon,
          fairIcon,
          fieldIcon,
          imageryIcon,
        ] = await Promise.all([
          loadImage(mapMarkerSvg),
          loadImage(markerTasking),
          loadImage(markerDroneTasking),
          loadImage(markerFair),
          loadImage(markerField),
          loadImage(markerImagery),
        ]);

        map.current.addImage("mapMarker", defaultIcon, { pixelRatio: 2 });
        map.current.addImage("marker-tasking-manager", taskingIcon, {
          pixelRatio: 2,
        });
        map.current.addImage("marker-drone-tasking-manager", droneIcon, {
          pixelRatio: 2,
        });
        map.current.addImage("marker-fair", fairIcon, { pixelRatio: 2 });
        map.current.addImage("marker-field", fieldIcon, { pixelRatio: 2 });
        map.current.addImage("marker-imagery", imageryIcon, { pixelRatio: 2 });
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

  // Update map data
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const source = map.current.getSource(
      "projects"
    ) as maplibregl.GeoJSONSource;

    if (source) {
      // Update existing source
      source.setData(mapResults || { type: "FeatureCollection", features: [] });
    } else {
      // Add layers for the first time
      addMapLayers(map.current, mapResults, onProjectClick, setSelectedProject);
    }
  }, [mapResults, mapLoaded, onProjectClick]);

  return (
    <div className="relative w-full h-full">
      <ProjectsMapSearchBox map={map.current} position="top-right" />
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
      />
      {selectedProject && (
        <div className="absolute top-4 right-4 z-10 animate-in slide-in-from-right duration-300">
          <ProjectsMapCallout
            projectId={selectedProject.projectId}
            projectName={selectedProject.projectName}
            status={selectedProject.status}
            onViewDetails={() => {
              window.dispatchEvent(
                new CustomEvent("viewProject", {
                  detail: { projectId: selectedProject.projectId },
                })
              );
            }}
            onClose={() => setSelectedProject(null)}
          />
        </div>
      )}
    </div>
  );
}
