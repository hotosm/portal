import { useState } from "react";
import exportIcon from "../assets/icons/export.svg";
import umapIcon from "../assets/icons/umap.svg";
import CardAddNew from "../components/shared/CardAddNew";
import CardSkeleton from "../components/shared/CardSkeleton";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import PageWrapper from "../components/shared/PageWrapper";
import Pagination from "../components/shared/Pagination";
import SectionHeader from "../components/shared/SectionHeader";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import { m } from "../paraglide/messages";
import ExportCard from "./components/ExportCard";
import UMapCard from "./components/UMapCard";
import { useExportJobs, useMyMaps } from "./hooks";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

const EXPORTS_PER_PAGE = 6;

function DataPage() {
  const [exportsPage, setExportsPage] = useState(1);
  const { data: maps = [], isLoading: mapsLoading } = useMyMaps();
  const { data: exportsData, isLoading: exportsLoading } = useExportJobs(
    exportsPage,
    EXPORTS_PER_PAGE,
  );

  const exports = exportsData?.items ?? [];
  const totalExportPages = Math.ceil(
    (exportsData?.total ?? 0) / EXPORTS_PER_PAGE,
  );

  return (
    <>
      <SectionHeader>
        <strong>{m.section_data()}</strong>
      </SectionHeader>

      <SubSectionHeader
        icon={umapIcon}
        title="<strong>Create</strong> maps and visualizations "
        toolName="uMap"
      />

      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          <div className="flex flex-wrap gap-lg">
            <div className={CARD_CLASS}>
              <CardAddNew
                title={m.mapping_tm_card_title()}
                description={m.mapping_tm_card_description()}
                buttonLabel={m.mapping_tm_card_button()}
                icon="map"
              />
            </div>
            {mapsLoading ? (
              Array.from({ length: 1 }).map((_, i) => (
                <div key={i} className={CARD_CLASS}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                <div className={CARD_CLASS}>
                  <CardAddNew
                    title="Create"
                    description="a mapping project"
                    buttonLabel="New project"
                    icon="add"
                  />
                </div>
                {maps.map((map) => (
                  <div key={map.id} className={CARD_CLASS}>
                    <UMapCard project={map} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </PageWrapper>

      <SubSectionHeader
        icon={exportIcon}
        title="<strong>Export</strong> OSM Data "
        toolName="Export Tool"
      />

      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
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
            <div className={CARD_CLASS}>
              <CardTakeCourse
                title={m.imagery_take_course_title()}
                subtitle={m.imagery_take_course_subtitle()}
                href="#"
              />
            </div>
          </div>
          {totalExportPages > 1 && (
            <div className="mt-lg">
              <Pagination
                currentPage={exportsPage}
                totalPages={totalExportPages}
                onPageChange={setExportsPage}
              />
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
}

export default DataPage;
