import { useQuery } from "@tanstack/react-query";
import { getChatMapBaseUrl } from "../../utils/envConfig";
<<<<<<< HEAD
=======
import type { ChatMapProject } from "../types";
import placeholderImage from "../../assets/images/demo/demo1.png";
import { useAuth } from "../../contexts/AuthContext";
>>>>>>> develop

export interface ChatMapFeature {
  type: "Feature";
  properties: {
    time: string | null;
    username_id: string | null;
    message: string | null;
    file: string | null;
    id: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface ChatMapResponse {
  id: string;
  sharing: "private" | "public";
  type: "FeatureCollection";
  features: ChatMapFeature[];
}

export interface ChatMapProject {
  id: string;
  title: string;
  href: string;
  pointCount: number;
  sharing: "private" | "public";
}

function mapChatMapToProject(data: ChatMapResponse): ChatMapProject {
  return {
    id: data.id,
    title: `My ChatMap (${data.features.length} points)`,
    href: getChatMapBaseUrl(),
    pointCount: data.features.length,
    sharing: data.sharing,
  };
}

export function useChatMapData() {
  const { isLogin } = useAuth();
  return useQuery({
    queryKey: ["chatmap", "my-map"],
    queryFn: async (): Promise<ChatMapProject | null> => {
      try {
        const response = await fetch("/api/chatmap/map", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            return null;
          }
          console.error("Error fetching chatmap:", await response.text());
          return null;
        }

        const data: ChatMapResponse = await response.json();
        return mapChatMapToProject(data);
      } catch (error) {
        console.error("Error fetching chatmap:", error);
        return null;
      }
    },
<<<<<<< HEAD
=======
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: isLogin,
>>>>>>> develop
  });
}
