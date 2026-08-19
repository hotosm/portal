import WaTabGroup from '@awesome.me/webawesome/dist/react/tab-group/index.js'
import WaTabPanel from '@awesome.me/webawesome/dist/react/tab-panel/index.js'
import WaTab from '@awesome.me/webawesome/dist/react/tab/index.js'

// Web Awesome tabs: <TabGroup> holds <Tab> elements (nav slot, set automatically)
// and <TabPanel> elements. A tab's `panel` must match its panel's `name`.
//
//   <TabGroup active="general" onWaTabShow={(e) => setTab(e.detail.name)}>
//     <Tab panel="general">General</Tab>
//     <TabPanel name="general">...</TabPanel>
//   </TabGroup>
//
// Lit properties (`active`, `panel`, `name`, ...) are valid at runtime but are
// not surfaced by the @lit/react wrapper types, so we declare them here.

export interface TabGroupProps extends React.ComponentProps<typeof WaTabGroup> {
  children?: React.ReactNode
  /** Name of the tab to show. */
  active?: string
  /** Where the tabs are rendered relative to the panels. */
  placement?: 'top' | 'bottom' | 'start' | 'end'
  /** Whether arrow keys activate a tab immediately or only move focus. */
  activation?: 'auto' | 'manual'
  /** Hides the scroll arrows that appear when tabs overflow. */
  withoutScrollControls?: boolean
}

export interface TabProps extends React.ComponentProps<typeof WaTab> {
  children?: React.ReactNode
  /** Name of the tab panel this tab activates. */
  panel?: string
  /** Disables the tab and prevents selection. */
  disabled?: boolean
}

export interface TabPanelProps extends React.ComponentProps<typeof WaTabPanel> {
  children?: React.ReactNode
  /** The tab panel's name, matched against a tab's `panel`. */
  name?: string
  /** Shows the panel. Normally managed by the tab group. */
  active?: boolean
}

function TabGroup({ children, ...props }: TabGroupProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Lit properties are valid at runtime
  return <WaTabGroup {...(props as any)}>{children}</WaTabGroup>
}

function Tab({ children, ...props }: TabProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Lit properties are valid at runtime
  return <WaTab {...(props as any)}>{children}</WaTab>
}

function TabPanel({ children, ...props }: TabPanelProps) {
  // biome-ignore lint/suspicious/noExplicitAny: Lit properties are valid at runtime
  return <WaTabPanel {...(props as any)}>{children}</WaTabPanel>
}

export { Tab, TabGroup, TabPanel }
export default TabGroup
