import { useQuery } from "@tanstack/react-query";
import type { IUMapProject } from "../umapProjects";

// API response types
interface UMapMapResponse {
  id: string;
  slug: string;
  href: string;
  url: string;
}

interface UMapMapsResponse {
  maps: UMapMapResponse[];
}

interface UMapTemplatesResponse {
  templates: UMapMapResponse[];
}

// Convert API response to IUMapProject format
function mapToUMapProject(
  item: UMapMapResponse,
  isTemplate: boolean = false
): IUMapProject {
  return {
    id: parseInt(item.id, 10) || 0,
    title: item.slug.replace(/_\d+$/, "").replace(/-/g, " ") || `Map ${item.id}`,
    href: item.url,
    status: isTemplate ? "published" : "draft",
    image: "", // uMap doesn't provide thumbnails via API
    accuracy: 0,
  };
}

export function useMyMaps() {
  return useQuery({
    queryKey: ["umap", "my-maps"],
    queryFn: async (): Promise<IUMapProject[]> => {
      try {
        const response = await fetch("/api/umap/user/maps");

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // User not authenticated - return empty array
            return [];
          }
          console.error("Error fetching uMap maps:", await response.text());
          return [];
        }

        const data: UMapMapsResponse = await response.json();
        const maps = data.maps || [];
        return maps.map((m) => mapToUMapProject(m, false));
      } catch (error) {
        console.error("Error fetching uMap maps:", error);
        return [];
      }
    },
  });
}

export function useMyTemplates() {
  return useQuery({
    queryKey: ["umap", "my-templates"],
    queryFn: async (): Promise<IUMapProject[]> => {
      try {
        const response = await fetch("/api/umap/user/templates");

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // User not authenticated - return empty array
            return [];
          }
          console.error("Error fetching uMap templates:", await response.text());
          return [];
        }

        const data: UMapTemplatesResponse = await response.json();
        const templates = data.templates || [];
        return templates.map((t) => mapToUMapProject(t, true));
      } catch (error) {
        console.error("Error fetching uMap templates:", error);
        return [];
      }
    },
  });
}

// Combined hook that returns both maps and templates
export function useUMapData() {
  const mapsQuery = useMyMaps();
  const templatesQuery = useMyTemplates();

  return {
    maps: mapsQuery.data || [],
    templates: templatesQuery.data || [],
    isLoading: mapsQuery.isLoading || templatesQuery.isLoading,
    error: mapsQuery.error || templatesQuery.error,
    mapsQuery,
    templatesQuery,
  };
}
