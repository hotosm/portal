import WaDrawer from "@awesome.me/webawesome/dist/react/drawer/index.js";
import NavigationMain from "./NavigationMain";
import Icon from "./shared/Icon";

function DrawerMenuContent() {
  const closeDrawer = () => {
    const drawer = document.getElementById("mobile-drawer") as any;
    if (drawer) drawer.open = false;
  };

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
      <WaDrawer placement="top" label="HOT Portal" id="mobile-drawer">
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
