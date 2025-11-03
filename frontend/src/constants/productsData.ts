import { m } from "../paraglide/messages";
import { getLocale } from "../paraglide/runtime";

export interface Product {
  id: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  section: "imagery" | "mapping" | "mapUse";
}
export function getProductsData(): Product[] {
  const locale = getLocale();
  return [
    {
      id: "drone",
      title: m.products_drone_title({}, { locale }),
      description: m.products_drone_description({}, { locale }),
      iconName: "layer-group",
      href: "/drone",
      section: "imagery",
    },
    {
      id: "oam",
      title: m.products_oam_title({}, { locale }),
      description: m.products_oam_description({}, { locale }),
      iconName: "mobile-screen-button",
      href: "/osm",
      section: "imagery",
    },
    {
      id: "tasking-manager",
      title: m.products_taskingManager_title({}, { locale }),
      description: m.products_taskingManager_description({}, { locale }),
      iconName: "laptop",
      href: "/tasking-manager",
      section: "imagery",
    },
    {
      id: "fair",
      title: m.products_fair_title({}, { locale }),
      description: m.products_fair_description({}, { locale }),
      iconName: "hexagon-nodes",
      href: "/fair",
      section: "mapping",
    },
    {
      id: "field",
      title: m.products_field_title({}, { locale }),
      description: m.products_field_description({}, { locale }),
      iconName: "mobile-screen-button",
      href: "/field",
      section: "mapping",
    },
    {
      id: "chat-map",
      title: m.products_chatmap_title({}, { locale }),
      description: m.products_chatmap_description({}, { locale }),
      iconName: "hexagon-nodes",
      href: "/fair",
      section: "mapUse",
    },
    {
      id: "export-tool",
      title: m.products_exportTool_title({}, { locale }),
      description: m.products_exportTool_description({}, { locale }),
      iconName: "download",
      href: "/export-tool",
      section: "mapUse",
    },
    {
      id: "umap",
      title: m.products_umap_title({}, { locale }),
      description: m.products_umap_description({}, { locale }),
      iconName: "pen-to-square",
      href: "/umap",
      section: "mapUse",
    },
  ];
}
// Always use getProductsData() to get fresh translations
export const productsData = getProductsData;
