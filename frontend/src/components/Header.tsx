import { Link } from "react-router-dom";
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
  const hankoUrl =
    import.meta.env.VITE_HANKO_URL || "https://login.hotosm.test";
  const { isLogin } = useAuth();
  const { currentLanguage: _currentLanguage } = useLanguage();

  return (
    <>
      <div className="w-full flex gap-sm md:gap-xl py-md px-lg md:px-2xl justify-between items-center">
        <div className="flex gap-xl items-center">
          <Link to="/">
            <img
              src={hotLogo}
              alt="HOT Logo"
              style={{
                height: "40px",
                minWidth: "158px",
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
              <span className="hidden lg:block font-barlow-condensed text-lg leading-none xl:text-xl uppercase">
                {m.header_tagline()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-md items-center">
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <hotosm-auth hanko-url={hankoUrl} osm-required />
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
