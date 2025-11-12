interface IMappingProjectCard {
  title: string;
  contributors: number;
  id: number;
  difficulty: string;
}
const MappingProjectCard = ({
  title,
  contributors,
  id,
  difficulty,
}: IMappingProjectCard) => {
  return (
    <a
      href={`https://tasks.hotosm.org/projects/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-lg p-lg flex flex-col justify-between gap-lg shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01]">
        <h4>{title}</h4>
        <p className="text-gray-600">{contributors} contributors</p>
        <p className="capitalize">{difficulty}</p>
      </div>
    </a>
  );
};

export default MappingProjectCard;
