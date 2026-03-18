import Tag from "../../components/shared/Tag";
import type { IUMapProject } from "../../portal-data/types";

const UMapCard = ({ project }: { project: IUMapProject }) => {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-lg p-md flex flex-col gap-lg shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01]">
        <div className="relative">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-auto"
          />
          <Tag
            variant={project.status === "draft" ? "neutral" : "success"}
            className="absolute top-1 right-1 z-10 capitalize"
          >
            {project.status}
          </Tag>
        </div>
        <p className="bold line-clamp-2">{project.title}</p>
      </div>
    </a>
  );
};

export default UMapCard;
