import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import hotLogo from "../assets/images/hot-logo.svg";
import NavigationMain from "./NavigationMain";
import Dialog from "./shared/Dialog";
import Icon from "./shared/Icon";
import DrawerMenu from "./DrawerMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";

function Header() {
  const authRef = useRef<any>(null);
  // Use window.HANKO_URL as single source of truth (set in index.html by Vite)
  // Fallback to production URL if not set
  const hankoUrl = (window as any).HANKO_URL || "https://login.hotosm.org";
  const { isLogin } = useAuth();
  const { currentLanguage: _currentLanguage } = useLanguage();

  // Set hankoUrlAttr property directly on the web component
  // React doesn't properly pass kebab-case attributes to custom elements
  useEffect(() => {
    if (authRef.current) {
      authRef.current.hankoUrlAttr = hankoUrl;
      console.log('✅ Set hankoUrlAttr on web component:', hankoUrl);
    }
  }, [hankoUrl]); 
  
  return (
    <>
      <div className="flex gap-xl py-md justify-between items-center">
        <div className="flex gap-xl items-center">
          <Link to="/">
            <img
              src={hotLogo}
              alt="HOT Logo"
              style={{
                height: "40px",
                width: "158px",
              }}
            />
          </Link>
          {/* mobile navigation */}
          <div className="block sm:hidden">
            <DrawerMenu />
          </div>

          {/* desktop navigation */}
          <div className="hidden sm:block">
            {isLogin ? (
              <NavigationMain />
            ) : (
              <span className="font-barlow-condensed text-xl uppercase">
                {m.header_tagline()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-md items-center">
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <hotosm-auth
              ref={authRef}
              osm-required
            />
          </div>

          <Icon
            name="grip"
            onClick={() => {
              const dialog = document.getElementById("dialog-overview") as any;
              if (dialog) dialog.open = true;
            }}
            aria-label="Open shared menu"
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      <Dialog label="Coming Soon" id="dialog-overview">
        Shared menu will be a web component.
      </Dialog>
    </>
  );
}

export default Header;
