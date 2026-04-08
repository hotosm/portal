import { useQuery } from "@tanstack/react-query";
import type { IUMapProject } from "../types";
import { getUmapBaseUrl } from "../../utils/envConfig";
import placeholderImage from "../../assets/images/demo/demo1.png";

interface UMapMap {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  url: string;
  modified_at: string;
}

function mapToProject(item: UMapMap): IUMapProject {
  return {
    id: item.id,
    title: item.name,
    href: `${getUmapBaseUrl()}${item.url}`,
    status: "published",
    image: placeholderImage,
    accuracy: 0,
  };
}

export function useMyMaps() {
  return useQuery({
    queryKey: ["umap", "my-maps"],
    queryFn: async (): Promise<IUMapProject[]> => {
      const response = await fetch("/api/umap/user/maps", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return [];
        throw new Error(`[${response.status}] Failed to fetch uMap maps`);
      }

      const data: { maps: UMapMap[] } = await response.json();
      return (data.maps ?? []).map(mapToProject);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
