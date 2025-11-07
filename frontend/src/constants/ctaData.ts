import { m } from '../paraglide/messages'
import type { PrimaryCallToActionData, SecondaryCallToActionData } from '../types/types'

export interface CTAData {
  primary: PrimaryCallToActionData
  secondary: SecondaryCallToActionData
}

export function getLandingCTAData(): Record<string, CTAData> {
  return {
    mapping: {
      primary: {
        title: m.cta_mapping_primary_title(),
        description: m.cta_mapping_primary_description(),
        descriptionHightlight: m.cta_mapping_primary_descriptionHighlight(),
        link1: {
          text: m.cta_mapping_primary_link1(),
          url: 'https://dronetm.org/',
        },
        link2: {
          text: m.cta_mapping_primary_link2(),
          url: 'https://dronetm.org/tutorials',
        },
        footer: m.cta_mapping_primary_footer(),
      },
      secondary: {
        title: m.cta_mapping_secondary_title(),
        description: m.cta_mapping_secondary_description(),
        image: 'https://cdn.hotosm.org/website/Map+Makoko+1.jpeg',
        buttonText: m.cta_mapping_secondary_button(),
        link: 'https://example.com/drone-tasking-manager',
      },
    },
    imagery: {
      primary: {
        title: m.cta_imagery_primary_title(),
        description: m.cta_imagery_primary_description(),
        link1: {
          text: m.cta_imagery_primary_link1(),
          url: 'https://dronetm.org/',
        },
        link2: {
          text: m.cta_imagery_primary_link2(),
          url: 'https://dronetm.org/',
        },
        footer: m.cta_imagery_primary_footer(),
      },
      secondary: {
        title: m.cta_imagery_secondary_title(),
        description: m.cta_imagery_secondary_description(),
        image: 'https://cdn.hotosm.org/website/Map+Makoko+1.jpeg',
        link: 'https://openaerialmap.org/',
        buttonText: m.cta_imagery_secondary_button(),
      },
    },
    field: {
      primary: {
        title: m.cta_field_primary_title(),
        description: m.cta_field_primary_description(),
        descriptionHightlight: m.cta_field_primary_descriptionHighlight(),
        link1: {
          text: m.cta_field_primary_link1(),
          url: 'https://login.hotosm.test',
        },
        link2: {
          text: m.cta_field_primary_link2(),
          url: 'https://www.hotosm.org/tools-and-data',
        },
        footer: m.cta_field_primary_footer(),
      },
      secondary: {
        title: m.cta_field_secondary_title(),
        description: m.cta_field_secondary_description(),
        image: 'https://cdn.hotosm.org/website/Map+Makoko+1.jpeg',
        link: 'https://www.hotosm.org/tools-and-data',
        buttonText: m.cta_field_secondary_button(),
      },
    },
    data: {
      primary: {
        title: m.cta_data_primary_title(),
        description: m.cta_data_primary_description(),
        descriptionHightlight: m.cta_data_primary_descriptionHighlight(),
        link1: {
          text: m.cta_data_primary_link1(),
          url: 'https://export.hotosm.org/',
        },
        link2: {
          text: m.cta_data_primary_link2(),
          url: 'https://login.hotosm.test',
        },
        footer: m.cta_data_primary_footer(),
      },
      secondary: {
        title: m.cta_data_secondary_title(),
        description: m.cta_data_secondary_description(),
        image: 'https://cdn.hotosm.org/website/Map+Makoko+1.jpeg',
        link: 'https://data.hotosm.org/',
        buttonText: m.cta_data_secondary_button(),
      },
    },
  }
}

// Always call getLandingCTAData() to get fresh translations

export function getCTAData(menuItemId: string): CTAData | undefined {
  return getLandingCTAData()[menuItemId]
}
