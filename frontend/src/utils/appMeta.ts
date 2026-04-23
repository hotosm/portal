import droneIcon from "../assets/icons/drone.svg";
import oamIcon from "../assets/icons/oam.svg";
import tmIcon from "../assets/icons/tm.svg";
import aiIcon from "../assets/icons/ai.svg";
import fieldIcon from "../assets/icons/field.svg";
import exportIcon from "../assets/icons/export.svg";
import umapIcon from "../assets/icons/umap.svg";
import type { AppName } from "../portal-plans/types";

export const APP_META: Record<AppName, { label: string; icon: string }> = {
  "drone-tasking-manager": { label: "Drone", icon: droneIcon },
  "open-aerial-map": { label: "Imagery", icon: oamIcon },
  "tasking-manager": { label: "Mapping", icon: tmIcon },
  fair: { label: "AI-assisted Mapping", icon: aiIcon },
  "field-tm": { label: "Field", icon: fieldIcon },
  "export-tool": { label: "Data Export", icon: exportIcon },
  umap: { label: "Map", icon: umapIcon },
};
