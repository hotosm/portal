export interface Product {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  href: string;
}

export const productsData: Product[] = [
  {
    id: "drone",
    title: "Drone",
    subtitle: "Tasking Manager and OpenAerialMap",
    iconName: "layer-group",
    href: "/drone",
  },
  {
    id: "field",
    title: "Field",
    subtitle: "Tasking Manager and ChatMap",
    iconName: "mobile-screen-button",
    href: "/field",
  },
  {
    id: "tasking-manager",
    title: "Tasking Manager",
    subtitle: "Remote mapping",
    iconName: "laptop",
    href: "/tasking-manager",
  },
  {
    id: "fair",
    title: "fAIr",
    subtitle: "AI-assisted mapping",
    iconName: "hexagon-nodes",
    href: "/fair",
  },
  {
    id: "export-tool",
    title: "Export Tool",
    subtitle: "Export OSM data",
    iconName: "download",
    href: "/export-tool",
  },
  {
    id: "umap",
    title: "uMap",
    subtitle: "Create maps easily",
    iconName: "pen-to-square",
    href: "/umap",
  },
];
