import Button from "./shared/Button";
import Divider from "./shared/Divider";
import Icon from "./shared/Icon";

// TODO remove from here
interface ProjectsMapCalloutProps {
  projectId: number;
  projectName: string;
  status?: string;
  onViewDetails: () => void;
  onClose: () => void;
}

export function ProjectsMapCallout({
  projectId,
  projectName,
  onViewDetails,
  onClose,
}: ProjectsMapCalloutProps) {
  return (
    <div
      className="bg-white p-lg w-[300px]
    min-h-[500px] rounded-lg border border-hot-gray-300"
    >
      <div className="flex justify-between items-start">
        <h3>{projectName}</h3>
        <Icon name="close" onClick={onClose}></Icon>
      </div>
      <Divider />
      <div className="text-sm text-hot-gray-600 mb-2">
        <strong>Project ID:</strong> #{projectId}
      </div>
      <div className="text-sm text-hot-gray-600 mb-3">
        <p>
          Granizal Mapeo de identificación de los impactos negrativos del
          deslizamiento de tierra ocurrido el 24 de junio de 2025 en la Vereda
          Granizal - sector Altos de Oriente 2 - Municipio de Bello-Antioquia.
        </p>
        <p>
          El deslizamiento de tierra dejó 27 víctimas, pertenientes a familias
          en la zona del epicentro del desastre.
        </p>
      </div>
      <Button onClick={onViewDetails}>View Project Details</Button>
    </div>
  );
}
