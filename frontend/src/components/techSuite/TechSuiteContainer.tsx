import { ReactNode } from "react";
import { getProductsData } from "../../constants/productsData";
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
  return (
    <span
      className={`absolute top-0  z-0 font-barlow text-[6rem] sm:text-[12rem] leading-[3rem] sm:leading-[7.2rem] ${
        color === "light" ? "text-hot-red-50" : "text-hot-red-100"
      } ${align === "right" ? "right-0" : "left-0"}`}
    >
      {text}
    </span>
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
    <div className="relative z-10 mt-o md:mt-2xl mx-sm lg:ml-2xl">
      <h2 className="font-barlow-condensed mb-sm">{title}</h2>
      <div className="max-w-xl">{children}</div>
    </div>
  );
}

function TechSuiteContainer() {
  const products = getProductsData();
  const imagery = products.filter((p) => p.section === "imagery");
  const mapping = products.filter((p) => p.section === "mapping");
  const mapUse = products.filter((p) => p.section === "mapUse");

  const renderProducts = ({ items }: { items: typeof products }) => {
    return (
      <div className="flex flex-col md:flex-row mt-sm lg:mt-4xl mr-0 lg:mr-2xl gap-sm px-sm lg:px-0">
        {items.map((product) => {
          return (
            <div>
              <TechSuiteItem
                title={product.title}
                description={product.description}
                icon={product.icon}
              />
            </div>
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
              items: imagery,
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
            items: mapping,
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
            items: mapUse,
          })}
        </div>
      </div>
    </div>
  );
}

export default TechSuiteContainer;
