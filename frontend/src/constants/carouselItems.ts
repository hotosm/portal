import imageryImage from "../assets/images/imagery-portal.png";
import mappingImage from "../assets/images/mapping-portal.png";
import mapuseImage from "../assets/images/mapuse-portal.jpg";

export interface CarouselItem {
  title: string;
  description: string;
  link: string;
  image: string;
}

export const carouselItems: CarouselItem[] = [
  {
    title: "Imagery",
    description:
      "Local residents use accessible drones and generate consistent, high-quality imagery.",
    link: "#",
    image: imageryImage,
  },
  {
    title: "Mapping",
    description:
      "Local residents use accessible drones and generate consistent, high-quality imagery.",
    link: "#",
    image: mappingImage,
  },
  {
    title: "Field",
    description:
      "Local residents use accessible drones and generate consistent, high-quality imagery.",
    link: "#",
    image: imageryImage,
  },
  {
    title: "Data",
    description:
      "Local residents use accessible drones and generate consistent, high-quality imagery.",
    link: "#",
    image: imageryImage,
  },
];
