import { useEffect, useState } from "react";
import { m } from "../paraglide/messages";

// Sticky sub-nav height (72px) + 1px
const ACTIVE_OFFSET = 73;

export default function MarketplaceSubNav() {
  const items = [
    { id: "about", label: m.marketplace_subnav_about() },
    { id: "services", label: m.marketplace_subnav_services() },
    { id: "contact", label: m.marketplace_subnav_contact() },
  ];
  const [activeId, setActiveId] = useState<string | null>(null);
  const ids = items.map((item) => item.id).join(",");

  useEffect(() => {
    const sectionIds = ids.split(",");
    let frame = 0;

    function updateActive() {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1;
      if (atBottom) {
        setActiveId(sectionIds[sectionIds.length - 1] ?? null);
        return;
      }
      let current: string | null = null;
      for (const id of sectionIds) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= ACTIVE_OFFSET) current = id;
      }
      setActiveId(current);
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(updateActive);
    }

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return (
    <nav
      className="sticky top-0 z-10 flex h-[72px] w-full items-center justify-center gap-[50px] bg-white border-y border-solid border-[var(--hot-color-blue-50)]"
      aria-label="Marketplace sections"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={item.id === activeId ? "location" : undefined}
          className={`nav-main-link flex h-6 min-w-[55px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 font-sans text-base font-medium leading-[120%] text-[var(--wa-color-neutral-on-quiet)] ${
            item.id === activeId ? "font-bold" : ""
          }`}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
