import { AppName } from "./types";
import { m } from "../paraglide/messages";

export const PLAN_SECTIONS: {
  title: string;
  toolName: string;
  apps: AppName[];
}[] = [
  {
    title: m.section_imagery(),
    toolName: "<em>Drone</em> Tasking Manager, <em>OpenAerialMap</em>",
    apps: ["drone-tasking-manager", "open-aerial-map"],
  },
  {
    title: m.section_mapping(),
    toolName: "<em>Tasking Manager</em>, <em>fAIr</em>",
    apps: ["tasking-manager", "fair"],
  },
  {
    title: m.section_field(),
    toolName: "<em>Field</em> Tasking Manager, <em>ChatMap</em>",
    apps: ["field-tm", "chatmap"],
  },
  {
    title: m.section_data(),
    toolName: "<em>Export Tool</em>, <em>uMap</em>",
    apps: ["export-tool", "umap"],
  },
];
