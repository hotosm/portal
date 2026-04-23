import imageryImage from "../assets/images/carousel/imagery.webp";
import imageryImageSm from "../assets/images/carousel/imagery-sm.webp";
import mappingImage from "../assets/images/carousel/mapping.webp";
import mappingImageSm from "../assets/images/carousel/mapping-sm.webp";
import fieldImage from "../assets/images/carousel/field.webp";
import fieldImageSm from "../assets/images/carousel/field-sm.webp";
import dataImage from "../assets/images/carousel/data.webp";
import dataImageSm from "../assets/images/carousel/data-sm.webp";

export interface CarouselItem {
  title: string;
  link: string;
  image: string;
  imageSm: string;
}

export const carouselItems: CarouselItem[] = [
  {
    title: "Imagery",
    link: "#",
    image: imageryImage,
    imageSm: imageryImageSm,
  },
  {
    title: "Mapping",
    link: "#",
    image: mappingImage,
    imageSm: mappingImageSm,
  },
  {
    title: "Field",
    link: "#",
    image: fieldImage,
    imageSm: fieldImageSm,
  },
  {
    title: "Data",
    link: "#",
    image: dataImage,
    imageSm: dataImageSm,
  },
];
