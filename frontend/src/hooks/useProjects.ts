import { useQuery } from "@tanstack/react-query";
import { buildApiEndpoint } from "../services/api";
import type { ProjectsMapResults } from "../types/projectsMap";

async function fetchProjects(): Promise<ProjectsMapResults> {
  const endpoint = buildApiEndpoint("/homepage-map/projects/snapshot");
  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch homepage map projects: ${errorText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const responsePreview = (await response.text()).slice(0, 120);
    throw new Error(
      `Homepage map endpoint returned non-JSON content (${contentType}): ${responsePreview}`,
    );
  }

  return response.json();
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects", "db-snapshot"],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
