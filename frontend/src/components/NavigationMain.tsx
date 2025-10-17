import { Link } from "react-router-dom";
import { MAIN_MENU_ITEMS } from "../constants/menu";

interface NavigationMainProps {
  onLinkClick?: () => void;
}

function NavigationMain({ onLinkClick }: NavigationMainProps) {
  return (
    <div className="flex gap-sm flex-col sm:flex-row">
      {MAIN_MENU_ITEMS.map((item) => (
        <Link
          key={item.id}
          className="text-lg font-barlow text-hot-primary"
          to={item.href}
          onClick={onLinkClick}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default NavigationMain;
