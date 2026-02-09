import PageWrapper from "../components/shared/PageWrapper";
import { useDroneProjects } from "../portal-imagery/hooks/useDroneProjects";

function TestPage() {
  const { data: projects, isLoading, error } = useDroneProjects();

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
      </div>
    </PageWrapper>
  );
}

export default TestPage;
