export type ProductType =
  | "tasking-manager"
  | "drone-tasking-manager"
  | "fair"
  | "field"
  | "imagery"
  | "umap";

export interface ProductConfig {
  name: string;
  icon: string;
}
