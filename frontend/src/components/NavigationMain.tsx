import { Link } from "react-router-dom";
import { MAIN_MENU_ITEMS, getVisibleMenuItems } from "../constants/menu";
import { useAuth } from "../contexts/AuthContext";

interface NavigationMainProps {
  onLinkClick?: () => void;
}

function NavigationMain({ onLinkClick }: NavigationMainProps) {
  const { isLogin } = useAuth();
  const visibleItems = getVisibleMenuItems(MAIN_MENU_ITEMS, isLogin);

  return (
    <div className="flex gap-sm flex-col sm:flex-row">
      {visibleItems.map((item) => (
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
