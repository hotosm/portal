import { Link } from "react-router-dom";
import "@hotosm/tool-menu";
import hotLogo from "../assets/images/hot-icon.svg";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import DrawerMenu from "./DrawerMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import NavigationMain from "./NavigationMain";

function Header() {
  const { isLogin } = useAuth();
  const { currentLanguage } = useLanguage();

  return (
    <>
      <div className="container flex gap-sm md:gap-xl py-md justify-between items-center">
        <div className="flex gap-xl items-center">
          {isLogin && (
            <div className="block lg:hidden">
              <DrawerMenu />
            </div>
          )}
          <Link
            to={`/${currentLanguage}/`}
            className="flex items-center gap-2 hover:no-underline"
          >
            <img src={hotLogo} alt="HOT Logo" className="w-14 h-14" />

            <span
              className="uppercase text-[22px] text-hot-gray-950 leading-tight hover:no-underline"
              style={{ fontFamily: "Barlow" }}
            >
              Portal
            </span>
          </Link>

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

        <div className="flex items-center">
          <hotosm-auth
            lang={currentLanguage}
            button-variant="plain"
            button-color="primary"
          />
          <LanguageSwitcher />

          <hotosm-tool-menu lang={currentLanguage} />
        </div>
      </div>
    </>
  );
}

export default Header;
