import WaDrawer from "@awesome.me/webawesome/dist/react/drawer/index.js";
import NavigationMain from "./NavigationMain";
import PortalBrand from "./PortalBrand";
import Icon from "./shared/Icon";

const closeDrawer = () => {
  const drawer = document.getElementById("mobile-drawer") as any;
  if (drawer) drawer.open = false;
};

function DrawerMenuContent() {
  return (
    <div className="flex flex-col gap-md">
      <NavigationMain onLinkClick={closeDrawer} />

      <div className="flex flex-col gap-md"></div>
    </div>
  );
}

function DrawerMenu() {
  return (
    <>
      <WaDrawer
        placement="top"
        label="Portal"
        id="mobile-drawer"
        style={{ "--size": "auto" } as React.CSSProperties}
      >
        <div slot="label">
          <PortalBrand onClick={closeDrawer} />
        </div>
        <DrawerMenuContent />
      </WaDrawer>

      <Icon
        name="bars"
        label="Menu"
        onClick={() => {
          const drawer = document.getElementById("mobile-drawer") as any;
          if (drawer) drawer.open = true;
        }}
      />
    </>
  );
}

export default DrawerMenu;
