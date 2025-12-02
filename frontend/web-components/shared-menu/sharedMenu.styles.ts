import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
  }

  /* Custom styling for dropdown items */
  wa-dropdown-item {
    --wa-dropdown-item-padding: 12px 16px;
    --wa-dropdown-item-min-height: 60px;
    cursor: pointer;
  }

  wa-dropdown-item:hover {
    background-color: #f5f5f5;
  }

  /* Product icon styling */
  .product-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  /* Product content layout */
  .product-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: left;
  }

  .product-title {
    font-weight: 600;
    font-size: 14px;
    color: #1a1a1a;
    line-height: 1.3;
  }

  .product-description {
    font-size: 12px;
    color: #666;
    line-height: 1.4;
  }

  /* Trigger button styling */
  wa-button[slot="trigger"] {
    --wa-button-padding: 8px;
    cursor: pointer;
  }

  wa-icon[name="grip"] {
    font-size: 20px;
  }

  /* Dropdown positioning - FIXED SELECTOR */
  wa-dropdown::part(menu) {
    /*
     * Tell the positioning system to anchor the right edge of the panel 
     * to the right edge of the trigger (0 offset).
     * !important is necessary to override the inline JS styles.
     */
    right: 0 !important;
    left: auto !important; /* Ensures 'right' takes precedence */
  }

  /* Dropdown size (optional) */
  /* wa-dropdown {
    --wa-dropdown-max-height: 500px;
    --wa-dropdown-min-width: 300px;
  } */
`;
