import { NavLink, useLocation } from "react-router-dom";
import { MAIN_MENU_ITEMS, getVisibleMenuItems } from "../constants/menu";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

interface NavigationMainProps {
  onLinkClick?: () => void;
}

function NavigationMain({ onLinkClick }: NavigationMainProps) {
  const { isLogin } = useAuth();
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  const visibleItems = getVisibleMenuItems(MAIN_MENU_ITEMS, isLogin);

  // Check if path matches item, accounting for locale prefix
  const isActiveItem = (itemHref: string) => {
    const pathname = location.pathname;
    // Remove locale prefix (e.g., /es, /en) to get base path
    const basePath = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
    return basePath === itemHref || pathname === itemHref;
  };

  return (
    <div className="flex gap-sm flex-col lg:flex-row">
      {visibleItems.map((item) => {
        const isActive = isActiveItem(item.href);
        const localizedHref = `/${currentLanguage}${item.href}`;
        return (
          <NavLink
            key={item.id}
            className={`text-hot-gray-800 hover:no-underline text-lg font-bold px-sm py-xs rounded transition-colors ${
              isActive ? "bg-hot-gray-50" : "hover:bg-hot-gray-50"
            }`}
            to={localizedHref}
            onClick={onLinkClick}
          >
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
}

export default NavigationMain;
