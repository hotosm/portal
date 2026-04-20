import PageWrapper from "../components/shared/PageWrapper";
import { useDroneProjects } from "../portal-imagery/hooks/useDroneProjects";
import { useOAMImagery } from "../portal-imagery/hooks/useOAMImagery";
import {
  useMyModels,
  useMyDatasets,
} from "../portal-mapping/hooks/useFairData";
import { useMyMaps } from "../portal-data/hooks/useUMapData";
import { useExportJobs } from "../portal-data/hooks/useExportToolData";
import { useChatMapData } from "../portal-field/hooks/useChatMapData";

function TestPage() {
  const { data: projects, isLoading, error } = useDroneProjects();
  const {
    data: oamImagery,
    isLoading: oamLoading,
    error: oamError,
  } = useOAMImagery();
  const {
    data: models,
    isLoading: modelsLoading,
    error: modelsError,
  } = useMyModels();
  const {
    data: datasets,
    isLoading: datasetsLoading,
    error: datasetsError,
  } = useMyDatasets();
  const {
    data: umapMaps,
    isLoading: umapLoading,
    error: umapError,
  } = useMyMaps();
  const {
    data: exportJobs,
    isLoading: exportsLoading,
    error: exportsError,
  } = useExportJobs();
  const {
    data: chatmap,
    isLoading: chatmapLoading,
    error: chatmapError,
  } = useChatMapData();

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <h2>Drone Projects</h2>

        {isLoading && <p>Loading drone projects...</p>}
        {error && <p>Error loading projects: {error.message}</p>}

        {projects && projects.length === 0 && !isLoading && (
          <p>No drone projects found.</p>
        )}

        {projects && projects.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {projects.map((project) => (
              <li
                key={project.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                )}
                <div>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    {project.title}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2>OAM Imagery</h2>

        {oamLoading && <p>Loading OAM imagery...</p>}
        {oamError && <p>Error loading OAM imagery: {oamError.message}</p>}

        {oamImagery && oamImagery.length === 0 && !oamLoading && (
          <p>No OAM imagery found.</p>
        )}

        {oamImagery && oamImagery.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {oamImagery.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                )}
                <div>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    {item.title}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2>FAIR Models</h2>

        {modelsLoading && <p>Loading FAIR models...</p>}
        {modelsError && <p>Error loading models: {modelsError.message}</p>}

        {models && models.items.length === 0 && !modelsLoading && (
          <p>No FAIR models found.</p>
        )}

        {models && models.items.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {models.items.map((model) => (
              <li
                key={model.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <a
                    href={model.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    {model.title}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2>FAIR Datasets</h2>

        {datasetsLoading && <p>Loading FAIR datasets...</p>}
        {datasetsError && (
          <p>Error loading datasets: {datasetsError.message}</p>
        )}

        {datasets && datasets.length === 0 && !datasetsLoading && (
          <p>No FAIR datasets found.</p>
        )}

        {datasets && datasets.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {datasets.map((dataset) => (
              <li
                key={dataset.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <a
                    href={dataset.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    {dataset.title}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2>Export Tool Jobs</h2>

        {exportsLoading && <p>Loading export jobs...</p>}
        {exportsError && (
          <p>Error loading export jobs: {exportsError.message}</p>
        )}

        {exportJobs && exportJobs.length === 0 && !exportsLoading && (
          <p>No export jobs found.</p>
        )}

        {exportJobs && exportJobs.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {exportJobs.map((job) => (
              <li
                key={job.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <a
                    href={job.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    {job.title}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2>uMap Maps</h2>

        {umapLoading && <p>Loading uMap maps...</p>}
        {umapError && <p>Error loading uMap maps: {umapError.message}</p>}

        {umapMaps && umapMaps.length === 0 && !umapLoading && (
          <p>No uMap maps found.</p>
        )}

        {umapMaps && umapMaps.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {umapMaps.map((map) => (
              <li
                key={map.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <a
                    href={map.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    {map.title}
                  </a>
                  <span style={{ marginLeft: "0.5rem", color: "#666" }}>
                    ({map.status})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2>ChatMap</h2>

        {chatmapLoading && <p>Loading chatmap...</p>}
        {chatmapError && <p>Error loading chatmap: {chatmapError.message}</p>}

        {chatmap && chatmap.length === 0 && !chatmapLoading && (
          <p>No chatmap data found.</p>
        )}

        {chatmap && chatmap.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {chatmap.map((item) => (
              <li
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    {item.title}
                  </a>
                  <span style={{ marginLeft: "0.5rem", color: "#666" }}>
                    ({item.status})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageWrapper>
  );
}

export default TestPage;
