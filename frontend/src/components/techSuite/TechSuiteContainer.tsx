import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { getProductsData } from "../../constants/productsData";
import TechSuiteItem from "./TechSuiteItem";

function SectionBackgroundText({
  text,
  align = "right",
}: {
  text: string;
  align?: "right" | "left";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <motion.p
      ref={ref}
      style={{ y }}
      className={`absolute top-20 z-0 text-hot-red-50 font-barlow text-[6rem] sm:text-[12rem] leading-[3rem] sm:leading-[7.2rem] ${
        align === "right" ? "right-0" : "left-0"
      }`}
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
    <div className="relative z-10 py-3xl ">
      <h2 className="font-barlow-condensed">{title}</h2>
      <div className="max-w-md">{children}</div>
    </div>
  );
}

function TechSuiteContainer() {
  const products = getProductsData();
  const imagery = products.filter((p) => p.section === "imagery").slice(0, 3);
  const mapping = products.filter((p) => p.section === "mapping").slice(0, 2);
  const mapUse = products.filter((p) => p.section === "mapUse").slice(0, 3);

  const [imageryVisible, setImageryVisible] = useState(false);
  const [mappingVisible, setMappingVisible] = useState(false);
  const [mapUseVisible, setMapUseVisible] = useState(false);

  const imageryRef = useRef<HTMLDivElement>(null);
  const mappingRef = useRef<HTMLDivElement>(null);
  const mapUseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "0px",
    };

    const imageryObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageryVisible(true);
          imageryObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const mappingObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && imageryVisible) {
          // Wait for imagery animation to complete (3 items * 200ms + 600ms animation)
          setTimeout(() => setMappingVisible(true), 1200);
          mappingObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const mapUseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && mappingVisible) {
          // Wait for mapping animation to complete (2 items * 200ms + 600ms animation)
          setTimeout(() => setMapUseVisible(true), 1000);
          mapUseObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (imageryRef.current) imageryObserver.observe(imageryRef.current);
    if (mappingRef.current) mappingObserver.observe(mappingRef.current);
    if (mapUseRef.current) mapUseObserver.observe(mapUseRef.current);

    return () => {
      imageryObserver.disconnect();
      mappingObserver.disconnect();
      mapUseObserver.disconnect();
    };
  }, [imageryVisible, mappingVisible]);

  const renderImageryProducts = (items: typeof products, visible: boolean) => (
    <div className="flex-1 mt-0 md:mt-4xl mr-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start">
        {items.map((product, idx) => (
          <div
            key={product.id}
            className={`flex text-center transition-all duration-800 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{
              marginTop: `${idx * 40}px`,
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
    <div ref={mappingRef} className="relative z-10 container">
      {/* Vertical layout: aligned to the right */}
      <div className="flex flex-col items-end gap-8 py-8 ml-auto max-w-md">
        {items.map((product, idx) => (
          <div
            key={product.id}
            className={`text-center transition-all duration-600 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{
              marginRight: idx === 0 ? "0px" : "40px",
              transitionDelay: visible ? `${idx * 200}ms` : "0ms",
            }}
          >
            <TechSuiteItem
              title={product.title}
              description={product.description}
              alignment="horizontal"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMapUseProducts = (items: typeof products, visible: boolean) => (
    <div ref={mapUseRef} className="relative z-10 container">
      {/* Horizontal layout: right to left with stair-step going down */}
      <div className="flex justify-between items-start py-8 flex-row-reverse">
        {items.map((product, idx) => (
          <div
            key={product.id}
            className={`flex-1 text-center transition-all duration-600 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{
              marginTop: `${idx * 40}px`,
              transitionDelay: visible ? `${idx * 200}ms` : "0ms",
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
      <div className="bg-hot-red-100 min-h-80 relative overflow-hidden">
        <SectionBackgroundText text="IMAGERY" align="right" />

        <div className="flex flex-col lg:flex-row container">
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
          <div ref={imageryRef} className="relative z-10 container">
            {renderImageryProducts(imagery, imageryVisible)}
          </div>
        </div>
      </div>

      {/* MAPPING */}
      <div className=" relative overflow-hidden">
        <SectionBackgroundText text="MAPPING" align="left" />
        <div className="flex flex-col lg:flex-row container">
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
      <div className="bg-hot-red-100 relative overflow-hidden">
        <SectionBackgroundText text="MAP USE" align="right" />
        <div className="flex flex-col lg:flex-row container">
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
