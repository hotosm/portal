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
        title: m['cta.mapping.primary.title'](),
        description: m['cta.mapping.primary.description'](),
        descriptionHightlight: m['cta.mapping.primary.descriptionHighlight'](),
        link1: {
          text: m['cta.mapping.primary.link1'](),
          url: 'https://dronetm.org/',
        },
        link2: {
          text: m['cta.mapping.primary.link2'](),
          url: 'https://dronetm.org/tutorials',
        },
        footer: m['cta.mapping.primary.footer'](),
      },
      secondary: {
        title: m['cta.mapping.secondary.title'](),
        description: m['cta.mapping.secondary.description'](),
        image: 'https://cdn.hotosm.org/website/Map+Makoko+1.jpeg',
        buttonText: m['cta.mapping.secondary.button'](),
        link: 'https://example.com/drone-tasking-manager',
      },
    },
    imagery: {
      primary: {
        title: m['cta.imagery.primary.title'](),
        description: m['cta.imagery.primary.description'](),
        link1: {
          text: m['cta.imagery.primary.link1'](),
          url: 'https://dronetm.org/',
        },
        link2: {
          text: m['cta.imagery.primary.link2'](),
          url: 'https://dronetm.org/',
        },
        footer: m['cta.imagery.primary.footer'](),
      },
      secondary: {
        title: m['cta.imagery.secondary.title'](),
        description: m['cta.imagery.secondary.description'](),
        image: 'https://cdn.hotosm.org/website/Map+Makoko+1.jpeg',
        link: 'https://openaerialmap.org/',
        buttonText: m['cta.imagery.secondary.button'](),
      },
    },
    field: {
      primary: {
        title: m['cta.field.primary.title'](),
        description: m['cta.field.primary.description'](),
        descriptionHightlight: m['cta.field.primary.descriptionHighlight'](),
        link1: {
          text: m['cta.field.primary.link1'](),
          url: '#login',
        },
        link2: {
          text: m['cta.field.primary.link2'](),
          url: 'https://www.hotosm.org/tools-and-data',
        },
        footer: m['cta.field.primary.footer'](),
      },
      secondary: {
        title: m['cta.field.secondary.title'](),
        description: m['cta.field.secondary.description'](),
        image: 'https://cdn.hotosm.org/website/Map+Makoko+1.jpeg',
        link: 'https://www.hotosm.org/tools-and-data',
        buttonText: m['cta.field.secondary.button'](),
      },
    },
    data: {
      primary: {
        title: m['cta.data.primary.title'](),
        description: m['cta.data.primary.description'](),
        descriptionHightlight: m['cta.data.primary.descriptionHighlight'](),
        link1: {
          text: m['cta.data.primary.link1'](),
          url: 'https://export.hotosm.org/',
        },
        link2: {
          text: m['cta.data.primary.link2'](),
          url: '#login',
        },
        footer: m['cta.data.primary.footer'](),
      },
      secondary: {
        title: m['cta.data.secondary.title'](),
        description: m['cta.data.secondary.description'](),
        image: 'https://cdn.hotosm.org/website/Map+Makoko+1.jpeg',
        link: 'https://data.hotosm.org/',
        buttonText: m['cta.data.secondary.button'](),
      },
    },
  }
}

// Always call getLandingCTAData() to get fresh translations

export function getCTAData(menuItemId: string): CTAData | undefined {
  return getLandingCTAData()[menuItemId]
}
