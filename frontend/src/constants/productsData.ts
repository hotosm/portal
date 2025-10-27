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
      title: m.products_drone_title(),
      subtitle: m.products_drone_subtitle(),
      iconName: "layer-group",
      href: "/drone",
    },
    {
      id: "field",
      title: m.products_field_title(),
      subtitle: m.products_field_subtitle(),
      iconName: "mobile-screen-button",
      href: "/field",
    },
    {
      id: "tasking-manager",
      title: m.products_taskingManager_title(),
      subtitle: m.products_taskingManager_subtitle(),
      iconName: "laptop",
      href: "/tasking-manager",
    },
    {
      id: "fair",
      title: m.products_fair_title(),
      subtitle: m.products_fair_subtitle(),
      iconName: "hexagon-nodes",
      href: "/fair",
    },
    {
      id: "export-tool",
      title: m.products_exportTool_title(),
      subtitle: m.products_exportTool_subtitle(),
      iconName: "download",
      href: "/export-tool",
    },
    {
      id: "umap",
      title: m.products_umap_title(),
      subtitle: m.products_umap_subtitle(),
      iconName: "pen-to-square",
      href: "/umap",
    },
  ];
}

// Always use getProductsData() to get fresh translations
export const productsData = getProductsData;
