import CardProjectTitle from "../../components/shared/CardProjectTitle";
import Tag from "../../components/shared/Tag";
<<<<<<< HEAD:frontend/src/portal-mapping/components/UMapCard.tsx
=======
import type { FieldTMProject } from "../types";
import placeholder from "../../assets/images/placeholder.png";
>>>>>>> develop:frontend/src/portal-field/components/FieldTMCard.tsx

// TODO check cards can be shared in different domains
const UMapCard = ({ project }: any) => {
  return (
<<<<<<< HEAD:frontend/src/portal-mapping/components/UMapCard.tsx
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
            alt={project.name}
            className="w-full h-auto"
=======
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
>>>>>>> develop:frontend/src/portal-field/components/FieldTMCard.tsx
          />
          <Tag
            variant={project.status === "draft" ? "neutral" : "success"}
            className="absolute top-1 right-1 z-10 capitalize"
          >
            {project.status}
          </Tag>
        </div>
<<<<<<< HEAD:frontend/src/portal-mapping/components/UMapCard.tsx
        <p className="bold line-clamp-2">{project.title}</p>
=======
        <CardProjectTitle href={project.href} title={project.title} />
>>>>>>> develop:frontend/src/portal-field/components/FieldTMCard.tsx
      </div>
    </div>
  );
};

export default UMapCard;
