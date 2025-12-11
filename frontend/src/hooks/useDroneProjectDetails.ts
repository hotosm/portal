import { useQuery } from "@tanstack/react-query";
import type { DroneProjectDetails, NormalizedProjectDetails } from "../types/projectsMap";

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

function normalizeDroneProjectDetails(data: DroneProjectDetails, projectId: string): NormalizedProjectDetails {
  const metadata = [];
  
  if (data.author_name) {
    metadata.push({ label: "Author", value: data.author_name });
  }
  
  if (data.total_task_count && data.total_task_count > 0) {
    const completedTasks = data.completed_task_count || 0;
    const progressPercent = Math.round((completedTasks / data.total_task_count) * 100);
    metadata.push({ 
      label: "Progress", 
      value: `${progressPercent}% (${completedTasks}/${data.total_task_count} tasks)` 
    });
  }

  return {
    id: projectId,
    name: data.name || `Drone Project #${projectId}`,
    productName: "Drone Tasking Manager",
    description: data.description,
    url: `https://dronetm.org/projects/${projectId}`,
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

export function useDroneProjectDetails(projectId: string | null) {
  return useQuery({
    queryKey: ["drone-project", projectId],
    queryFn: async () => {
      const data = await fetchDroneProjectDetails(projectId!);
      return normalizeDroneProjectDetails(data, projectId!);
    },
    enabled: projectId !== null,
  });
}
