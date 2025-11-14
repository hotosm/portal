import { useEffect, useState } from "react";
import { ProjectsMap } from "../components/ProjectsMap";
import TechSuiteContainer from "../components/techSuite/TechSuiteContainer";
import { useLanguage } from "../contexts/LanguageContext";
import { useProjects } from "../hooks/useProjects";
import { m } from "../paraglide/messages";

function HomePage() {
  const { currentLanguage: _currentLanguage } = useLanguage(); // suscribe to force re-render on language change
  // TODO relocate when adding other APIs
  const { data: projectsData, isLoading, error } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  const handleProjectClick = (projectId: number) => {
    console.log("Project clicked:", projectId);
    setSelectedProjectId(projectId);
  };

  // Listen for popup button clicks
  useEffect(() => {
    const handleViewProject = (event: CustomEvent) => {
      const projectId = event.detail?.projectId;
      if (projectId) {
        console.log("View project details:", projectId);
        // TODO: Navigate to project details page
        // Example: navigate(`/projects/${projectId}`);
        alert(
          `Viewing project #${projectId}\n\nThis will navigate to the project details page.`
        );
      }
    };

    window.addEventListener("viewProject" as any, handleViewProject as any);
    return () => {
      window.removeEventListener(
        "viewProject" as any,
        handleViewProject as any
      );
    };
  }, []);

  return (
    <div className="space-y-lg md:space-y-3xl">
      {/* Map Section */}
      <div className="h-[calc(100vh_-_100px)] px-lg md:px-2xl pb-lg md:pb-2xl relative">
        <ProjectsMap
          mapResults={projectsData}
          selectedProjectId={selectedProjectId}
          onProjectClick={handleProjectClick}
          onCloseDetails={() => setSelectedProjectId(null)}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm">
            <p>{m.loading_projects()}...</p>
          </div>
        )}
        {/* TODO customize error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <p>{m.loading_projects_error()}</p>
          </div>
        )}
      </div>
      <div className="container text-center">
        <h2>{m.home_workflow_header()}</h2>
        <h4>
          {m.home_workflow_p1()}
          <br />
          {m.home_workflow_p2()}
        </h4>
      </div>

      {/* Tech Suite */}
      <TechSuiteContainer />

      {/* 
      <div className="container flex flex-col md:flex-row gap-xl">
        {ctaData && (
          <>
            <div className="w-full sm:w-2/3 flex">
              <PrimaryCallToAction data={ctaData.primary} />
            </div>
            <div className="w-full sm:w-1/3 flex">
              <SecondaryCallToAction data={ctaData.secondary} />
            </div>
          </>
        )}
      </div> */}
    </div>
  );
}

export default HomePage;
