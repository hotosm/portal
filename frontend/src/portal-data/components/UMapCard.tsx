import Tag from "../../components/shared/Tag";
import type { IUMapProject } from "../../portal-data/types";

const UMapCard = ({ project }: { project: IUMapProject }) => {
  return (
    <div
      className="w-full h-full bg-white rounded-xl p-md flex flex-col gap-lg"
      style={{ boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.25)" }}
    >
      <div className="relative">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-[160px] object-cover"
        />
        <Tag
          variant={project.status === "draft" ? "neutral" : "success"}
          className="absolute top-1 right-1 z-10 capitalize"
        >
          {project.status}
        </Tag>
      </div>
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline font-bold line-clamp-3"
      >
        {project.title}
      </a>
    </div>
  );
};

export default UMapCard;
