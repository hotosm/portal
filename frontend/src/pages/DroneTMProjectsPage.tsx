import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  total_task_count: number;
  completed_task_count: number;
  ongoing_task_count: number;
}

function DroneTMProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get Drone-TM frontend URL from environment
  const droneTmFrontendUrl = import.meta.env.VITE_DRONE_TM_FRONTEND_URL || 'http://127.0.0.1:3040';

  useEffect(() => {
    // Add cleanup flag to prevent race conditions
    let isCancelled = false;
    const requestId = Math.random().toString(36).substring(7);

    const fetchProjects = async () => {
      try {
        console.log(`🚁 [${requestId}] Fetching drone-tm projects...`);

        // Fetch projects from drone-tm API with filter_by_owner=true
        // The Hanko cookie will be sent automatically via the proxy
        // /api/drone-tm/* proxies to dronetm-backend via Vite proxy (see vite.config.ts)
        // MUST use relative URL so Vite proxy can intercept it
        const timestamp = Date.now(); // Cache busting
        const apiUrl = `/api/drone-tm/projects/?filter_by_owner=true&page=1&results_per_page=20&_t=${timestamp}`;
        console.log(`  [${requestId}] Fetching from URL:`, apiUrl);
        console.log(`  [${requestId}] Protocol: ${window.location.protocol}, Full URL would be: ${window.location.origin}${apiUrl}`);
        const response = await fetch(apiUrl, {
          credentials: 'include', // Send cookies (Hanko JWT)
        });

        if (isCancelled) return;

        console.log('  Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }

        const data = await response.json();
        console.log(`  [${requestId}] Projects data:`, data);

        if (!isCancelled) {
          setProjects(data.results || []);
          setLoading(false);
        }
      } catch (err) {
        console.error(`❌ [${requestId}] Error fetching projects:`, err);
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    fetchProjects();

    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-xl">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Drone-TM Projects</h1>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-xl">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Drone-TM Projects</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-xl bg-hot-gray-50 rounded-xl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Drone-TM Projects</h1>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Integration Test:</strong> This page fetches projects from drone-tm API using Hanko SSO authentication.
            The Hanko user ID is automatically mapped to your drone-tm user ID.
          </p>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-600">No projects found.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2 text-hot-primary">
                      {project.name}
                    </h2>
                    <p className="text-gray-600 mb-3">{project.description}</p>

                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-500">
                        Status: <span className="font-medium">{project.status}</span>
                      </span>
                      <span className="text-gray-500">
                        Tasks: <span className="font-medium">{project.total_task_count}</span>
                      </span>
                      <span className="text-green-600">
                        Completed: <span className="font-medium">{project.completed_task_count}</span>
                      </span>
                      <span className="text-blue-600">
                        Ongoing: <span className="font-medium">{project.ongoing_task_count}</span>
                      </span>
                    </div>
                  </div>

                  <a
                    href={`${droneTmFrontendUrl}/projects/${project.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-6 py-3 bg-white border-2 border-hot-gray-200 rounded-lg hover:border-hot-red hover:shadow-md transition-all flex items-center justify-center"
                  >
                    <img
                      src="/images/DTM-logo-black.svg"
                      alt="Drone-TM"
                      className="h-8"
                    />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DroneTMProjectsPage;
