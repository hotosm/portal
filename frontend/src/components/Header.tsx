import { Link } from "react-router-dom";
import "../../web-components/shared-menu/sharedMenu.component";
import hotLogo from "../assets/images/hot-icon.svg";
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
          {isLogin && (
            <div className="block lg:hidden">
              <DrawerMenu />
            </div>
          )}
          <div className="flex items-center gap-2 font-black text-xl">
            <Link to="/">
              <img
                src={hotLogo}
                alt="HOT Logo"
                className="h-[40px] w-[64px] object-cover object-left lg:object-contain"
              />
            </Link>
            <span className="uppercase">Portal</span>
          </div>

          {/* desktop navigation */}
          <div className="hidden lg:block">
            {isLogin ? (
              <NavigationMain />
            ) : (
              <span className="hidden lg:block text-lg leading-none xl:text-xl uppercase">
                {m.header_tagline()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-md items-center">
          <hotosm-auth osm-required redirect-after-logout="/" />
          <LanguageSwitcher />
          <hotosm-shared-menu />
        </div>
      </div>
    </>
  );
}

export default Header;
