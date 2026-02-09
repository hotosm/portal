import PageWrapper from "../components/shared/PageWrapper";
import { useDroneProjects } from "../portal-imagery/hooks/useDroneProjects";
import { useMyModels, useMyDatasets } from "../portal-data/hooks/useFairData";

function TestPage() {
  const { data: projects, isLoading, error } = useDroneProjects();
  const { data: models, isLoading: modelsLoading, error: modelsError } = useMyModels();
  const { data: datasets, isLoading: datasetsLoading, error: datasetsError } = useMyDatasets();

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
      </div>
    </PageWrapper>
  );
}

export default TestPage;
