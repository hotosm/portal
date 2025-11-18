import demo1 from "../assets/images/demo/demo1.png";
import demo2 from "../assets/images/demo/demo2.png";
import demo3 from "../assets/images/demo/demo3.png";

export interface IUMapProject {
  id: number;
  title: string;
  href: string;
  status: "draft" | "published";
  image: string;
  accuracy: number;
}

export function getUMapProjects(): IUMapProject[] {
  return [
    {
      id: 1,
      title: "Formation de la communauté d'OSM Morocco: Laayoune",
      href: "/",
      status: "published",
      image: demo1,
      accuracy: Math.floor(Math.random() * 101),
    },
    {
      id: 2,
      title: "Serbia - Novi Pazar Sustainable Development Project",
      href: "/",
      status: "draft",
      image: demo3,
      accuracy: Math.floor(Math.random() * 101),
    },
    {
      id: 3,
      title: "Missing Maps: Thompson, MB",
      href: "/",
      status: "published",
      image: demo2,
      accuracy: Math.floor(Math.random() * 101),
    },
  ];
}
