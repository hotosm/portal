import markerTasking from "../assets/images/marker-tasking-manager.svg";
import markerDroneTasking from "../assets/images/marker-drone-tasking-manager.svg";
import markerFair from "../assets/images/marker-fair.svg";
import markerField from "../assets/images/marker-field.svg";
import markerImagery from "../assets/images/marker-imagery.svg";
import { ProductConfig } from "../types/projectsMap/products";

export function getProductConfig(product?: string): ProductConfig {
  switch (product) {
    case "tasking-manager":
      return { name: "Tasking Manager", icon: markerTasking };
    case "drone-tasking-manager":
      return { name: "Drone Tasking Manager", icon: markerDroneTasking };
    case "fair":
      return { name: "fAIr", icon: markerFair };
    case "field":
      return { name: "Field Mapping", icon: markerField };
    case "imagery":
      return { name: "Open Aerial Map", icon: markerImagery };
    default:
      return { name: "Unknown", icon: markerTasking };
  }
}
