export interface ChatMapProject {
  id: string;
  title: string;
  href: string;
  status: "draft" | "published";
  image: string;
  count: number;
}

export interface FieldTMProject {
  id: number;
  title: string;
  href: string;
  status: "draft" | "published";
  image: string;
}
