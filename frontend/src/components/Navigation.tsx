import { useEffect } from "react";
// TODO check how to avoid this
import "@awesome.me/webawesome/dist/components/drawer/drawer.js";
import "@awesome.me/webawesome/dist/components/button/button.js";

function Navigation() {
  useEffect(() => {
    // Give components time to initialize
    const timer = setTimeout(() => {
      const drawer = document.querySelector(".drawer-without-header");
      const openButton = document.querySelector(".open-drawer-btn");

      if (drawer && openButton) {
        // Ensure drawer starts closed
        drawer.open = false;

        const handleClick = () => (drawer.open = true);
        openButton.addEventListener("click", handleClick);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <wa-drawer label="Drawer" without-header className="drawer-without-header">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        <wa-button slot="footer" variant="brand" data-drawer="close">
          Close
        </wa-button>
      </wa-drawer>

      <wa-button className="open-drawer-btn">Open </wa-button>
    </div>
  );
}

export default Navigation;
