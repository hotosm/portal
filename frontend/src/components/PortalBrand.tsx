import { Link } from "react-router-dom";
import hotLogo from "../assets/icons/portal.svg";
import { useLanguage } from "../contexts/LanguageContext";

interface PortalBrandProps {
  onClick?: () => void;
}

function PortalBrand({ onClick }: PortalBrandProps) {
  const { currentLanguage } = useLanguage();

  return (
    <Link
      to={`/${currentLanguage}/`}
      className="flex items-center gap-lg hover:no-underline"
      onClick={onClick}
    >
      <img src={hotLogo} alt="HOT Logo" className="w-8 h-8" />

      <span
        className="text-[20px] font-bold text-hot-gray-950 leading-tight"
        style={{ fontFamily: "Barlow, sans-serif" }}
      >
        Portal
      </span>
    </Link>
  );
}

export default PortalBrand;
