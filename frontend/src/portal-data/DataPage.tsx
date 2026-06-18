import { useState } from "react";
import exportIcon from "../assets/icons/export.svg";
import umapIcon from "../assets/icons/umap.svg";
import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import Pagination from "../components/shared/Pagination";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import SectionHeader from "../components/shared/SectionHeader";
import { cardClassNames } from "../constants/classNames";
import { m } from "../paraglide/messages";
import ExportCard from "./components/ExportCard";
import UMapCard from "./components/UMapCard";
import { useExportJobs, useMyMaps } from "./hooks";

const EXPORTS_PER_PAGE = 6;
const MAPS_PER_PAGE = 6;

function DataPage() {
  const [mapsPage, setMapsPage] = useState(1);
  const [exportsPage, setExportsPage] = useState(1);

  const { data: mapsData, isLoading: mapsLoading } = useMyMaps(mapsPage, MAPS_PER_PAGE);
  const maps = mapsData?.items ?? [];
  const totalMapPages = Math.ceil((mapsData?.total ?? 0) / MAPS_PER_PAGE);

  const { data: exportsData, isLoading: exportsLoading } = useExportJobs(exportsPage, EXPORTS_PER_PAGE);
  const exports = exportsData?.items ?? [];
  const totalExportPages = Math.ceil((exportsData?.total ?? 0) / EXPORTS_PER_PAGE);

  return (
    <>
      <SectionHeader>
        <strong>{m.section_data()}</strong>
      </SectionHeader>

      <SectionCardGrid
        icon={umapIcon}
        title="<strong>Create</strong> maps and visualizations"
        toolName="uMap"
        isLoading={mapsLoading}
        pagination={
          totalMapPages > 1 && (
            <Pagination
              currentPage={mapsPage}
              totalPages={totalMapPages}
              onPageChange={setMapsPage}
            />
          )
        }
      >
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
      </SectionCardGrid>

      <SectionCardGrid
        icon={exportIcon}
        title="<strong>Export</strong> OSM Data"
        toolName="Export Tool"
        isLoading={exportsLoading}
        skeletonCount={2}
        staticCards={
          <div className={cardClassNames}>
            <CardDataNotAvailable />
          </div>
        }
        pagination={
          totalExportPages > 1 && (
            <Pagination
              currentPage={exportsPage}
              totalPages={totalExportPages}
              onPageChange={setExportsPage}
            />
          )
        }
      >
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
      </SectionCardGrid>
    </>
  );
}

export default DataPage;
