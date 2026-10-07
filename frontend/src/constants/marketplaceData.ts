import droneIcon from "../assets/icons/drone-icon.svg";
import { m } from "../paraglide/messages";
import { getLocale } from "../paraglide/runtime";

// "Tech request" Airtable form embedded by every marketplace CTA.
export const MARKETPLACE_FORM_URL =
  "https://airtable.com/embed/app1n0WWdVdkFz3cR/pagMhDf2az2UUiynH/form";

// "Talk to someone" Airtable form, embedded by the more-info and contact buttons.
export const MARKETPLACE_CONTACT_URL =
  "https://airtable.com/embed/app1n0WWdVdkFz3cR/paghAAbHRUCnIzk6B/form";

export interface MarketplaceService {
  id: string;
  title: string;
  description: string;
  /** Web Awesome icon name (classic solid). */
  icon?: string;
  /** Local SVG, used when no Web Awesome icon fits. Takes precedence over `icon`. */
  iconSrc?: string;
}

export interface MarketplaceCommissionColumn {
  id: string;
  title: string;
  items: string[];
}

export interface MarketplaceStep {
  id: string;
  title: string;
  description: string;
}

export interface MarketplaceAudience {
  id: string;
  title: string;
  description: string;
}

export function getMarketplaceServices(): MarketplaceService[] {
  const locale = getLocale();
  return [
    {
      id: "datasets",
      title: m.marketplace_service_datasets({}, { locale }),
      description: m.marketplace_service_datasets_desc({}, { locale }),
      icon: "map-location-dot",
    },
    {
      id: "analysis",
      title: m.marketplace_service_analysis({}, { locale }),
      description: m.marketplace_service_analysis_desc({}, { locale }),
      icon: "clipboard-list",
    },
    {
      id: "monitoring",
      title: m.marketplace_service_monitoring({}, { locale }),
      description: m.marketplace_service_monitoring_desc({}, { locale }),
      icon: "chart-line",
    },
    {
      id: "verification",
      title: m.marketplace_service_verification({}, { locale }),
      description: m.marketplace_service_verification_desc({}, { locale }),
      icon: "shield-halved",
    },
    {
      id: "drone",
      title: m.marketplace_service_drone({}, { locale }),
      description: m.marketplace_service_drone_desc({}, { locale }),
      iconSrc: droneIcon,
    },
    {
      id: "ai",
      title: m.marketplace_service_ai({}, { locale }),
      description: m.marketplace_service_ai_desc({}, { locale }),
      icon: "brain",
    },
    {
      id: "rapid",
      title: m.marketplace_service_rapid({}, { locale }),
      description: m.marketplace_service_rapid_desc({}, { locale }),
      icon: "rocket",
    },
    {
      id: "capacity",
      title: m.marketplace_service_capacity({}, { locale }),
      description: m.marketplace_service_capacity_desc({}, { locale }),
      icon: "graduation-cap",
    },
    {
      id: "config",
      title: m.marketplace_service_config({}, { locale }),
      description: m.marketplace_service_config_desc({}, { locale }),
      icon: "sliders",
    },
  ];
}

export function getCommissionData(): MarketplaceCommissionColumn[] {
  const locale = getLocale();
  return [
    {
      id: "data",
      title: m.marketplace_commission_data_title({}, { locale }),
      items: [
        m.marketplace_commission_data_1({}, { locale }),
        m.marketplace_commission_data_2({}, { locale }),
        m.marketplace_commission_data_3({}, { locale }),
        m.marketplace_commission_data_4({}, { locale }),
      ],
    },
    {
      id: "services",
      title: m.marketplace_commission_services_title({}, { locale }),
      items: [
        m.marketplace_commission_services_1({}, { locale }),
        m.marketplace_commission_services_2({}, { locale }),
        m.marketplace_commission_services_3({}, { locale }),
        m.marketplace_commission_services_4({}, { locale }),
        m.marketplace_commission_services_5({}, { locale }),
        m.marketplace_commission_services_6({}, { locale }),
      ],
    },
  ];
}

export function getHowItWorksSteps(): MarketplaceStep[] {
  const locale = getLocale();
  return [
    {
      id: "scope",
      title: m.marketplace_how_s1_title({}, { locale }),
      description: m.marketplace_how_s1_body({}, { locale }),
    },
    {
      id: "recommend",
      title: m.marketplace_how_s2_title({}, { locale }),
      description: m.marketplace_how_s2_body({}, { locale }),
    },
    {
      id: "delivery",
      title: m.marketplace_how_s3_title({}, { locale }),
      description: m.marketplace_how_s3_body({}, { locale }),
    },
    {
      id: "handoff",
      title: m.marketplace_how_s4_title({}, { locale }),
      description: m.marketplace_how_s4_body({}, { locale }),
    },
  ];
}

export function getWhoItsFor(): MarketplaceAudience[] {
  const locale = getLocale();
  return [
    {
      id: "organisations",
      title: m.marketplace_whofor_orgs_title({}, { locale }),
      description: m.marketplace_whofor_orgs_body({}, { locale }),
    },
    {
      id: "teams",
      title: m.marketplace_whofor_teams_title({}, { locale }),
      description: m.marketplace_whofor_teams_body({}, { locale }),
    },
  ];
}
