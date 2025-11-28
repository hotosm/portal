/**
 * @hotosm/shared-menu Web Component (Lit Version)
 *
 * A dropdown menu component displaying HOT products with icons and links.
 * Built with Lit and WebAwesome primitives.
 */

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@awesome.me/webawesome";
import { styles } from "./sharedMenu.styles";

// Import product icons
import droneIcon from "./assets/icon-drone.png";
import oamIcon from "./assets/icon-oam.png";
import tmIcon from "./assets/icon-tm.png";
import fairIcon from "./assets/icon-fair.png";
import fieldIcon from "./assets/icon-field.png";
import chatmapIcon from "./assets/icon-chatmap.png";
import exportIcon from "./assets/icon-export.png";
import umapIcon from "./assets/icon-umap.png";

interface Product {
  id: string;
  title: string;
  description: string;
  iconName: string;
  href: string;
  icon: string;
  section: "imagery" | "mapping" | "mapUse";
}

// Product data lives in the component
const PRODUCTS_DATA: Product[] = [
  {
    id: "drone",
    title: "Drone Tasking Manager",
    description: "Coordinate drone mapping missions",
    iconName: "layer-group",
    href: "https://dronetm.org/",
    icon: droneIcon,
    section: "imagery",
  },
  {
    id: "oam",
    title: "OpenAerialMap",
    description: "The open collection of aerial imagery",
    iconName: "mobile-screen-button",
    href: "https://openaerialmap.org/",
    icon: oamIcon,
    section: "imagery",
  },
  {
    id: "tasking-manager",
    title: "Tasking Manager",
    description: "Coordinate mapping projects",
    iconName: "laptop",
    href: "https://tasks.hotosm.org/",
    icon: tmIcon,
    section: "mapping",
  },
  {
    id: "fair",
    title: "fAIr",
    description: "Your AI mapping partner",
    iconName: "hexagon-nodes",
    href: "https://fair.hotosm.org/",
    icon: fairIcon,
    section: "mapping",
  },
  {
    id: "field",
    title: "Field Mapping Tasking Manager",
    description: "Add local knowledge to map features",
    iconName: "mobile-screen-button",
    href: "https://fmtm.hotosm.org/",
    icon: fieldIcon,
    section: "mapping",
  },
  {
    id: "chat-map",
    title: "ChatMap",
    description: "Mapping with chat apps",
    iconName: "hexagon-nodes",
    href: "https://www.hotosm.org/tech-suite/chatmap/",
    icon: chatmapIcon,
    section: "mapping",
  },
  {
    id: "export-tool",
    title: "Export Tool",
    description: "Customize extracts of OSM data",
    iconName: "download",
    href: "https://export.hotosm.org/",
    icon: exportIcon,
    section: "mapUse",
  },
  {
    id: "umap",
    title: "uMap",
    description: "Create custom maps",
    iconName: "pen-to-square",
    href: "https://umap.hotosm.org/",
    icon: umapIcon,
    section: "mapUse",
  },
];

@customElement("hotosm-shared-menu")
export class SharedMenu extends LitElement {
  static styles = styles;

  @property({ type: String, attribute: "color" }) color?: string;

  private products: Product[] = PRODUCTS_DATA;

  private handleSelect(event: CustomEvent) {
    const selectedValue = event.detail.item.value;
    const product = this.products.find((p) => p.id === selectedValue);

    if (product) {
      // Dispatch custom event for external handling if needed
      this.dispatchEvent(
        new CustomEvent("product-selected", {
          detail: { product },
          bubbles: true,
          composed: true,
        })
      );

      // Open product page in new tab
      window.open(product.href, "_blank", "noopener,noreferrer");
    }
  }

  render() {
    return html`
      <wa-dropdown placement="bottom-end" @wa-select=${this.handleSelect}>
        <wa-button
          slot="trigger"
          appearance="plain"
          size="small"
          aria-label="Open products menu"
        >
          <wa-icon
            name="grip"
            style="color: ${this.color || "#333333"}"
          ></wa-icon>
        </wa-button>

        ${this.products.map(
          (product) => html`
            <wa-dropdown-item value="${product.id}">
              <img
                slot="icon"
                src="${product.icon}"
                alt="${product.title}"
                class="product-icon"
              />
              <div class="product-content">
                <div class="product-title">${product.title}</div>
                <div class="product-description">${product.description}</div>
              </div>
            </wa-dropdown-item>
          `
        )}
      </wa-dropdown>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hotosm-shared-menu": SharedMenu;
  }
}
