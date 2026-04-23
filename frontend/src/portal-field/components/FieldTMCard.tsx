import CardProjectTitle from "../../components/shared/CardProjectTitle";
import Tag from "../../components/shared/Tag";
import type { FieldTMProject } from "../types";
import placeholder from "../../assets/images/placeholder.png";

const FieldTMCard = ({ project }: { project: FieldTMProject }) => {
  return (
    <div className="w-full h-full bg-white rounded-xl shadow-[0_0_14px_rgba(0,0,0,0.2)] p-md flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <div className="relative">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-[160px] object-cover"
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

export default FieldTMCard;
