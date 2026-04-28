import { useQuery } from "@tanstack/react-query";
import type { IUMapProject } from "../types";
import { getUmapBaseUrl } from "../../utils/envConfig";
import placeholderImage from "../../assets/images/demo/demo1.png";
import { useAuth } from "../../contexts/AuthContext";

const MAPS_PER_PAGE = 6;

interface UMapMap {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  url: string;
  modified_at: string;
}

interface PaginatedMaps {
  items: IUMapProject[];
  total: number;
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

export function useMyMaps(page = 1, limit = MAPS_PER_PAGE) {
  const { isLogin } = useAuth();
  const offset = (page - 1) * limit;
  return useQuery({
    queryKey: ["umap", "my-maps", page, limit],
    queryFn: async (): Promise<PaginatedMaps> => {
      const response = await fetch(
        `/api/umap/user/maps?limit=${limit}&offset=${offset}`,
        { credentials: "include" },
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403)
          return { items: [], total: 0 };
        throw new Error(`[${response.status}] Failed to fetch uMap maps`);
      }

      const data: { maps: UMapMap[]; total: number } = await response.json();
      return {
        items: (data.maps ?? []).map(mapToProject),
        total: data.total ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: isLogin,
  });
}
