import { useQuery } from "@tanstack/react-query";
import type { OAMImagery } from "../types/projectsMap/taskingManager";

async function fetchOAMProjectDetails(projectId: string): Promise<OAMImagery> {
  const response = await fetch(`/api/open-aerial-map/projects/${projectId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch OAM project details:", errorText);
    throw new Error(`Failed to fetch OAM project ${projectId}`);
  }

  const data = await response.json();
  // The API returns { meta, results } where results is the single imagery object
  return data.results;
}

export function useOAMProjectDetails(projectId: string | null) {
  return useQuery({
    queryKey: ["oam-project", projectId],
    queryFn: () => fetchOAMProjectDetails(projectId!),
    enabled: projectId !== null,
  });
}