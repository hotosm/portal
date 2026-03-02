import { useQuery } from "@tanstack/react-query";
import type { ProjectsMapResults } from "../types/projectsMap";

async function fetchProjects(): Promise<ProjectsMapResults> {
  const response = await fetch("/api/homepage-map/projects/snapshot");

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch homepage map projects: ${errorText}`);
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
