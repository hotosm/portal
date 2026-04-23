import CardProjectTitle from "../../components/shared/CardProjectTitle";
import Tag from "../../components/shared/Tag";
import { ChatMapProject } from "../types";
import placeholder from "../../assets/images/placeholder.png";

const ChatMapCard = ({ project }: { project: ChatMapProject }) => {
  return (
    <div
      className="w-full h-full bg-white rounded-xl p-md flex flex-col gap-lg"
      style={{ boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.25)" }}
    >
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

export default ChatMapCard;
