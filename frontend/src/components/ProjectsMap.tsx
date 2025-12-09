import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapMarkerSvg from "../assets/images/map-marker.svg";
import markerTasking from "../assets/images/marker-tasking-manager.svg";
import markerDroneTasking from "../assets/images/marker-drone-tasking-manager.svg";
import markerFair from "../assets/images/marker-fair.svg";
import markerField from "../assets/images/marker-field.svg";
import markerImagery from "../assets/images/marker-imagery.svg";
import { ProjectsMapSearchBox } from "./ProjectsMapSearchBox";
import { ProjectsMapCallout } from "./ProjectsMapCallout";
import { ProjectsMapResults } from "../types/projectsMap/taskingManager";

interface SelectedProject {
  projectId: number | string;
  product: "tasking-manager" | "drone-tasking-manager" | "fair" | "field" | "imagery";
}

interface ProjectsMapProps {
  mapResults?: ProjectsMapResults;
  onProjectClick?: (projectId: number | string, product: string) => void;
  selectedProject?: SelectedProject | null;
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
  onProjectClick?: (projectId: number | string, product: string) => void
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
  selectedProject,
  onCloseDetails,
}: ProjectsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: DEFAULT_MAP_STYLE,
      center: [0, 0],
      zoom: 1.5,
      attributionControl: false,
      scrollZoom: true, //  mouse wheel zoom
    });

    map.current.addControl(
      new maplibregl.AttributionControl({ compact: false })
    );

    map.current.addControl(new maplibregl.NavigationControl(), "bottom-right");

    // TODO: Add language control compatible with MapLibre
    // try {
    //   map.current.addControl(new MapboxLanguage({ defaultLanguage: "en" }));
    // } catch (e) {
    //   console.warn("MapboxLanguage control not compatible with MapLibre", e);
    // }

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
      addMapLayers(map.current, mapResults, onProjectClick);
    }
  }, [mapResults, mapLoaded, onProjectClick]);

  return (
    <div className="relative w-full h-full">
      <ProjectsMapSearchBox map={map.current} position="top-right" />
      <div ref={mapContainer} className="w-full h-full overflow-hidden" />
      {selectedProject && (
        <div className="absolute top-0 right-0 h-full bg-white p-lg border border-hot-gray-100 z-10 animate-in w-[250px] sm:w-[340px] slide-in-from-right duration-300 overflow-y-auto">
          <ProjectsMapCallout
            projectId={selectedProject.projectId}
            product={selectedProject.product}
            onViewDetails={() => {
              window.dispatchEvent(
                new CustomEvent("viewProject", {
                  detail: {
                    projectId: selectedProject.projectId,
                    product: selectedProject.product,
                  },
                })
              );
            }}
            onClose={onCloseDetails || (() => {})}
          />
        </div>
      )}
    </div>
  );
}
