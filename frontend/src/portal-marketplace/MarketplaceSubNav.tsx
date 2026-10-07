import { m } from "../paraglide/messages";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function MarketplaceSubNav() {
  const items = [
    { id: "about", label: m.marketplace_subnav_about() },
    { id: "services", label: m.marketplace_subnav_services() },
    { id: "contact", label: m.marketplace_subnav_contact() },
  ];

  return (
    <nav
      className="sticky top-0 z-10 flex h-[72px] w-full items-center justify-center gap-[50px] bg-white border-y border-solid border-[var(--hot-color-blue-50)]"
      aria-label="Marketplace sections"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => scrollToSection(item.id)}
          className="nav-main-link flex h-6 min-w-[55px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 font-sans text-base font-medium leading-[120%] text-[var(--wa-color-neutral-on-quiet)]"
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
