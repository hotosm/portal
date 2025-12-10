import Tag from "../../components/shared/Tag";
import type { IDataProject } from "../dataProjects";

interface DataCardProps {
  project: IDataProject;
}

const DataCard = ({ project }: DataCardProps) => {
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
        <div>
          <p className="bold line-clamp-2">{project.title}</p>
          {project.accuracy !== null && (
            <strong className="text-sm text-gray-600">
              Accuracy: {project.accuracy}%
            </strong>
          )}
        </div>
      </div>
    </a>
  );
};

export default DataCard;
