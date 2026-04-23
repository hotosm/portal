import GoToWesiteCTA from "../components/shared/GoToWesiteCTA";
import PageWrapper from "../components/shared/PageWrapper";
import YourProjectsTitle from "../components/shared/YourProjectsTitle";
import ImageryCard from "./components/FieldCard";
import { getFieldProjects } from "./fieldProjects";
import { useChatMapData } from "./hooks/useChatMapData";
<<<<<<< HEAD
=======
import { m } from "../paraglide/messages";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import chatIcon from "../assets/icons/chat.svg";
import fieldIcon from "../assets/icons/field.svg";
import { useFieldTMProjects } from "./hooks/useFieldTMProjects";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import FieldTMCard from "./components/FieldTMCard";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";
>>>>>>> develop

function FieldPage() {
  const projects = getFieldProjects();
  const { data: chatmap, isLoading: chatmapLoading } = useChatMapData();

  return (
    <PageWrapper>
      <div className="space-y-xl">
        <GoToWesiteCTA
          buttonLink="https://fmtm.hotosm.org/"
          buttonText="Field TM"
          link2={{
            label: "ChatMap",
            url: "https://www.hotosm.org/tech-suite/chatmap/",
          }}
        >
          <strong>Field</strong> Tasking Manager and <strong>ChatMap</strong>
        </GoToWesiteCTA>

        <div className="bg-hot-gray-50 p-md md:p-lg rounded-lg space-y-lg">
          <YourProjectsTitle projects={projects} />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-lg">
            {projects.map((project) => {
              return <ImageryCard project={project} />;
            })}
          </div>
        </div>

        {chatmapLoading && (
          <p className="text-hot-gray-500">Loading ChatMap data...</p>
        )}

<<<<<<< HEAD
        {chatmap && (
          <div className="bg-hot-gray-50 p-md md:p-lg rounded-lg space-y-lg">
            <h3>Your ChatMap</h3>
            <a
              href={chatmap.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block group no-underline hover:no-underline"
            >
              <div className="w-full bg-white rounded-lg p-md flex flex-col gap-sm shadow-sm transition-all duration-200 group-hover:shadow-lg group-hover:scale-[1.01]">
                <h4>{chatmap.title}</h4>
                <span className="text-hot-gray-500">
                  {chatmap.sharing === "public" ? "Public" : "Private"}
                </span>
              </div>
            </a>
=======
      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          <div className="flex flex-wrap gap-lg">
            {isFieldLoading ? (
              Array.from({ length: 1 }).map((_, i) => (
                <div key={i} className={CARD_CLASS}>
                  <CardSkeleton linesCount={3} />
                </div>
              ))
            ) : (
              <>
                {fieldMaps.map((project) => (
                  <div key={project.id} className={CARD_CLASS}>
                    <FieldTMCard project={project} />
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
>>>>>>> develop
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default FieldPage;
