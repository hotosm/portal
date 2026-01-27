import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";
import { styles } from "./tool-menu.styles.js";
import gridIcon from "../assets/grid-icon.svg";
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
  title: string;
}

// Section titles
const SECTIONS: Section[] = [
  { id: "imagery", title: "Imagery" },
  { id: "mapping", title: "Mapping" },
  { id: "field", title: "Field" },
  { id: "data", title: "Data" },
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
    section: "mapping",
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
    href: "https://www.hotosm.org/tech-suite/chatmap/",
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
    title: "Maps",
    href: "https://umap.hotosm.org/",
    icon: umapIcon,
    section: "data",
  },
];

export class HotToolMenu extends LitElement {
  static styles = styles;

  @property({ type: Boolean, attribute: "show-logos", reflect: false })
  showLogos = false;

  @state()
  private isOpen = false;

  private tools: Tool[] = TOOLS_DATA;

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
          <img src="${gridIcon}" class="menu-icon" alt="Menu" />
        </button>

        <div class="dropdown-content ${this.isOpen ? 'open' : ''}">
          ${SECTIONS.map((section, sectionIndex) => {
            const tools = this.getToolsBySection(section.id);
            if (tools.length === 0) return "";

            return html`
              <div
                class="section-group ${sectionIndex > 0 ? "section-divider" : ""}"
              >
                <div class="section-label">${section.title}</div>
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
