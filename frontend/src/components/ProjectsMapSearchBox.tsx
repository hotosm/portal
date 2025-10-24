import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import MaplibreGeocoder from "@maplibre/maplibre-gl-geocoder";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";

interface ProjectsMapSearchBoxProps {
  map: maplibregl.Map | null;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function ProjectsMapSearchBox({
  map,
  position = "top-left",
}: ProjectsMapSearchBoxProps) {
  useEffect(() => {
    if (!map) return;

    // Geocoder API using Nominatim (OpenStreetMap's geocoding service)
    const geocoderApi = {
      forwardGeocode: async (config: any) => {
        const features = [];
        try {
          const request = `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&limit=5&addressdetails=1`;
          const response = await fetch(request);
          const geojson = await response.json();

          for (const feature of geojson.features) {
            const center = [
              feature.bbox[0] + (feature.bbox[2] - feature.bbox[0]) / 2,
              feature.bbox[1] + (feature.bbox[3] - feature.bbox[1]) / 2,
            ];
            const point = {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: center,
              },
              place_name: feature.properties.display_name,
              properties: feature.properties,
              text: feature.properties.display_name,
              place_type: ["place"],
              center,
            };
            features.push(point);
          }
        } catch (e) {
          console.error("Error fetching geocoding results:", e);
        }

        return { features };
      },
    };

    const geocoder = new MaplibreGeocoder(geocoderApi, {
      maplibregl: maplibregl,
      // TODO add translations
      placeholder: "Search for places...",
      zoom: 12,
      showResultsWhileTyping: true,
    });

    map.addControl(geocoder, position);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map, position]);

  return null;
}
