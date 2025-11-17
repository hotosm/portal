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
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative z-10 mt-o mx-sm lg:ml-2xl">
      <h3 className="mb-sm">{title}</h3>
      <div className="max-w-xl text-lg">{children}</div>
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
      <div className="flex flex-col lg:flex-row gap-sm px-sm lg:px-0">
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
      <div className="relative overflow-hidden">
        <div className="grid grid-cols-6 grid-rows-[auto_auto_auto] gap-sm lg:gap-2xl">
          <span className="text-white bg-hot-red-600 text-[4rem] sm:text-[4rem] leading-[4rem] sm:leading-[4rem] col-start-1 col-end-7  row-start-1 row-end-2 py-sm px-md z-10">
            Aerial Imagery
          </span>
          <div className="col-start-4 lg:col-start-3 col-end-7 row-start-1 row-end-4 ">
            <div
              className="w-full h-full bg-cover bg-top grayscale"
              style={{
                backgroundImage: "url('/src/assets/images/drontm-portal.jpg')",
              }}
            />
          </div>
          <div className="row-start-2 col-start-1 col-end-4 lg:col-end-3">
            <SectionDescription>
              <p>{m.imagery_p1()}</p>
              <p>{m.imagery_p2()}</p>
            </SectionDescription>
          </div>
          <div className="row-start-3 col-start-1 col-end-4 lg:col-end-3 bg-white z-10 p-sm">
            {renderProducts({
              items: imagery,
            })}
          </div>
        </div>
      </div>

      {/* MAPPING */}
      <div className="relative overflow-hidden bg-hot-red-50">
        <div className="grid grid-cols-6 grid-rows-[auto_auto_auto] gap-sm lg:gap-2xl">
          <span className="text-white bg-hot-red-600 text-[4rem] sm:text-[4rem] leading-[4rem] sm:leading-[4rem] col-start-2 col-end-7  row-start-1 row-end-2 py-sm px-md z-10">
            Geospatial (or map) data
          </span>
          <div className="row-start-2 col-start-1 col-end-3 ">
            <SectionDescription>
              <p>{m.mapping_p1()}</p>
              <p>{m.mapping_p2()}</p>
            </SectionDescription>
          </div>
          <div className="row-start-2 col-start-3 col-end-7 z-10 p-sm">
            {renderProducts({
              items: mapping,
            })}
          </div>
        </div>
      </div>

      {/* MAP USE */}
      <div className="relative overflow-hidden">
        <div className="grid grid-cols-6 grid-rows-[auto_auto_auto] gap-sm lg:gap-2xl">
          <span className="text-white bg-hot-red-600 text-[4rem] sm:text-[4rem] leading-[4rem] sm:leading-[4rem] col-start-3 col-end-7  row-start-1 row-end-2 py-sm px-md z-10">
            Actionable Insights
          </span>
          <div className="col-start-1 col-end-4 lg:col-end-5 row-start-1 row-end-4">
            <div
              className="w-full h-full bg-cover bg-left-top grayscale"
              style={{
                backgroundImage: "url('/src/assets/images/mapuse-portal.jpg')",
              }}
            />
          </div>
          <div className="row-start-2 col-start-4 lg:col-start-5 col-end-7 ">
            <SectionDescription>
              <p>{m.mapUse_p1()}</p>
              <p>{m.mapUse_p2()}</p>
            </SectionDescription>
          </div>
          <div className="row-start-3 col-start-4 lg:col-start-5 col-end-7 bg-white z-10 p-sm">
            {renderProducts({
              items: mapUse,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechSuiteContainer;
