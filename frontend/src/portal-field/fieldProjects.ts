import field1 from "../assets/images/demo/field1.png";
import field2 from "../assets/images/demo/field2.png";
import field3 from "../assets/images/demo/field3.png";

export interface FieldProduct {
  id: number;
  title: string;
  href: string;
  logo: string;
}

export function getFieldProjects(): FieldProduct[] {
  return [
    {
      id: 1,
      title: "Formation de la communauté d'OSM Morocco",
      href: "/",
      logo: field1,
    },
    {
      id: 2,
      title: "Serbia - Novi Pazar Sustainable Development Project",
      href: "/",
      logo: field2,
    },
    {
      id: 3,
      title: "Missing Maps: Thompson, MB",
      href: "/",
      logo: field3,
    },
  ];
}
