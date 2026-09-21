import { NavLink, useLocation } from "react-router-dom";
import { MAIN_MENU_ITEMS, getVisibleMenuItems } from "../constants/menu";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useMyPortalProfile } from "../hooks/useMyPortalProfile";

interface NavigationMainProps {
  onLinkClick?: () => void;
}

function NavigationMain({ onLinkClick }: NavigationMainProps) {
  const { isLogin } = useAuth();
  const { data: me } = useMyPortalProfile();
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

  // Some hrefs carry a :username token (profile link). Only the real slug from
  // the portal profile resolves it: without one there's no public profile to
  // link to (not public yet, or the profile hasn't loaded), so the item isn't
  // rendered at all instead of pointing at a broken URL.
  const resolveHref = (href: string) => {
    if (!href.includes(":username")) return href;
    if (!me?.slug) return null;
    return href.replace(":username", encodeURIComponent(me.slug));
  };

  return (
    <div className="flex gap-sm flex-col lg:flex-row">
      {visibleItems.map((item) => {
        const href = resolveHref(item.href);
        if (href === null) return null;

        const isActive = isActiveItem(href);
        const linkContent = (
          <span className="flex items-center gap-2xs">
            {item.icon && (
              <>
                {/* @ts-ignore */}
                <wa-icon
                  class="nav-icon-regular"
                  library="bootstrap"
                  name={item.icon}
                  style={{ fontSize: "16px" }}
                />
              </>
            )}
            {item.label()}
          </span>
        );

        if (item.external) {
          return (
            <a
              key={item.id}
              className="nav-main-link text-hot-gray-800 hover:no-underline text-sm px-sm py-xs"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onLinkClick}
            >
              {linkContent}
            </a>
          );
        }

        const localizedHref = `/${currentLanguage}${href}`;
        return (
          <NavLink
            key={item.id}
            className={`nav-main-link text-hot-gray-800 hover:no-underline text-sm px-sm py-xs ${
              isActive ? "font-bold" : ""
            }`}
            to={localizedHref}
            onClick={onLinkClick}
          >
            {linkContent}
          </NavLink>
        );
      })}
    </div>
  );
}

export default NavigationMain;
