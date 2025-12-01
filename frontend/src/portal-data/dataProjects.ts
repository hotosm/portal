import demo1 from "../assets/images/demo/demo1.png";
import demo2 from "../assets/images/demo/demo2.png";
import demo3 from "../assets/images/demo/demo3.png";
import oam1 from "../assets/images/demo/oam1.png";
import oam2 from "../assets/images/demo/oam2.png";
import oam3 from "../assets/images/demo/oam3.png";
import oam4 from "../assets/images/demo/oam4.png";

export interface IDataProject {
  id: number;
  title: string;
  href: string;
  status: "draft" | "published";
  section: "model" | "set";
  image: string;
  accuracy: number;
}

export function getDataProjects(): IDataProject[] {
  return [
    {
      id: 1,
      title: "Formation de la communauté d'OSM Morocco : Laayoune",
      href: "/",
      status: "published",
      section: "model",
      image: demo1,
      accuracy: Math.floor(Math.random() * 101),
    },
    {
      id: 2,
      title: "Serbia - Novi Pazar Sustainable Development Project",
      href: "/",
      status: "draft",
      section: "model",
      image: demo3,
      accuracy: Math.floor(Math.random() * 101),
    },
    {
      id: 3,
      title: "Missing Maps: Thompson, MB",
      href: "/",
      status: "published",
      section: "model",
      image: demo2,
      accuracy: Math.floor(Math.random() * 101),
    },

    {
      id: 1,
      title: "Formation de la communauté d'OSM Morocco : Laayoune",
      href: "/",
      status: "draft",
      section: "set",
      image: oam1,
      accuracy: Math.floor(Math.random() * 101),
    },
    {
      id: 2,
      title: "Serbia - Novi Pazar Sustainable Development Project",
      href: "/",
      status: "draft",
      section: "set",
      image: oam2,
      accuracy: Math.floor(Math.random() * 101),
    },
    {
      id: 3,
      title: "Missing Maps: Thompson, MB",
      href: "/",
      status: "draft",
      section: "set",
      image: oam3,
      accuracy: Math.floor(Math.random() * 101),
    },
    {
      id: 4,
      title:
        "Shiquan Land Use Map for Youthmappers Chapter, University of Tsukuba",
      href: "/",
      status: "draft",
      section: "set",
      image: oam4,
      accuracy: Math.floor(Math.random() * 101),
    },
  ];
}
