export interface ProjectInfoLocale {
  locale: string;
  name: string;
  description?: string;
  shortDescription?: string;
  instructions?: string;
}

export interface ProjectInfo {
  locale: string;
  name: string;
  description?: string;
  shortDescription?: string;
  instructions?: string;
}

export interface ProjectDetails {
  organisationName?: string;
  organisationSlug?: string;
  projectInfo?: ProjectInfo;
  projectInfoLocales?: ProjectInfoLocale[];
  created?: string;
  percentMapped?: number;
  percentValidated?: number;
  percentBadImagery?: number;
}

export interface ProjectMapFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    projectId: number;
    name?: string | null;
  };
}

export interface ProjectsMapResults {
  type: "FeatureCollection";
  features: ProjectMapFeature[];
}
