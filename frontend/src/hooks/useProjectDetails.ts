import { useQuery } from "@tanstack/react-query";
import type { ProjectDetails } from "../types/projectsMap/taskingManager";

async function fetchProjectDetails(projectId: number): Promise<ProjectDetails> {
  const response = await fetch(`/api/tasking-manager/projectid/${projectId}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch project details:", errorText);
    throw new Error(`Failed to fetch project ${projectId}`);
  }

  const data = await response.json();
  return data;
}

export function useProjectDetails(projectId: number | null) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProjectDetails(projectId!),
    enabled: projectId !== null,
  });
}
