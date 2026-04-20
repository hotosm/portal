import ProgressBar from "../../components/shared/ProgressBar";
import { m } from "../../paraglide/messages";

interface IMappingProjectCard {
  title: string;
  contributors: number;
  id: number;
  percentMapped: number;
  percentValidated: number;
  difficulty: string;
}
const MappingProjectCard = ({
  title,
  contributors,
  id,
  difficulty,
  percentMapped,
  percentValidated,
}: IMappingProjectCard) => {
  return (
    <a
      href={`https://tasks.hotosm.org/projects/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block group no-underline hover:no-underline"
    >
      <div className="w-full h-full bg-white rounded-lg p-md flex flex-col justify-between gap-lg shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01]">
        <h4>{title}</h4>
        <div>
          <p className="text-hot-gray-800 mb-xs">
            <strong>{contributors}</strong> contributors
          </p>
          <ProgressBar
            firstValue={percentMapped}
            secondValue={percentValidated}
          >
            <div className="text-xs">
              <div className="flex items-center gap-1 mb-1">
                <span className="inline-block w-2 h-2 bg-hot-gray-400 rounded-sm" />
                <span>
                  {percentMapped}% {m.mapped()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-hot-red-500 rounded-sm" />
                <span>
                  {percentValidated}% {m.validated()}
                </span>
              </div>
            </div>
          </ProgressBar>
        </div>

        <p className="capitalize text-sm">{difficulty}</p>
      </div>
    </a>
  );
};

export default MappingProjectCard;
