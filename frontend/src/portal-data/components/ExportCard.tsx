import type { IDataProject } from "../types";
import placeholder from "../../assets/images/placeholder.png";
import CardProjectTitle from "../../components/shared/CardProjectTitle";
import { osmTileUrl } from "../../utils/osmTiles";

const ExportCard = ({ project }: { project: IDataProject }) => {
  const thumbnailSrc = project.centroid
    ? osmTileUrl(project.centroid[0], project.centroid[1])
    : placeholder;

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <img
          src={thumbnailSrc}
          alt={project.title}
          className="w-full h-48 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = placeholder;
          }}
        />
        <CardProjectTitle href={project.href} title={project.title} />
      </div>
    </div>
  );
};

export default ExportCard;
