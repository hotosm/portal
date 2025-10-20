import { useLocation } from "react-router-dom";
import PrimaryCallToAction from "../components/shared/PrimaryCallToAction";
import SecondaryCallToAction from "../components/shared/SecondaryCallToAction";
import { getCTAData } from "../constants/ctaData";
import { MAIN_MENU_ITEMS } from "../constants/menu";

interface LandingPageProps {
  menuItemId?: string;
}

function LandingPage({ menuItemId }: LandingPageProps) {
  const location = useLocation();

  // Determine section
  const currentMenuItemId =
    menuItemId ||
    MAIN_MENU_ITEMS.find((item) => item.href === location.pathname)?.id ||
    "mapping";

  const ctaData = getCTAData(currentMenuItemId);

  if (!ctaData) {
    // TODO customize error messages
    return <h1 className="text-3xl font-bold mb-4">Error fetching data</h1>;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-lg items-stretch">
        <div className="w-full sm:w-2/3 flex">
          <PrimaryCallToAction data={ctaData.primary} />
        </div>
        <div className="w-full sm:w-1/3 flex">
          <SecondaryCallToAction data={ctaData.secondary} />
        </div>
      </div>
    </>
  );
}

export default LandingPage;
