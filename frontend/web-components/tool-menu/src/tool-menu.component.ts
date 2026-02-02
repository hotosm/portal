import { LitElement, html, svg } from "lit";
import { property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { styles } from "./tool-menu.styles.js";
import { translations } from "./translations.js";
// Import tools icons. These icons will be added in the near future, and are not being showed as default.
import droneIcon from "../assets/icon-drone.svg";
import oamIcon from "../assets/icon-oam.svg";
import tmIcon from "../assets/icon-tm.svg";
import fairIcon from "../assets/icon-fair.svg";
import fieldIcon from "../assets/icon-field.svg";
import chatmapIcon from "../assets/icon-chatmap.svg";
import exportIcon from "../assets/icon-export.svg";
import umapIcon from "../assets/icon-umap.svg";

interface Tool {
  id: string;
  title: string;
  href: string;
  icon: string;
  section: "imagery" | "mapping" | "field" | "data";
}

interface Section {
  id: "imagery" | "mapping" | "field" | "data";
}

// Section IDs (titles will be translated)
const SECTIONS: Section[] = [
  { id: "imagery" },
  { id: "mapping" },
  { id: "field" },
  { id: "data" },
];

const TOOLS_DATA: Tool[] = [
  {
    id: "drone",
    title: "Drone Tasking Manager",
    href: "https://dronetm.org/",
    icon: droneIcon,
    section: "imagery",
  },
  {
    id: "oam",
    title: "OpenAerialMap",
    href: "https://openaerialmap.org/",
    icon: oamIcon,
    section: "imagery",
  },
  {
    id: "tasking-manager",
    title: "Tasking Manager",
    href: "https://tasks.hotosm.org/",
    icon: tmIcon,
    section: "mapping",
  },
  {
    id: "fair",
    title: "fAIr",
    href: "https://fair.hotosm.org/",
    icon: fairIcon,
    section: "data",
  },
  {
    id: "field",
    title: "Field Mapping Tasking Manager",
    href: "https://fmtm.hotosm.org/",
    icon: fieldIcon,
    section: "field",
  },
  {
    id: "chat-map",
    title: "ChatMap",
    href: "https://chatmap.hotosm.org",
    icon: chatmapIcon,
    section: "field",
  },
  {
    id: "export-tool",
    title: "Export Tool",
    href: "https://export.hotosm.org/",
    icon: exportIcon,
    section: "data",
  },
  {
    id: "umap",
    title: "uMap",
    href: "https://umap.hotosm.org/",
    icon: umapIcon,
    section: "mapping",
  },
];

export class HotToolMenu extends LitElement {
  static styles = styles;

  @property({ type: Boolean, attribute: "show-logos", reflect: false })
  showLogos = false;

  // Language code (en, es, fr, pt, etc.)
  @property({ type: String }) lang = "en";

  @state()
  private isOpen = false;

  private tools: Tool[] = TOOLS_DATA;

  /**
   * Get translated string for the current language
   * Falls back to English if translation not found
   */
  private t(key: keyof typeof translations.en): string {
    const langTranslations = translations[this.lang] || translations.en;
    return langTranslations[key] || translations.en[key] || key;
  }

  private getToolHref(tool: Tool): string {
    const isTestEnvironment = window.location.hostname.endsWith('.test');
    
    if (!isTestEnvironment) {
      return tool.href;
    }

    // Map tool IDs to their test environment URLs
    const testUrls: Record<string, string> = {
      'drone': 'https://dronetm.hotosm.test',
      'oam': 'https://openaerialmap.hotosm.test',
      'tasking-manager': 'https://login.hotosm.test',
      'fair': 'https://fair.hotosm.test',
      'field': 'https://login.hotosm.test',
      'chat-map': 'https://chatmap.hotosm.test',
      'export-tool': 'https://login.hotosm.test',
      'umap': 'https://umap.hotosm.test',
    };

    return testUrls[tool.id] || tool.href;
  }

  private getToolsBySection(sectionId: string): Tool[] {
    return this.tools.filter((t) => t.section === sectionId);
  }

  private toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  private closeDropdown() {
    this.isOpen = false;
  }

  private handleToolClick(tool: Tool) {
    // Dispatch custom event for external handling if needed
    this.dispatchEvent(
      new CustomEvent("tool-selected", {
        detail: { tool },
        bubbles: true,
        composed: true,
      })
    );

    // Open tool page in new tab with environment-specific URL
    const href = this.getToolHref(tool);
    window.open(href, "_blank", "noopener,noreferrer");
    
    // Close dropdown after selection
    this.closeDropdown();
  }

  private handleOutsideClick = (event: MouseEvent) => {
    if (!this.contains(event.target as Node)) {
      this.closeDropdown();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleOutsideClick);
  }

  render() {
    return html`
      <div class="dropdown">
        <button
          class="dropdown-trigger"
          @click=${this.toggleDropdown}
          aria-label="Open tools menu"
          aria-expanded=${this.isOpen}
          aria-haspopup="true"
        >
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
          </svg>
        </button>

        <div class="dropdown-content ${this.isOpen ? 'open' : ''}">
          ${SECTIONS.map((section, sectionIndex) => {
            const tools = this.getToolsBySection(section.id);
            if (tools.length === 0) return "";

            return html`
              <div
                class="section-group ${sectionIndex > 0 ? "section-divider" : ""}"
              >
                <div class="section-label">${this.t(section.id)}</div>
                ${tools.map(
                  (tool) => html`
                    <button
                      class="dropdown-item"
                      @click=${() => this.handleToolClick(tool)}
                    >
                      ${this.showLogos
                        ? html`<img
                            class="tool-icon"
                            src="${tool.icon}"
                            alt="${tool.title}"
                          />`
                        : ""}
                      <div class="tool-content">
                        <div class="tool-title">${tool.title}</div>
                      </div>
                    </button>
                  `
                )}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}

export default HotToolMenu;
