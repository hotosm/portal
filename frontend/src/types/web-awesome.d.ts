// Type declarations for Web Components (Web Awesome + Hanko Auth)

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      // Web Awesome components
      "wa-drawer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
          "without-header"?: boolean;
        },
        HTMLElement
      >;
      "wa-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          slot?: string;
          variant?: string;
          "data-drawer"?: string;
        },
        HTMLElement
      >;

      // HOTOSM Hanko Auth component
      "hotosm-auth": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "hanko-url"?: string;
          "base-path"?: string;
          "osm-enabled"?: boolean;
          "osm-required"?: boolean;
          "osm-scopes"?: string;
          "show-profile"?: boolean;
          "redirect-after-login"?: string;
          debug?: boolean;
        },
        HTMLElement
      >;

      // HOTOSM Shared Menu component
      "hotosm-shared-menu": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          color?: string;
        },
        HTMLElement
      >;

      // HOTOSM Tool Menu component
      "hotosm-tool-menu": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "show-logos"?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

declare global {
  interface Element {
    open?: boolean;
  }
}

export {};
