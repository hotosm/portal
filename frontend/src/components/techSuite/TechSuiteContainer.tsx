import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "motion/react";
import { getProductsData } from "../../constants/productsData";
import TechSuiteItem from "./TechSuiteItem";

function SectionBackgroundText({
  text,
  align = "right",
  color = "light",
}: {
  text: string;
  align?: "right" | "left";
  color?: "dark" | "light";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -250]);

  return (
    <motion.p
      ref={ref}
      style={{ y }}
      className={`absolute top-36 lg:top-20 z-0 font-barlow text-[6rem] sm:text-[12rem] leading-[3rem] sm:leading-[7.2rem] ${
        color === "light" ? "text-hot-red-50" : "text-hot-red-100"
      } ${align === "right" ? "right-0" : "left-0"}`}
    >
      {text}
    </motion.p>
  );
}

function SectionDescription({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative z-10">
      <h2 className="font-barlow-condensed">{title}</h2>
      <div className="max-w-xl">{children}</div>
    </div>
  );
}

function TechSuiteContainer() {
  const products = getProductsData();
  const imagery = products.filter((p) => p.section === "imagery").slice(0, 3);
  const mapping = products.filter((p) => p.section === "mapping").slice(0, 2);
  const mapUse = products.filter((p) => p.section === "mapUse").slice(0, 3);

  const imageryRef = useRef<HTMLDivElement>(null);
  const mappingRef = useRef<HTMLDivElement>(null);
  const mapUseRef = useRef<HTMLDivElement>(null);

  const imageryVisible = useInView(imageryRef, { once: true, amount: 0.4 });
  const mappingVisible = useInView(mappingRef, { once: true, amount: 1 });
  const mapUseVisible = useInView(mapUseRef, { once: true, amount: 0.4 });

  const renderImageryProducts = (items: typeof products, visible: boolean) => (
    <div ref={imageryRef} className="mt-0 lg:mt-4xl mr-0 md:mr-4xl">
      <div className="flex flex-col md:flex-row gap-0 md:gap-4xl items-center md:items-start">
        {items.map((product, idx) => (
          <div
            key={product.id}
            className={`flex text-center transition-all duration-800 mt-0 md:mt-[var(--stair-step)] ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{
              // @ts-ignore Tailwind can't process dynamic classes
              "--stair-step": `${idx * 32}px`,
              transitionDelay: visible ? `${idx * 800}ms` : "0ms",
            }}
          >
            <TechSuiteItem
              title={product.title}
              description={product.description}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMappingProducts = (items: typeof products, visible: boolean) => (
    <div ref={mappingRef} className="relative z-10 w-full">
      {/* Vertical layout: aligned to the right */}
      <div className="flex flex-col items-end gap-8 py-8 ml-auto max-w-md">
        {items.map((product) => (
          <div
            key={product.id}
            className={`text-center transition-all duration-600 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <TechSuiteItem
              title={product.title}
              description={product.description}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMapUseProducts = (items: typeof products, visible: boolean) => (
    <div ref={mapUseRef} className="mt-0 lg:mt-4xl mr-0 md:mr-4xl">
      <div className="flex flex-col-reverse md:flex-row-reverse gap-0 md:gap-4xl items-center md:items-start">
        {items.map((product, idx) => (
          <div
            key={product.id}
            className={`flex-1 text-center transition-all duration-800 mt-0 lg:mt-[var(--stair-step)] ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{
              // @ts-ignore
              "--stair-step": `${idx * 30}px`,
              transitionDelay: visible ? `${idx * 800}ms` : "0ms",
            }}
          >
            <TechSuiteItem
              title={product.title}
              description={product.description}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* IMAGERY */}
      <div className="relative overflow-hidden py-3xl lg:py-4xl">
        <SectionBackgroundText text="IMAGERY" align="right" />

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-4xl container">
          <SectionDescription title="1. Aerial Imagery">
            <p>
              Drone and satellite imagery show features on the ground
              (buildings, roads, and more) that can be tied to a specific
              location.
            </p>
            <p>
              High-resolution, up-to-date imagery is usually costly, while
              openly available options have lower resolutions or are outdated.
            </p>
          </SectionDescription>
          {renderImageryProducts(imagery, imageryVisible)}
        </div>
      </div>

      {/* MAPPING */}
      <div className="bg-hot-red-50 relative overflow-hidden py-3xl">
        <SectionBackgroundText text="MAPPING" align="left" color="dark" />
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-4xl container">
          <SectionDescription title="2. Geospatial (or map) data">
            <p>
              With eyes on the ground, we now can start tracing the shapes on
              the imagery and add them to databases, such as OpenStreetMap. The
              tracing is done remotely, either manually or with Artificial
              Intelligence (AI).
            </p>
            <p>
              Field mapping complements these databases by adding more context
              about the features (e.g., “this is a hospital”).
            </p>
          </SectionDescription>
          {renderMappingProducts(mapping, mappingVisible)}
        </div>
      </div>

      {/* MAP USE */}
      <div className="relative overflow-hidden py-3xl">
        <SectionBackgroundText text="MAP USE" align="right" />
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-4xl container">
          <SectionDescription title="3. Actionable Insights">
            <p>
              The information collected in the previous steps is now used by
              different stakeholders and communities themselves for data-driven
              action.
            </p>
            <p>
              While most databases and analysis tools are too restrictive due to
              privacy, costs, or technical knowledge, we’ve lowered the barrier
              to entry so more people can use them.
            </p>
          </SectionDescription>
          {renderMapUseProducts(mapUse, mapUseVisible)}
        </div>
      </div>
    </div>
  );
}

export default TechSuiteContainer;
