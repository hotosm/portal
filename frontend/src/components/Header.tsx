import { Link } from "react-router-dom";
import "../../web-components/shared-menu/sharedMenu.component";
import hotLogo from "../assets/images/hot-logo.svg";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";
import DrawerMenu from "./DrawerMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import NavigationMain from "./NavigationMain";

function Header() {
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
          <div className="block md:hidden">
            <DrawerMenu />
          </div>

          {/* desktop navigation */}
          <div className="hidden md:block">
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
            <hotosm-auth osm-required />
          </div>

          <hotosm-shared-menu />
        </div>
      </div>
    </>
  );
}

export default Header;
