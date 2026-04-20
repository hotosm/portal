import { useQuery } from "@tanstack/react-query";
import type { ProjectDetails, NormalizedProjectDetails } from "../types/projectsMap";

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

function normalizeProjectDetails(data: ProjectDetails, projectId: number): NormalizedProjectDetails {
  const metadata = [];
  
  if (data.organisationName) {
    metadata.push({ label: "Organisation", value: data.organisationName });
  }
  
  if (data.percentMapped !== undefined) {
    metadata.push({ label: "Mapped", value: `${data.percentMapped}%` });
  }
  
  if (data.percentValidated !== undefined) {
    metadata.push({ label: "Validated", value: `${data.percentValidated}%` });
  }

  return {
    id: projectId,
    name: data.projectInfo?.name || `Project #${projectId}`,
    productName: "Tasking Manager",
    description: data.projectInfo?.description,
    url: `https://tasks.hotosm.org/projects/${projectId}`,
    metadata: metadata.length > 0 ? metadata : undefined,
  };
}

export function useProjectDetails(projectId: number | null) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const data = await fetchProjectDetails(projectId!);
      return normalizeProjectDetails(data, projectId!);
    },
    enabled: projectId !== null,
  });
}
