import { useQuery } from "@tanstack/react-query";
import type { DroneProjectDetails } from "../types/projectsMap/taskingManager";

async function fetchDroneProjectDetails(
  projectId: string
): Promise<DroneProjectDetails> {
  const response = await fetch(
    `/api/drone-tasking-manager/projects/${projectId}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch drone project details:", errorText);
    throw new Error(`Failed to fetch drone project ${projectId}`);
  }

  const data = await response.json();
  return data;
}

export function useDroneProjectDetails(projectId: string | null) {
  return useQuery({
    queryKey: ["drone-project", projectId],
    queryFn: () => fetchDroneProjectDetails(projectId!),
    enabled: projectId !== null,
  });
}