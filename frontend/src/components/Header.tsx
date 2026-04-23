import { Link } from "react-router-dom";
import "@hotosm/tool-menu";
import hotLogo from "../assets/icons/portal.svg";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import DrawerMenu from "./DrawerMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import NavigationMain from "./NavigationMain";
import { m } from "../paraglide/messages";

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
            className="flex items-center gap-xl hover:no-underline"
          >
            <img src={hotLogo} alt="HOT Logo" className="w-8 h-8" />

            <span
              className="text-[20px] font-bold text-hot-gray-950 leading-tight"
              style={{ fontFamily: "Barlow, sans-serif" }}
            >
              Portal
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-xl">
            <span className="w-px h-5 bg-hot-gray-300" aria-hidden="true" />
            {isLogin ? (
              <NavigationMain />
            ) : (
              <span className="text-base leading-none text-hot-gray-950">
                {m.header_tagline()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-xs">
          <hotosm-auth
            lang={currentLanguage}
            button-color="primary"
            button-variant="filled"
          />
          <LanguageSwitcher />

          <hotosm-tool-menu lang={currentLanguage} />
        </div>
      </div>
    </>
  );
}

export default Header;
