import { useQuery } from "@tanstack/react-query";
import { getChatMapBaseUrl } from "../../utils/envConfig";
import type { ChatMapProject } from "../types";
import placeholderImage from "../../assets/images/demo/demo1.png";

interface ChatMap {
  id: string;
  name: string;
  updated_at: string;
  sharing: "private" | "public";
  count: number;
  centroid: [number, number] | null;
}

function mapToProject(item: ChatMap): ChatMapProject {
  return {
    id: item.id,
    title: item.name,
    href: `${getChatMapBaseUrl()}/map/${item.id}`,
    status: item.sharing === "public" ? "published" : "draft",
    image: placeholderImage,
    count: item.count,
  };
}

export function useChatMapData() {
  return useQuery({
    queryKey: ["chatmap", "my-maps"],
    queryFn: async (): Promise<ChatMapProject[]> => {
      const response = await fetch("/api/chatmap/user/maps", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return [];
        throw new Error(`[${response.status}] Failed to fetch ChatMap maps`);
      }

      const data: { maps: ChatMap[] } = await response.json();
      return (data.maps ?? []).map(mapToProject);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
