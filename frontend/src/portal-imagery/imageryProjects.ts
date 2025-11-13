import { ImageryProduct } from "./imageryProjectsTypes";
import demo1 from "../assets/images/demo/demo1.png";
import demo2 from "../assets/images/demo/demo2.png";
import demo3 from "../assets/images/demo/demo3.png";
import oam1 from "../assets/images/demo/oam1.png";
import oam2 from "../assets/images/demo/oam2.png";
import oam3 from "../assets/images/demo/oam3.png";
import oam4 from "../assets/images/demo/oam4.png";

export function getImageryProjects(): ImageryProduct[] {
  return [
    {
      id: 1,
      title: "Formation de la communauté d'OSM Morocco : Laayoune",
      href: "/",
      section: "drone",
      image: demo1,
    },
    {
      id: 2,
      title: "Serbia - Novi Pazar Sustainable Development Project",
      href: "/",
      section: "drone",
      image: demo3,
    },
    {
      id: 3,
      title: "Missing Maps: Thompson, MB",
      href: "/",
      section: "drone",
      image: demo2,
    },

    {
      id: 1,
      title: "Formation de la communauté d'OSM Morocco : Laayoune",
      href: "/",
      section: "oam",
      image: oam1,
    },
    {
      id: 2,
      title: "Serbia - Novi Pazar Sustainable Development Project",
      href: "/",
      section: "oam",
      image: oam2,
    },
    {
      id: 3,
      title: "Missing Maps: Thompson, MB",
      href: "/",
      section: "oam",
      image: oam3,
    },
    {
      id: 4,
      title:
        "Shiquan Land Use Map for Youthmappers Chapter, University of Tsukuba",
      href: "/",
      section: "oam",
      image: oam4,
    },
  ];
}
