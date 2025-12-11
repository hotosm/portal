export type ProductType =
  | "tasking-manager"
  | "drone-tasking-manager"
  | "fair"
  | "field"
  | "imagery";

export interface ProductConfig {
  name: string;
  icon: string;
}
