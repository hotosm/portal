import { useState } from "react";
import Badge from "../components/shared/Badge";
import Button from "../components/shared/Button";
import Callout from "../components/shared/Callout";
import Card from "../components/shared/Card";
import Dialog from "../components/shared/Dialog";
import Icon from "../components/shared/Icon";
import Tag from "../components/shared/Tag";
import {
  MARKETPLACE_FORM_URL,
  getCommissionData,
  getHowItWorksSteps,
  getMarketplaceServices,
  getWhoItsFor,
} from "../constants/marketplaceData";
import { m } from "../paraglide/messages";

const sectionClassName = "container flex flex-col gap-lg pb-3xl pt-xl";
const sectionTitleClassName = "text-2xl font-semibold leading-tight";
const cardTitleClassName = "text-base font-semibold leading-tight";
const cardBodyClassName = "text-sm leading-relaxed";

function MarketplacePage() {
  const audiences = getWhoItsFor();
  const steps = getHowItWorksSteps();
  const commissionColumns = getCommissionData();
  const services = getMarketplaceServices();
  const [isFormOpen, setIsFormOpen] = useState(false);

  function openForm() {
    setIsFormOpen(true);
  }

  return (
    <div className="mb-3xl">
      <section
        className="mb-3xl"
        style={{
          background: "linear-gradient(to right, #FFE6DE 0%, #E6F6F5 100%)",
        }}
      >
        <div className="container flex flex-col gap-lg py-4xl">
          <span className="text-sm text-hot-red-600 font-semibold leading-tight tracking-[0.12em]">
            {m.marketplace_hero_eyebrow()}
          </span>
          <h1 className="max-w-[600px] text-3xl font-semibold leading-tight">
            {m.marketplace_hero_title()}
          </h1>
          <div className="flex flex-col gap-lg md:flex-row md:items-end md:justify-between">
            <p className="max-w-2xl text-lg leading-relaxed text-hot-gray-800">
              {m.marketplace_hero_subtitle()}
            </p>
            <Button
              variant="danger"
              size="large"
              className="shrink-0 self-start md:self-end"
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
          </div>
        </div>
      </section>

      <section className={sectionClassName}>
        <h2 className={sectionTitleClassName}>
          {m.marketplace_whatitis_title()}
        </h2>
        <div className="flex flex-col gap-2xl md:flex-row md:items-end">
          <div className="flex flex-1 flex-col gap-md">
            <p className="leading-relaxed">
              {m.marketplace_whatitis_emphasis()}{" "}
              <strong className="underline decoration-hot-red-600 decoration-2 underline-offset-4">
                {m.marketplace_whatitis_emphasis_highlight()}
              </strong>
            </p>
            <p className="leading-relaxed text-hot-gray-800">
              {m.marketplace_whatitis_intro()}
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
        <h2 className={sectionTitleClassName}>{m.marketplace_whofor_title()}</h2>
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
        <h2 className={sectionTitleClassName}>{m.marketplace_how_title()}</h2>
        <ol className="grid list-none gap-lg p-0 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.id} className="flex flex-col gap-sm m-0">
              <Badge variant="neutral" pill className="self-start text-2xl">
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
        <span>
          <p className="leading-relaxed">
              {m.marketplace_whatitis_emphasis()}{" "}
              <strong className="underline decoration-hot-red-600 decoration-2 underline-offset-4">
                {m.marketplace_whatitis_emphasis_highlight()}
              </strong>
            </p>
          <h2 className={sectionTitleClassName}>
            {m.marketplace_commission_title()}
          </h2>
        </span>
        <div className="grid gap-lg md:grid-cols-2">
          {commissionColumns.map((column) => (
            <Card key={column.id} appearance="filled">
              <div className="flex flex-col gap-sm">
                <h3 className={cardTitleClassName}>{column.title}</h3>
                <ul
                  className={`${cardBodyClassName} flex list-disc flex-col gap-2xs pl-md`}
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

      <section className={sectionClassName}>
        <h2 className={sectionTitleClassName}>
          {m.marketplace_services_title()}
        </h2>
        <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <Card key={service.id} className="grow">
              <div className="flex flex-col items-start gap-sm">
                {service.iconSrc ? (
                  <img src={service.iconSrc} alt="" className="h-12 w-12" />
                ) : (
                  <Icon
                    family="classic"
                    variant="solid"
                    name={service.icon}
                    label=""
                    className="text-3xl"
                  />
                )}
                <p className="text-lg leading-relaxed">{service.title}</p>
                <Tag
                  variant={service.type === "product" ? "neutral" : "success"}
                  appearance="filled"
                  className="uppercase"
                >
                  {service.type === "product"
                    ? m.marketplace_badge_product()
                    : m.marketplace_badge_service()}
                </Tag>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className={sectionClassName}>
        <Card appearance="filled">
          <div className="flex flex-col gap-md">
            <h2 className="text-xl font-semibold leading-tight">
              {m.marketplace_cta_title()}
            </h2>
            <p className={cardBodyClassName}>{m.marketplace_cta_body()}</p>
            <p className={cardBodyClassName}>{m.marketplace_cta_note()}</p>
            <p className={cardBodyClassName}>{m.marketplace_cta_contact()}</p>
            <div className="flex justify-end">
              <Button variant="neutral" onClick={openForm}>
                <Icon
                  slot="start"
                  family="classic"
                  variant="solid"
                  name="rocket"
                  label=""
                />
                {m.marketplace_cta_button()}
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
