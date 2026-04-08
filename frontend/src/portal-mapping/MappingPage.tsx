import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import Divider from "../components/shared/Divider";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import DataCard from "../portal-data/components/DataCard";
import { getFairBaseUrl } from "../utils/envConfig";
import { useMyDatasets, useMyModels } from "./hooks";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

function MappingPage() {
  const { data: models = [], isLoading: modelsLoading } = useMyModels();
  const { data: sets = [], isLoading: datasetsLoading } = useMyDatasets();

  const isLoading = modelsLoading || datasetsLoading;

  if (isLoading) {
    /* return <PortalPageSkeleton />; */
    return <p className="flex justify-center items-center pt-10">Loading...</p>;
  }

  return (
    <>
      <SectionHeader>
        <strong>Tasking Manager</strong> and <strong>fAIr</strong>
      </SectionHeader>
      <PageWrapper>
        {/* Remote mapping section */}
        <div className="flex flex-col gap-sm py-lg">
          <div>
            <p className="font-semibold text-xl">
              <strong>Remote</strong> mapping
            </p>
            <p className="text-base">
              Powered by <strong>Tasking Manager</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-lg">
            <div className={CARD_CLASS}>
              <CardDataNotAvailable />
            </div>
          </div>
        </div>

        <Divider />

        {/* AI-assisted mapping section */}
        <div className="flex flex-col gap-sm py-lg">
          <div>
            <p className="font-semibold text-xl">
              <strong>AI-assisted</strong> mapping
            </p>
            <p className="text-base">
              Powered by{" "}
              <a
                href={getFairBaseUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <strong>fAIr</strong>
              </a>
            </p>
          </div>

          {models.length > 0 && (
            <div className="flex flex-col gap-sm">
              <p className="text-lg">
                Your <strong>models</strong>
              </p>
              <div className="flex flex-wrap gap-lg">
                {models.map((project) => (
                  <div key={project.id} className={CARD_CLASS}>
                    <DataCard project={project} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {sets.length > 0 && (
            <div className="flex flex-col gap-sm">
              <p className="text-lg">
                Your <strong>datasets</strong>
              </p>
              <div className="flex flex-wrap gap-lg">
                {sets.map((project) => (
                  <div key={project.id} className={CARD_CLASS}>
                    <DataCard project={project} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}

export default MappingPage;
