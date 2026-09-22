import { m } from "../paraglide/messages";
import { getLocale } from "../paraglide/runtime";

// Destination for every marketplace CTA. Placeholder until the
// "Tech request" form exists.
export const MARKETPLACE_REQUEST_URL = "mailto:info@hotosm.org";

export interface MarketplaceService {
  id: string;
  title: string;
  type: "product" | "service";
  icon: string;
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
      type: "product",
      icon: "map-location-dot",
    },
    {
      id: "verification",
      title: m.marketplace_service_verification({}, { locale }),
      type: "product",
      icon: "clipboard-check",
    },
    {
      id: "monitoring",
      title: m.marketplace_service_monitoring({}, { locale }),
      type: "product",
      icon: "chart-line",
    },
    {
      id: "analysis",
      title: m.marketplace_service_analysis({}, { locale }),
      type: "product",
      icon: "chart-simple",
    },
    {
      id: "rapid",
      title: m.marketplace_service_rapid({}, { locale }),
      type: "product",
      icon: "rocket",
    },
    {
      id: "drone",
      title: m.marketplace_service_drone({}, { locale }),
      type: "product",
      icon: "helicopter",
    },
    {
      id: "ai",
      title: m.marketplace_service_ai({}, { locale }),
      type: "product",
      icon: "brain",
    },
    {
      id: "capacity",
      title: m.marketplace_service_capacity({}, { locale }),
      type: "service",
      icon: "graduation-cap",
    },
    {
      id: "config",
      title: m.marketplace_service_config({}, { locale }),
      type: "service",
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
