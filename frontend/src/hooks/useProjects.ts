import { useQuery } from '@tanstack/react-query';
import type { ProductType } from '../constants/sampleProjectsData';

interface ProjectFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    projectId: number;
    name: string;
    status: string;
    product: ProductType;
  };
}

interface ProjectsResponse {
  type: 'FeatureCollection';
  features: ProjectFeature[];
}

async function fetchProjects(): Promise<ProjectsResponse> {
  const response = await fetch(
    '/tasking-manager-api/api/v2/projects/?action=any&omitMapResults=false'
  );

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  const data = await response.json();
  
  // Transform API response to match our expected format
  const features = data.mapResults?.features?.map((feature: any) => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: feature.geometry.coordinates,
    },
    properties: {
      projectId: feature.properties.projectId,
      name: feature.properties.name || `Project ${feature.properties.projectId}`,
      status: feature.properties.projectStatus || 'PUBLISHED',
      product: 'tasking-manager' as ProductType,
    },
  })) || [];

  return {
    type: 'FeatureCollection',
    features,
  };
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
}
