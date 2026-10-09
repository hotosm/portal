import "@hotosm/ui";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import DrawerMenu from "./DrawerMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import NavigationMain from "./NavigationMain";
import PortalBrand from "./PortalBrand";
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
          <PortalBrand />

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

          <hotosm-tool-menu />
        </div>
      </div>
    </>
  );
}

export default Header;
