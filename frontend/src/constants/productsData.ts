import { m } from "../paraglide/messages";
import { getLocale } from "../paraglide/runtime";

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  href: string;
}

export function getProductsData(): Product[] {
  const locale = getLocale();
  return [
    {
      id: "drone",
      title: m.products_drone_title({}, { locale }),
      subtitle: m.products_drone_subtitle({}, { locale }),
      iconName: "layer-group",
      href: "/drone",
    },
    {
      id: "field",
      title: m.products_field_title({}, { locale }),
      subtitle: m.products_field_subtitle({}, { locale }),
      iconName: "mobile-screen-button",
      href: "/field",
    },
    {
      id: "tasking-manager",
      title: m.products_taskingManager_title({}, { locale }),
      subtitle: m.products_taskingManager_subtitle({}, { locale }),
      iconName: "laptop",
      href: "/tasking-manager",
    },
    {
      id: "fair",
      title: m.products_fair_title({}, { locale }),
      subtitle: m.products_fair_subtitle({}, { locale }),
      iconName: "hexagon-nodes",
      href: "/fair",
    },
    {
      id: "export-tool",
      title: m.products_exportTool_title({}, { locale }),
      subtitle: m.products_exportTool_subtitle({}, { locale }),
      iconName: "download",
      href: "/export-tool",
    },
    {
      id: "umap",
      title: m.products_umap_title({}, { locale }),
      subtitle: m.products_umap_subtitle({}, { locale }),
      iconName: "pen-to-square",
      href: "/umap",
    },
  ];
}

// Always use getProductsData() to get fresh translations
export const productsData = getProductsData;
