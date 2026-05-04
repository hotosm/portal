import CardProjectTitle from "../../components/shared/CardProjectTitle";
import Tag from "../../components/shared/Tag";
import { IFairProject } from "../types";
import placeholder from "../../assets/images/placeholder.png";
import { osmTileUrl } from "../../utils/osmTiles";

interface FairCardProps {
  project: IFairProject;
}

const FairProjectCard = ({ project }: FairCardProps) => {
  const thumbnailSrc =
    project.image !== placeholder && project.image
      ? project.image
      : project.centroid
        ? osmTileUrl(project.centroid[0], project.centroid[1])
        : placeholder;

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <div className="relative">
          <img
            src={thumbnailSrc}
            alt={project.title}
            className="w-full h-[147px] object-cover"
            onError={(e) => {
              e.currentTarget.src = placeholder;
            }}
          />
          <Tag
            variant={project.status === "draft" ? "neutral" : "success"}
            className="absolute top-1 right-1 z-10 capitalize"
          >
            {project.status}
          </Tag>
        </div>
        <CardProjectTitle href={project.href} title={project.title} />
      </div>
    </div>
  );
};

export default FairProjectCard;
