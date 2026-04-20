import Tag from "../../components/shared/Tag";
import { IFairProject } from "../types";

interface FairCardProps {
  project: IFairProject;
}

const FairProjectCard = ({ project }: FairCardProps) => {
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col gap-lg">
        <div className="relative">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-[147px] object-cover"
          />
          <Tag
            variant={project.status === "draft" ? "neutral" : "success"}
            className="absolute top-1 right-1 z-10 capitalize"
          >
            {project.status}
          </Tag>
        </div>
        <div>
          <span className="bold line-clamp-2">{project.title}</span>
        </div>
      </div>
    </a>
  );
};

export default FairProjectCard;
