import PageWrapper from "../components/shared/PageWrapper";
import { useDroneProjects } from "../portal-imagery/hooks/useDroneProjects";
import { useOAMImagery } from "../portal-imagery/hooks/useOAMImagery";
import { useMyModels, useMyDatasets } from "../portal-data/hooks/useFairData";
import { useUMapData } from "../portal-mapping/hooks/useUMapData";

function TestPage() {
  const { data: projects, isLoading, error } = useDroneProjects();
  const { data: oamImagery, isLoading: oamLoading, error: oamError } = useOAMImagery();
  const { data: models, isLoading: modelsLoading, error: modelsError } = useMyModels();
  const { data: datasets, isLoading: datasetsLoading, error: datasetsError } = useMyDatasets();
  const { maps: umapMaps, templates: umapTemplates, isLoading: umapLoading, error: umapError } = useUMapData();

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

        {models && models.length === 0 && !modelsLoading && (
          <p>No FAIR models found.</p>
        )}

        {models && models.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {models.map((model) => (
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
        {datasetsError && <p>Error loading datasets: {datasetsError.message}</p>}

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

        <h2>uMap Templates</h2>

        {umapLoading && <p>Loading uMap templates...</p>}

        {umapTemplates && umapTemplates.length === 0 && !umapLoading && (
          <p>No uMap templates found.</p>
        )}

        {umapTemplates && umapTemplates.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {umapTemplates.map((template) => (
              <li
                key={template.id}
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
                    href={template.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600 }}
                  >
                    {template.title}
                  </a>
                  <span style={{ marginLeft: "0.5rem", color: "#666" }}>
                    (template)
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
