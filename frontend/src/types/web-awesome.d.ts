// Type declarations for Web Awesome components

import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
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
    }
  }
}

declare global {
  interface Element {
    open?: boolean;
  }
}

export {};
