import { m } from "../paraglide/messages";
import { getLocale } from "../paraglide/runtime";
import droneIcon from "../assets/images/icon-drone.png";
import oamIcon from "../assets/images/icon-oam.png";
import tmIcon from "../assets/images/icon-tm.png";
import fairIcon from "../assets/images/icon-fair.png";
import fieldIcon from "../assets/images/icon-field.png";
import chatmapIcon from "../assets/images/icon-chatmap.png";
import exportIcon from "../assets/images/icon-export.png";
import umapIcon from "../assets/images/icon-umap.png";

export interface Product {
  id: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  icon: any;
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
      icon: droneIcon,
      section: "imagery",
    },
    {
      id: "oam",
      title: m.products_oam_title({}, { locale }),
      description: m.products_oam_description({}, { locale }),
      iconName: "mobile-screen-button",
      href: "/osm",
      icon: oamIcon,
      section: "imagery",
    },
    {
      id: "tasking-manager",
      title: m.products_taskingManager_title({}, { locale }),
      description: m.products_taskingManager_description({}, { locale }),
      iconName: "laptop",
      href: "/tasking-manager",
      icon: tmIcon,
      section: "imagery",
    },
    {
      id: "fair",
      title: m.products_fair_title({}, { locale }),
      description: m.products_fair_description({}, { locale }),
      iconName: "hexagon-nodes",
      href: "/fair",
      icon: fairIcon,
      section: "mapping",
    },
    {
      id: "field",
      title: m.products_field_title({}, { locale }),
      description: m.products_field_description({}, { locale }),
      iconName: "mobile-screen-button",
      href: "/field",
      icon: fieldIcon,
      section: "mapping",
    },
    {
      id: "chat-map",
      title: m.products_chatmap_title({}, { locale }),
      description: m.products_chatmap_description({}, { locale }),
      iconName: "hexagon-nodes",
      href: "/fair",
      icon: chatmapIcon,
      section: "mapUse",
    },
    {
      id: "export-tool",
      title: m.products_exportTool_title({}, { locale }),
      description: m.products_exportTool_description({}, { locale }),
      iconName: "download",
      href: "/export-tool",
      icon: exportIcon,
      section: "mapUse",
    },
    {
      id: "umap",
      title: m.products_umap_title({}, { locale }),
      description: m.products_umap_description({}, { locale }),
      iconName: "pen-to-square",
      href: "/umap",
      icon: umapIcon,
      section: "mapUse",
    },
  ];
}
// Always use getProductsData() to get fresh translations
export const productsData = getProductsData;
