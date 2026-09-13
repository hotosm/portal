import { useState } from "react";
import exportIcon from "../assets/icons/export.svg";
import umapIcon from "../assets/icons/umap.svg";
import CardAddNew from "../components/shared/CardAddNew";
import Pagination from "../components/shared/Pagination";
import SectionCardGrid from "../components/shared/SectionCardGrid";
import SectionHeader from "../components/shared/SectionHeader";
import { m } from "../paraglide/messages";
import ExportCard from "./components/ExportCard";
import UMapCard from "./components/UMapCard";
import { useExportJobs, useMyMaps } from "./hooks";

const EXPORTS_PER_PAGE = 5;
const MAPS_PER_PAGE = 5;

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

      <SectionCardGrid
        icon={umapIcon}
        title={m.data_maps_creation()}
        toolName="uMap"
        isLoading={mapsLoading}
        addCard={
          <CardAddNew
            title={m.data_umap_card_title()}
            description={m.data_umap_card_description()}
            buttonLabel={m.data_umap_card_button()}
            icon="add"
            buttonHref={m.data_umap_card_href()}
          />
        }
        items={maps}
        renderItem={(map) => <UMapCard project={map} />}
        footer={
          totalMapPages > 1 && (
            <div className="mt-lg">
              <Pagination
                currentPage={mapsPage}
                totalPages={totalMapPages}
                onPageChange={setMapsPage}
              />
            </div>
          )
        }
      />

      <SectionCardGrid
        icon={exportIcon}
        title={m.data_osm_export()}
        toolName="Export Tool"
        isLoading={exportsLoading}
        skeletonCount={2}
        addCard={
          <CardAddNew
            title={m.data_export_card_title()}
            description={m.data_export_card_description()}
            buttonLabel={m.data_export_card_button()}
            icon="add"
            buttonHref="https://export.hotosm.org/v3/exports/new/describe"
          />
        }
        items={exports}
        renderItem={(project) => <ExportCard project={project} />}
        footer={
          totalExportPages > 1 && (
            <div className="mt-lg">
              <Pagination
                currentPage={exportsPage}
                totalPages={totalExportPages}
                onPageChange={setExportsPage}
              />
            </div>
          )
        }
      />
    </>
  );
}

export default DataPage;
