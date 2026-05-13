import chatIcon from "../assets/icons/chat.svg";
import droneIcon from "../assets/icons/drone.svg";
import oamIcon from "../assets/icons/oam.svg";
import tmIcon from "../assets/icons/tm.svg";
import aiIcon from "../assets/icons/ai.svg";
import fieldIcon from "../assets/icons/field.svg";
import exportIcon from "../assets/icons/export.svg";
import umapIcon from "../assets/icons/umap.svg";
import type { AppName } from "../portal-plans/types";

export const APP_META: Record<AppName, { label: string; name: string; icon: string }> = {
  chatmap: { label: "ChatMap", name: "ChatMap", icon: chatIcon },
  "drone-tasking-manager": { label: "Drone", name: "Drone Tasking Manager", icon: droneIcon },
  "open-aerial-map": { label: "Imagery", name: "OpenAerialMap", icon: oamIcon },
  "tasking-manager": { label: "Mapping", name: "Tasking Manager", icon: tmIcon },
  fair: { label: "AI-assisted Mapping", name: "fAIr", icon: aiIcon },
  "field-tm": { label: "Field", name: "Field Tasking Manager", icon: fieldIcon },
  "export-tool": { label: "Data Export", name: "Export Tool", icon: exportIcon },
  umap: { label: "Map", name: "uMap", icon: umapIcon },
};
