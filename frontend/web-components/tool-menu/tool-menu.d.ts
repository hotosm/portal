import HotToolMenu from './tool-menu.component.js';

declare global {
  interface HTMLElementTagNameMap {
    'hotosm-tool-menu': HotToolMenu;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'hotosm-tool-menu': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'show-logos'?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export default HotToolMenu;
