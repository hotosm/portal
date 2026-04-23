import { IImageryProject } from "../types";
import placeholder from "../../assets/images/placeholder.png";
import CardProjectTitle from "../../components/shared/CardProjectTitle";

interface ImageryCardProps {
  project: IImageryProject;
}

const ImageryCard = ({ project }: ImageryCardProps) => {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-48 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />
        <CardProjectTitle title={project.title} href={project.href} />
      </div>
    </div>
  );
};

export default ImageryCard;
