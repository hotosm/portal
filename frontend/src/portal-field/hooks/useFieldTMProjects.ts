import { useQuery } from "@tanstack/react-query";
import placeholderImage from "../../assets/images/demo/demo1.png";
import type { FieldTMProject } from "../types";

interface FieldTMApiProject {
  id: number;
  title: string;
  slug: string;
  status: string;
}

function mapToProject(item: FieldTMApiProject): FieldTMProject {
  return {
    id: item.id,
    title: item.title,
    href: `#`,
    status: item.status === "PUBLISHED" ? "published" : "draft",
    image: placeholderImage,
  };
}
// TODO check API when ready
export function useFieldTMProjects() {
  return useQuery({
    queryKey: ["fieldtm", "my-projects"],
    queryFn: async (): Promise<FieldTMProject[]> => {
      const response = await fetch("/api/fieldtm/user/projects", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return [];
        throw new Error(
          `[${response.status}] Failed to fetch Field TM projects`,
        );
      }

      const data: { projects: FieldTMApiProject[] } = await response.json();
      return (data.projects ?? []).map(mapToProject);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
