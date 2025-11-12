import { motion, useInView, useScroll, useTransform } from "motion/react";
import { ReactNode, useRef } from "react";
import { getProductsData } from "../../constants/productsData";
import { useIsMobile } from "../../hooks/useIsMobile";
import { m } from "../../paraglide/messages";
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
  const ref = useRef<HTMLParagraphElement>(null);
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
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end 50%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative z-10 mt-o md:mt-2xl mx-sm lg:ml-2xl"
    >
      <h2 className="font-barlow-condensed mb-sm">{title}</h2>
      <div className="max-w-xl">{children}</div>
    </motion.div>
  );
}

function TechSuiteContainer() {
  const products = getProductsData();
  const imagery = products.filter((p) => p.section === "imagery");
  const mapping = products.filter((p) => p.section === "mapping");
  const mapUse = products.filter((p) => p.section === "mapUse");

  const imageryRef = useRef<HTMLDivElement>(null);
  const mappingRef = useRef<HTMLDivElement>(null);
  const mapUseRef = useRef<HTMLDivElement>(null);

  const imageryVisible = useInView(imageryRef, { once: true, amount: 0.4 });
  const mappingVisible = useInView(mappingRef, { once: true, amount: 1 });
  const mapUseVisible = useInView(mapUseRef, { once: true, amount: 0.4 });

  const renderProducts = ({
    ref,
    items,
  }: {
    ref: any;
    items: typeof products;
    visible: boolean;
  }) => {
    const isMobile = useIsMobile();

    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", isMobile ? "100% 100%" : "end 80%"],
    });

    return (
      <div
        ref={ref}
        className="flex flex-col md:flex-row mt-sm lg:mt-4xl mr-0 lg:mr-2xl gap-sm px-sm lg:px-0"
      >
        {items.map((product, idx) => {
          const opacity = useTransform(
            scrollYProgress,
            [0, 1 + idx * 0.1],
            [0, 1]
          );
          const x = useTransform(
            scrollYProgress,
            [0, isMobile ? 1 : 0.8 + idx * 0.1],
            [80, 0]
          );

          return (
            <motion.div key={product.id} style={{ opacity, x }}>
              <TechSuiteItem
                title={product.title}
                description={product.description}
                icon={product.icon}
              />
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* IMAGERY */}
      <div className="relative overflow-hidden py-4xl lg:py-4xl ">
        <SectionBackgroundText text="IMAGERY" align="right" />
        <div className="flex flex-col lg:flex-row gap-sm lg:gap-2xl">
          <SectionDescription title={`1. ${m.imagery_title()}`}>
            <p>{m.imagery_p1()}</p>
            <p>{m.imagery_p2()}</p>
          </SectionDescription>
          <div className="mt-100">
            {renderProducts({
              ref: imageryRef,
              items: imagery,
              visible: imageryVisible,
            })}
          </div>
        </div>
      </div>

      {/* MAPPING */}
      <div className="bg-hot-red-50 relative overflow-hidden py-4xl lg:py-4xl ">
        <SectionBackgroundText text="MAPPING" align="right" color="dark" />
        <div className="flex flex-col lg:flex-row gap-sm lg:gap-2xl">
          <SectionDescription title={`2. ${m.mapping_title()}`}>
            <p>{m.mapping_p1()}</p>
            <p>{m.mapping_p2()}</p>
          </SectionDescription>
          {renderProducts({
            ref: mappingRef,
            items: mapping,
            visible: mappingVisible,
          })}
        </div>
      </div>

      {/* MAP USE */}
      <div className="relative overflow-hidden py-4xl lg:py-4xl ">
        <SectionBackgroundText text="MAP USE" align="right" />
        <div className="flex flex-col lg:flex-row gap-sm lg:gap-2xl">
          <SectionDescription title={`3. ${m.mapUse_title()}`}>
            <p>{m.mapUse_p1()}</p>
            <p>{m.mapUse_p2()}</p>
          </SectionDescription>
          {renderProducts({
            ref: mapUseRef,
            items: mapUse,
            visible: mapUseVisible,
          })}
        </div>
      </div>
    </div>
  );
}

export default TechSuiteContainer;
