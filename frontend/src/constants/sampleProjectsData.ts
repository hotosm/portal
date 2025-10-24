// Sample projects data for the map
// In production, this will be fetched from the HOT API

export type ProductType = "tasking-manager" | "drone-tasking-manager" | "fair" | "field" | "imagery";

export const sampleProjectsData = {
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [-0.1276, 51.5074], // London
      },
      properties: {
        projectId: 1,
        name: "London Mapping Project",
        status: "PUBLISHED",
        product: "tasking-manager" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [2.3522, 48.8566], // Paris
      },
      properties: {
        projectId: 2,
        name: "Paris Urban Mapping",
        status: "PUBLISHED",
        product: "drone-tasking-manager" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [-74.006, 40.7128], // New York
      },
      properties: {
        projectId: 3,
        name: "NYC Building Mapping",
        status: "PUBLISHED",
        product: "fair" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [139.6917, 35.6895], // Tokyo
      },
      properties: {
        projectId: 4,
        name: "Tokyo Infrastructure",
        status: "PUBLISHED",
        product: "field" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [151.2093, -33.8688], // Sydney
      },
      properties: {
        projectId: 5,
        name: "Sydney Coastal Mapping",
        status: "PUBLISHED",
        product: "imagery" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [-99.1332, 19.4326], // Mexico City
      },
      properties: {
        projectId: 6,
        name: "Mexico City Roads",
        status: "PUBLISHED",
        product: "tasking-manager" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [28.0473, -26.2041], // Johannesburg
      },
      properties: {
        projectId: 7,
        name: "Johannesburg Community Mapping",
        status: "PUBLISHED",
        product: "drone-tasking-manager" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [77.2090, 28.6139], // New Delhi
      },
      properties: {
        projectId: 8,
        name: "Delhi Urban Development",
        status: "PUBLISHED",
        product: "fair" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [-46.6333, -23.5505], // São Paulo
      },
      properties: {
        projectId: 9,
        name: "São Paulo Favela Mapping",
        status: "PUBLISHED",
        product: "field" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [37.6173, 55.7558], // Moscow
      },
      properties: {
        projectId: 10,
        name: "Moscow Transit Mapping",
        status: "PUBLISHED",
        product: "imagery" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [121.4737, 31.2304], // Shanghai
      },
      properties: {
        projectId: 11,
        name: "Shanghai Building Survey",
        status: "PUBLISHED",
        product: "tasking-manager" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [3.3792, 6.5244], // Lagos
      },
      properties: {
        projectId: 12,
        name: "Lagos Emergency Mapping",
        status: "PUBLISHED",
        product: "drone-tasking-manager" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [-58.3816, -34.6037], // Buenos Aires
      },
      properties: {
        projectId: 13,
        name: "Buenos Aires Urban Planning",
        status: "PUBLISHED",
        product: "fair" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [31.2357, 30.0444], // Cairo
      },
      properties: {
        projectId: 14,
        name: "Cairo Heritage Sites",
        status: "PUBLISHED",
        product: "field" as ProductType,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [103.8198, 1.3521], // Singapore
      },
      properties: {
        projectId: 15,
        name: "Singapore Complete Mapping",
        status: "PUBLISHED",
        product: "imagery" as ProductType,
      },
    },
  ],
};
