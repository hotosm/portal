import { useState } from "react";
import exportIcon from "../assets/icons/export.svg";
import umapIcon from "../assets/icons/umap.svg";
import CardAddNew from "../components/shared/CardAddNew";
import CardSkeleton from "../components/shared/CardSkeleton";
// import CardTakeCourse from "../components/shared/CardTakeCourse";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import PageWrapper from "../components/shared/PageWrapper";
import Pagination from "../components/shared/Pagination";
import SectionHeader from "../components/shared/SectionHeader";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import { m } from "../paraglide/messages";
import ExportCard from "./components/ExportCard";
import UMapCard from "./components/UMapCard";
import { useExportJobs, useMyMaps } from "./hooks";
import { cardClassNames } from "../constants/classNames";

const EXPORTS_PER_PAGE = 6;
const MAPS_PER_PAGE = 6;

function DataPage() {
  const [mapsPage, setMapsPage] = useState(1);
  const [exportsPage, setExportsPage] = useState(1);
  const { data: mapsData, isLoading: mapsLoading } = useMyMaps(mapsPage, MAPS_PER_PAGE);
  const maps = mapsData?.items ?? [];
  const totalMapPages = Math.ceil((mapsData?.total ?? 0) / MAPS_PER_PAGE);
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
            {mapsLoading ? (
              Array.from({ length: 1 }).map((_, i) => (
                <div key={i} className={cardClassNames}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                <div className={cardClassNames}>
                  <CardAddNew
                    title="Create"
                    description="a mapping project"
                    buttonLabel="New project"
                    icon="add"
                    buttonHref="https://umap.hotosm.org/en/map/new/"
                  />
                </div>
                {maps.map((map) => (
                  <div key={map.id} className={cardClassNames}>
                    <UMapCard project={map} />
                  </div>
                ))}
              </>
            )}
          </div>
          {totalMapPages > 1 && (
            <div className="mt-lg">
              <Pagination
                currentPage={mapsPage}
                totalPages={totalMapPages}
                onPageChange={setMapsPage}
              />
            </div>
          )}
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
                <div key={i} className={cardClassNames}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                <div className={cardClassNames}>
                  <CardAddNew
                    title="Export"
                    description="filter and download data in any format"
                    buttonLabel="Create new export"
                    icon="add"
                    buttonHref="https://export.hotosm.org"
                  />
                </div>
                {exports.map((project) => (
                  <div key={project.id} className={cardClassNames}>
                    <ExportCard project={project} />
                  </div>
                ))}
              </>
            )}
            <div className={cardClassNames}>
              <CardDataNotAvailable />
              {/* <CardTakeCourse
                title={m.imagery_take_course_title()}
                subtitle={m.imagery_take_course_subtitle()}
                href="#"
              /> */}
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
