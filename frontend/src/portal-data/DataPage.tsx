import CardAddNew from "../components/shared/CardAddNew";
import CardSkeleton from "../components/shared/CardSkeleton";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import Divider from "../components/shared/Divider";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import UMapCard from "./components/UMapCard";
import { m } from "../paraglide/messages";
import ExportCard from "./components/ExportCard";
import { useExportJobs, useMyMaps } from "./hooks";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

function DataPage() {
  const { data: maps = [], isLoading: mapsLoading } = useMyMaps();
  const { data: exports = [], isLoading: exportsLoading } = useExportJobs();

  return (
    <>
      <SectionHeader>
        <strong>{m.section_data()}</strong>
      </SectionHeader>
      <PageWrapper>
        {/* Export / Download section */}
        <div className="flex flex-col gap-sm py-lg">
          <div>
            <p className="font-semibold text-xl">
              <strong>Download</strong> OpenStreetMap data
            </p>
            <p className="text-base">
              Powered by <strong>Export Tool</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-lg">
            {exportsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={CARD_CLASS}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                <div className={CARD_CLASS}>
                  <CardAddNew
                    title="Export"
                    description="filter and download data in any format"
                    buttonLabel="Create new export"
                    icon="add"
                  />
                </div>
                {exports.map((project) => (
                  <div key={project.id} className={CARD_CLASS}>
                    <ExportCard project={project} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <Divider />

        {/* uMap / Visualize section */}
        <div className="flex flex-col gap-sm py-lg">
          <div>
            <p className="text-xl">
              <strong>Create</strong> map visualizations
            </p>
            <p className="text-base">
              Powered by <strong>uMap</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-lg">
            {mapsLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={CARD_CLASS}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                <div className={CARD_CLASS}>
                  <CardAddNew
                    title="Map"
                    description="put all your data into one map"
                    buttonLabel="Create a map"
                    icon="add"
                  />
                </div>
                {maps.map((map) => (
                  <div key={map.id} className={CARD_CLASS}>
                    <UMapCard project={map} />
                  </div>
                ))}
                <div className={CARD_CLASS}>
                  <CardTakeCourse
                    title="Take the course"
                    subtitle="& get your certification"
                    href="#"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

export default DataPage;
