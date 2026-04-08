import Tag from "../../components/shared/Tag";
import type { FieldTMProject } from "../types";

const FieldTMCard = ({ project }: { project: FieldTMProject }) => {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-xl border border-hot-gray-200 flex flex-col overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01]">
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
        <p className="font-bold line-clamp-2 p-md mb-0">{project.title}</p>
      </div>
    </a>
  );
};

export default FieldTMCard;
