import { css, unsafeCSS } from "lit";

// Import HOT design system CSS
const hotCSS = unsafeCSS(`@import url('https://cdn.jsdelivr.net/npm/hotosm-ui-design@latest/dist/hot.css');`);

export const styles = css`
  ${hotCSS}

  :host {
    display: inline-block;
    position: relative;
  }

  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-trigger {
    background: none;
    border: none;
    padding: var(--hot-spacing-small);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  .dropdown-trigger:hover {
    background-color: var(--hot-color-gray-50);
  }

  .dropdown-trigger:focus {
    outline: none;
  }

  .dropdown-trigger:active {
    outline: none;
  }

  .menu-icon {
    width: 20px;
    height: 20px;
    display: block;
  }

  .dropdown-content {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid var(--hot-color-neutral-200, #e5e5e5);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 250px;
    max-width: 320px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition:
      opacity 0.2s ease,
      visibility 0.2s ease,
      transform 0.2s ease;
  }

  .dropdown-content.open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: var(--hot-spacing-x-small) var(--hot-spacing-medium);
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.2s ease;
    gap: var(--hot-spacing-small);
  }

  .dropdown-item:hover {
    background-color: var(--hot-color-neutral-50, #f8f9fa);
  }

  .dropdown-item:focus {
    background-color: var(--hot-color-neutral-50, #f8f9fa);
    outline: 2px solid var(--hot-color-primary-500, #0066cc);
    outline-offset: -2px;
  }

  .tool-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    display: block;
    flex-shrink: 0;
  }

  .tool-content {
    display: flex;
    flex-direction: column;
    gap: var(--hot-spacing-2x-small);
    text-align: left;
    flex: 1;
  }

  .tool-title {
    font-weight: var(--hot-font-weight-light, 300);
    font-size: var(--hot-font-size-small, 14px);
    color: var(--hot-color-neutral-950, #1a1a1a);
    line-height: 1.3;
  }

  .section-label {
    font-weight: var(--hot-font-weight-bold);
    font-size: var(--hot-font-size-small, 14px);
    padding: var(--hot-spacing-x-small) var(--hot-spacing-medium)
      var(--hot-spacing-2x-small) var(--hot-spacing-medium);
    color: var(--hot-color-gray-900);
  }

  .section-divider {
    border-top: 1px solid var(--hot-color-neutral-200, #e5e5e5);
    margin-top: var(--hot-spacing-x-small);
    padding-top: var(--hot-spacing-x-small);
  }

  .section-group:first-child .section-label {
    padding-top: var(--hot-spacing-small);
  }

  .section-group:last-child .dropdown-item:last-child {
    padding-bottom: var(--hot-spacing-small);
  }
`;
