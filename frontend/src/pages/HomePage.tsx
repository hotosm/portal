import PrimaryCallToAction from "../components/shared/PrimaryCallToAction";
import SecondaryCallToAction from "../components/shared/SecondaryCallToAction";

import {
  PrimaryCallToActionData,
  SecondaryCallToActionData,
} from "../types/types";

// TODO - to be replaced by API calls in the future ?
// TODO image optimization
const primaryCallToActionData: PrimaryCallToActionData = {
  title: "Mapping Portal",
  description: "Open Mapping Suite",
  descriptionHightlight: "For Social Good",
  link1: {
    text: "Start now",
    url: "https://dronetm.org/",
  },
  link2: {
    text: "Take the course",
    url: "https://dronetm.org/tutorials",
  },
  footer: "AN OPEN SOURCE, COMMUNITY-LED MAPPING PLATFORM",
};

const secondaryCallToActionData: SecondaryCallToActionData = {
  title: "Drone Tasking Manager",
  description: "Capture and use your own aerial imagery",
  image: "https://cdn.hotosm.org/website/Map+Makoko+1.jpeg",
  buttonText: "Read more",
  link: "https://example.com/drone-tasking-manager",
};

function HomePage() {
  return (
    <div className="flex flex-col sm:flex-row gap-lg items-stretch">
      <div className="w-full sm:w-2/3 flex">
        <PrimaryCallToAction data={primaryCallToActionData} />
      </div>
      <div className="w-full sm:w-1/3 flex">
        <SecondaryCallToAction data={secondaryCallToActionData} />
      </div>
    </div>
  );
}

export default HomePage;
