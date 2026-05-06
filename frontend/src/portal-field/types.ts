export interface ChatMapProject {
  id: string;
  title: string;
  href: string;
  status: "private" | "published";
  image: string;
  count: number;
  centroid: [number, number] | null;
}

export interface FieldTMProject {
  id: number;
  title: string;
  href: string;
  status: "draft" | "published";
  image: string;
}
