import { Link } from "react-router-dom";
import "../../web-components/shared-menu/sharedMenu.component";
import hotLogo from "../assets/images/hot-icon.svg";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import DrawerMenu from "./DrawerMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import NavigationMain from "./NavigationMain";

function Header() {
  const { isLogin } = useAuth();
  const { currentLanguage: _currentLanguage } = useLanguage();

  return (
    <>
      <div className="container flex gap-sm md:gap-xl py-md justify-between items-center">
        <div className="flex gap-xl items-center">
          {isLogin && (
            <div className="block lg:hidden">
              <DrawerMenu />
            </div>
          )}
          <div className="flex items-center gap-xs lg:gap-md">
            <Link to="/">
              <img src={hotLogo} alt="HOT Logo" className="h-[48px] w-[80px]" />
            </Link>
            <span
              className="uppercase text-md lg:text-2xl leading-dense"
              style={{ fontFamily: "Barlow" }}
            >
              Portal
            </span>
          </div>

          {/* desktop navigation with tagline
          <div className="hidden lg:block">
            {isLogin ? <NavigationMain />
            ) : (
              <span className="hidden lg:block text-lg leading-none xl:text-xl uppercase">
                {m.header_tagline()}
              </span>
            )}
          </div> */}
          <div className="hidden lg:block">{isLogin && <NavigationMain />}</div>
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
