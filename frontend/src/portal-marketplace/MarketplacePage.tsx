import { useState } from "react";
import Badge from "../components/shared/Badge";
import Button from "../components/shared/Button";
import Callout from "../components/shared/Callout";
import Card from "../components/shared/Card";
import Dialog from "../components/shared/Dialog";
import Icon from "../components/shared/Icon";
import {
  MARKETPLACE_CONTACT_URL,
  MARKETPLACE_FORM_URL,
  MARKETPLACE_MORE_INFO_URL,
  getCommissionData,
  getHowItWorksSteps,
  getMarketplaceServices,
  getWhoItsFor,
} from "../constants/marketplaceData";
import { m } from "../paraglide/messages";
import MarketplaceSubNav from "./MarketplaceSubNav";
import { renderBold } from "./renderBold";

const sectionClassName =
  "container flex flex-col gap-lg pb-3xl pt-xl scroll-mt-[72px]";
const cardTitleClassName = "text-base font-semibold leading-tight";
const cardBodyClassName = "text-sm leading-relaxed";
const brandGradient =
  "linear-gradient(to right, rgb(255, 230, 222) 0%, rgb(230, 246, 245) 100%)";

function trackStartYourProject() {
  const paq = (window._paq = window._paq || []);
  paq.push(["setCustomUrl", "/marketplace#start-your-project"]);
  paq.push(["setDocumentTitle", "Marketplace > Start your project"]);
  paq.push(["trackPageView"]);
}

function MarketplacePage() {
  const audiences = getWhoItsFor();
  const steps = getHowItWorksSteps();
  const commissionColumns = getCommissionData();
  const services = getMarketplaceServices();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  

  function openForm() {
    setIsFormOpen(true);
    trackStartYourProject();
  }

  return (
    <div className="mb-3xl">
      <MarketplaceSubNav />
      <section className="mb-3xl" style={{ background: brandGradient }}>
        <div className="container flex flex-col gap-lg py-4xl">
          <span className="text-sm text-hot-red-600 font-semibold leading-tight tracking-[0.12em]">
            {m.marketplace_hero_eyebrow()}
          </span>
          <h1 className="max-w-[600px] text-3xl font-semibold leading-tight">
            {m.marketplace_hero_title()}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-hot-gray-800">
            {renderBold(m.marketplace_hero_subtitle())}
          </p>
          <div className="flex flex-col gap-md md:flex-row md:flex-wrap">
            <Button
              variant="danger"
              size="large"
              className="w-full md:w-auto"
              onClick={openForm}
            >
              <Icon
                slot="start"
                family="classic"
                variant="solid"
                name="rocket"
                label=""
              />
              {m.marketplace_hero_cta()}
            </Button>
            <Button
              variant="neutral"
              appearance="accent"
              size="large"
              className="w-full md:w-auto"
              href={MARKETPLACE_MORE_INFO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {m.marketplace_hero_cta_more_info()}
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className={sectionClassName}>
        <h3>
          {m.marketplace_whatitis_title()}
        </h3>
        <div className="flex flex-col gap-2xl md:flex-row md:items-center">
          <div className="flex flex-1 flex-col gap-md">
            <p className="leading-relaxed text-hot-gray-800">
              {renderBold(m.marketplace_whatitis_intro())}
            </p>
            <p className="leading-relaxed text-hot-gray-800">
              {m.marketplace_whatitis_body()}
            </p>
          </div>
          <Callout
            variant="neutral"
            appearance="accent"
            className="shrink-0 text-center md:max-w-md"
          >
            <em className="text-lg leading-relaxed">
              {m.marketplace_whatitis_callout()}
            </em>
          </Callout>
        </div>
      </section>

      <section className={sectionClassName}>
        <h3>{m.marketplace_whofor_title()}</h3>
        <div className="grid gap-lg md:grid-cols-2">
          {audiences.map((audience) => (
            <Card key={audience.id} appearance="filled">
              <div className="flex flex-col gap-sm">
                <h3 className={cardTitleClassName}>{audience.title}</h3>
                <p className={cardBodyClassName}>{audience.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className={sectionClassName}>
        <ol className="grid list-none gap-lg p-0 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.id} className="flex flex-col gap-sm m-0">
              <Badge
                variant="neutral"
                pill
                className="self-start text-2xl"
                style={
                  {
                    "--wa-color-fill-loud": "var(--hot-color-red-600)",
                  } as React.CSSProperties
                }
              >
                {index + 1}
              </Badge>
              <Card className="grow">
                <div className="flex flex-col gap-sm">
                  <h3 className={cardTitleClassName}>{step.title}</h3>
                  <span className={cardBodyClassName}>{step.description}</span>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className={sectionClassName}>
        <h3>{m.marketplace_commission_title()}</h3>
        <div className="grid gap-lg md:grid-cols-2">
          {commissionColumns.map((column) => (
            <Card key={column.id} appearance="filled">
              <div className="flex flex-col gap-sm">
                <h3 className={cardTitleClassName}>{column.title}</h3>
                <ul
                  className={`${cardBodyClassName} flex list-disc flex-col gap-2xs text-[var(--wa-color-text-quiet)]`}
                >
                  {column.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="services" className={sectionClassName}>
        <h3>
          {m.marketplace_services_title()}
        </h3>
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id} className="grow">
              <div className="grid grid-cols-[auto_1fr] items-start gap-x-md gap-y-xs">
                {service.iconSrc ? (
                  <img
                    src={service.iconSrc}
                    alt=""
                    className="row-span-2 h-12 w-12 self-start"
                  />
                ) : (
                  <Icon
                    family="classic"
                    variant="solid"
                    name={service.icon}
                    label=""
                    className="row-span-2 self-start text-3xl"
                  />
                )}
                <p className="text-lg leading-relaxed">{service.title}</p>
                <p className="m-0 text-left font-sans text-sm font-normal leading-[160%] tracking-normal text-hot-gray-800">
                  {service.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section id="contact" className={sectionClassName}>
        <Card
          appearance="filled"
          className="[&::part(base)]:bg-transparent"
          style={{ background: brandGradient }}
        >
          <div className="flex flex-col gap-md">
            <h2 className="text-xl font-semibold leading-tight">
              {m.marketplace_cta_title()}
            </h2>
            <p className="text-lg">{m.marketplace_cta_body()}</p>
            <p className={cardBodyClassName}>{m.marketplace_cta_note()}</p>
            <p className={cardBodyClassName}>{m.marketplace_cta_contact()}{" "}<strong><a className="bold" href="mailto:info@hotosm.org">info@hotosm.org</a></strong></p>
            <div className="flex flex-wrap justify-end gap-md">
              <Button variant="danger" onClick={openForm}>
                <Icon
                  slot="start"
                  family="classic"
                  variant="solid"
                  name="rocket"
                  label=""
                />
                {m.marketplace_hero_cta()}
              </Button>
              <Button
                variant="neutral"
                appearance="accent"
                href={MARKETPLACE_CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {m.marketplace_cta_contact_us()}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <Dialog
        open={isFormOpen}
        label={m.marketplace_cta_title()}
        onWaHide={() => setIsFormOpen(false)}
        style={{ "--width": "800px" } as React.CSSProperties}
      >
        <iframe
          title={m.marketplace_cta_title()}
          src={MARKETPLACE_FORM_URL}
          width="100%"
          height="533"
          frameBorder="0"
          className="block rounded-md border border-hot-neutral-100 bg-transparent"
        />
      </Dialog>
    </div>
  );
}

export default MarketplacePage;
