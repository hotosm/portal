# HOT Tool Menu

<!-- markdownlint-disable -->
<p align="center">
  <img src="https://github.com/hotosm/ui/blob/main/src/assets/logo/hot-logo-png.png?raw=true" width="250" alt="HOT"></a>
</p>
<p align="center">
  <em>A web component for displaying HOTOSM tool navigation menu.</em>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@hotosm/tool-menu" target="_blank">
      <img src="https://img.shields.io/npm/v/%40hotosm/tool-menu?color=334D058"
      alt="Package version">
  </a>
  <a href="https://npmtrends.com/@hotosm/tool-menu" target="_blank">
      <img src="https://img.shields.io/npm/dm/%40hotosm%2Ftool-menu"
      alt="Downloads">
  </a>
  <a href="https://github.com/hotosm/portal/blob/main/LICENSE" target="_blank">
      <img src="https://img.shields.io/github/license/hotosm/portal.svg" alt="License">
  </a>
</p>

<!-- markdownlint-enable -->

---

## HOTOSM Tool Menu Web Component

A standalone web component built with Lit that provides a dropdown navigation menu for HOTOSM tools. The menu organizes tools into categories (Imagery, Mapping, Field, Data).

This component is designed to be:

1. Reusable across all HOT applications
2. Easy to integrate
3. Lightweight and framework-agnostic

## Features

- **Dropdown menu** with grid icon trigger
- **Categorized tools** organized by section (Imagery, Mapping, Field, Data)
- **Environment-aware URLs** - automatically detects `.test` domains for development environments
- **Optional tool logos** - can show/hide tool icons
- **Multilanguage support** - Supports en, es, fr, pt. If the language doesn't exist, it uses English
- **Accessible** - includes proper ARIA attributes
- **HOT design system integration** - automatically loads HOT design tokens (colors, spacing, typography)
- **Customizable styling** via CSS custom properties

### Install

```bash
npm install @hotosm/tool-menu
```

or

```bash
pnpm install @hotosm/tool-menu
```

## Usage

### Via Bundler

Import the component in your JavaScript/TypeScript code:

```html
<script type="module">
  import "@hotosm/tool-menu";
</script>

<hotosm-tool-menu show-logos lang="en"></hotosm-tool-menu>
```

### Via CDN

Use the component directly in HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      src="https://cdn.jsdelivr.net/npm/@hotosm/tool-menu@latest/dist/tool-menu.esm.js"
    ></script>
  </head>
  <body>
    <hotosm-tool-menu show-logos lang="en"></hotosm-tool-menu>
  </body>
</html>
```

### React

```jsx
import "@hotosm/tool-menu";

function App() {
  return (
    <div>
      <hotosm-tool-menu
        show-logos={false}
        lang="en"
        onToolSelected={(e) => {
          console.log("Tool selected:", e.detail.tool);
        }}
      />
    </div>
  );
}
```

## API

### Properties

| Property     | Attribute    | Type      | Default | Description                                       |
| ------------ | ------------ | --------- | ------- | ------------------------------------------------- |
| `show-logos` | `show-logos` | `boolean` | `false` | Whether to display tool logos/icons in the menu   |
| `lang`       | `lang`       | `string`  | `"en"`  | Language code for section titles (en, es, fr, pt) |

### Events

| Event           | Type                          | Description                                                                                         |
| --------------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `tool-selected` | `CustomEvent<{ tool: Tool }>` | Fired when a user clicks on a tool in the menu. The event detail contains the selected tool object. |

### Tool Object

```typescript
interface Tool {
  id: string;
  title: string;
  href: string;
  icon: string;
  section: "imagery" | "mapping" | "field" | "data";
}
```

## Included Tools

The menu includes the following HOTOSM tools:

**Imagery**

- Drone Tasking Manager
- OpenAerialMap

**Mapping**

- Tasking Manager
- uMap

**Field**

- Field Mapping Tasking Manager
- ChatMap

**Data**

- fAIr
- Export Tool

## Styling

The component uses Shadow DOM and includes default styles from the [HOT Design System](https://cdn.jsdelivr.net/npm/@hotosm/ui-design@latest/dist/hot.css). The HOT design tokens (colors, spacing, typography) are automatically loaded by the component.

You can customize the appearance by overriding CSS custom properties or by styling the host element.

### CSS Custom Properties

| Property                | Description                           | Default                     |
| ----------------------- | ------------------------------------- | --------------------------- |
| `--hover-bg`            | Background color for trigger on hover | `var(--hot-color-gray-50)`  |
| `--icon-padding`        | Padding around the trigger icon       | `var(--hot-spacing-small)`  |
| `--icon-margin`         | Margin around the menu icon           | `0`                         |
| `--icon-color`          | Color of the menu icon                | `var(--hot-color-gray-800)` |
| `--hover-border-radius` | Border radius of the trigger          | `4px`                       |

**Example:**

```css
hotosm-tool-menu {
  --hover-bg: #f0f0f0;
  --icon-padding: 8px;
  --icon-margin: 2px;
  --icon-color: #333;
  --hover-border-radius: 8px;
}
```

## License

HOT Tool Menu is free and open source software! You may use any HOT project under the terms of the GNU Affero General Public License (AGPL) Version 3.
