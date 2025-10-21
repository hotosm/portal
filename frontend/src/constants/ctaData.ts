import {
  PrimaryCallToActionData,
  SecondaryCallToActionData,
} from "../types/types";

export interface CTAData {
  primary: PrimaryCallToActionData;
  secondary: SecondaryCallToActionData;
}

export const LANDING_CTA_DATA: Record<string, CTAData> = {
  mapping: {
    primary: {
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
    },
    secondary: {
      title: "Drone Tasking Manager",
      description: "Capture and use your own aerial imagery",
      image: "https://cdn.hotosm.org/website/Map+Makoko+1.jpeg",
      buttonText: "Read more",
      link: "https://example.com/drone-tasking-manager",
    },
  },
  imagery: {
    primary: {
      title: "Drone",
      description: "Tasking Manager",
      link1: {
        text: "Try it now",
        url: "https://dronetm.org/",
      },
      link2: {
        text: "Buy imagery services",
        url: "https://dronetm.org/",
      },
      footer: "Your own aerial imagery with consumer drones.",
    },
    secondary: {
      title: "Open Aerial Map",
      description: "The open collection of aerial imagery.",
      image: "https://cdn.hotosm.org/website/Map+Makoko+1.jpeg",
      link: "https://openaerialmap.org/",
      buttonText: "Start exploring",
    },
  },
  field: {
    primary: {
      title: "Field Mapping",
      description: "Participate in field data collection",
      descriptionHightlight: "and ground-truthing activities.",
      link1: {
        text: "Get Started",
        url: "#login",
      },
      link2: {
        text: "Learn Field Mapping",
        url: "https://www.hotosm.org/tools-and-data",
      },
      footer: "Contribute to on-the-ground mapping efforts worldwide.",
    },
    secondary: {
      title: "Mobile Data Collection",
      description:
        "Collect field data with mobile applications and GPS devices.",
      image: "https://cdn.hotosm.org/website/Map+Makoko+1.jpeg",
      link: "https://www.hotosm.org/tools-and-data",
      buttonText: "View Tools",
    },
  },
  data: {
    primary: {
      title: "Data Export Tool",
      description: "Download and analyze geospatial data",
      descriptionHightlight: "from humanitarian mapping projects.",
      link1: {
        text: "Export Data",
        url: "https://export.hotosm.org/",
      },
      link2: {
        text: "Sign Up for More",
        url: "#login",
      },
      footer: "Access OpenStreetMap data in various formats for analysis.",
    },
    secondary: {
      title: "HOT Data",
      description: "Explore datasets from humanitarian mapping initiatives.",
      image: "https://cdn.hotosm.org/website/Map+Makoko+1.jpeg",
      link: "https://data.hotosm.org/",
      buttonText: "Browse Data",
    },
  },
};

export function getCTAData(menuItemId: string): CTAData | undefined {
  return LANDING_CTA_DATA[menuItemId];
}
