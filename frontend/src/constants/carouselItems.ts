import dronetmImage from "../assets/images/drontm-portal.jpg";
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
    image: dronetmImage,
  },
  {
    title: "Mapping",
    description:
      "Local residents use accessible drones and generate consistent, high-quality imagery.",
    link: "#",
    image: mapuseImage,
  },
  {
    title: "Field",
    description:
      "Local residents use accessible drones and generate consistent, high-quality imagery.",
    link: "#",
    image: dronetmImage,
  },
  {
    title: "Data",
    description:
      "Local residents use accessible drones and generate consistent, high-quality imagery.",
    link: "#",
    image: dronetmImage,
  },
];
