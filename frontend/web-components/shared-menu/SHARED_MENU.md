# HOT Shared Menu Component

A lightweight, accessible dropdown menu component built with Lit and WebAwesome that displays all HOT products with icons and descriptions.

## Features

- **8 Product Links**: Displays all HOT tools (Drone TM, OAM, Tasking Manager, fAIr, Field TM, ChatMap, Export Tool, uMap)
- **Icon Support**: Each product shows a custom icon from the assets
- **Accessible**: Built with semantic HTML and ARIA labels
- **Responsive**: Works seamlessly across all screen sizes
- **Events**: Dispatches custom events when products are selected

## Installation

### TODO update when moving to UI repository

When moved to the `hotosm/ui` repository:

```bash
npm install @hotosm/ui
# or
pnpm add @hotosm/ui
```

```typescript
import "@hotosm/ui/shared-menu";
```

## Usage

### Basic Usage

Simply add the custom element to your HTML or JSX:

```html
<hotosm-shared-menu></hotosm-shared-menu>
```

### React Usage

```tsx
import "../sharedMenu/sharedMenu";

function Header() {
  return (
    <div className="header">
      <hotosm-shared-menu />
    </div>
  );
}
```

### With Custom Color

You can customize the icon color using the `color` prop:

```tsx
// Default gray
<hotosm-shared-menu />

// Custom hex color
<hotosm-shared-menu color="#d73f3f" />

// Using CSS color names
<hotosm-shared-menu color="white" />
<hotosm-shared-menu color="black" />

// Using RGB/RGBA
<hotosm-shared-menu color="rgb(215, 63, 63)" />
<hotosm-shared-menu color="rgba(215, 63, 63, 0.8)" />

// Match your theme colors
<hotosm-shared-menu color="var(--primary-color)" />
```

### With Event Handling

Listen to the `product-selected` event to track user interactions:

```typescript
const menu = document.querySelector("hotosm-shared-menu");

menu?.addEventListener("product-selected", (event: CustomEvent) => {
  console.log("User selected:", event.detail.product);
  // event.detail.product contains: { id, title, description, href, icon, ... }
});
```
