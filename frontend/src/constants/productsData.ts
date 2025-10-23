import { m } from "../paraglide/messages";

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  href: string;
}

export function getProductsData(): Product[] {
  return [
    {
      id: "drone",
      title: m["products.drone.title"](),
      subtitle: m["products.drone.subtitle"](),
      iconName: "layer-group",
      href: "/drone",
    },
    {
      id: "field",
      title: m["products.field.title"](),
      subtitle: m["products.field.subtitle"](),
      iconName: "mobile-screen-button",
      href: "/field",
    },
    {
      id: "tasking-manager",
      title: m["products.taskingManager.title"](),
      subtitle: m["products.taskingManager.subtitle"](),
      iconName: "laptop",
      href: "/tasking-manager",
    },
    {
      id: "fair",
      title: m["products.fair.title"](),
      subtitle: m["products.fair.subtitle"](),
      iconName: "hexagon-nodes",
      href: "/fair",
    },
    {
      id: "export-tool",
      title: m["products.exportTool.title"](),
      subtitle: m["products.exportTool.subtitle"](),
      iconName: "download",
      href: "/export-tool",
    },
    {
      id: "umap",
      title: m["products.umap.title"](),
      subtitle: m["products.umap.subtitle"](),
      iconName: "pen-to-square",
      href: "/umap",
    },
  ];
}

// Always use getProductsData() to get fresh translations
export const productsData = getProductsData;
