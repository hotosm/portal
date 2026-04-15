export type ProductType =
  | "tasking-manager"
  | "drone-tasking-manager"
  | "fair"
  | "field"
  | "imagery"
  | "umap"
  | "chatmap";

export interface ProductConfig {
  name: string;
  icon: string;
}
