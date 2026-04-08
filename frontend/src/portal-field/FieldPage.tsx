import CardAddNew from "../components/shared/CardAddNew";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import Divider from "../components/shared/Divider";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import ChatMapCard from "./components/ChatMapCard";
import FieldTMCard from "./components/FieldTMCard";
import { useChatMapData } from "./hooks/useChatMapData";
import { useFieldTMProjects } from "./hooks/useFieldTMProjects";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

function FieldPage() {
  const { data: fieldProjects = [], isLoading: fieldLoading } = useFieldTMProjects();
  const { data: chatMaps = [], isLoading: chatmapLoading } = useChatMapData();

  if (fieldLoading || chatmapLoading) {
    return <p className="flex justify-center items-center pt-10">Loading...</p>;
  }

  return (
    <>
      <SectionHeader>
        <strong>Local knowledge</strong> from the field
      </SectionHeader>
      <PageWrapper>
        <div className="space-y-xl">

          {/* Organize field projects */}
          <div className="flex flex-col gap-sm py-lg">
            <div>
              <p className="font-semibold text-xl">
                <strong>Organize</strong> field projects
              </p>
              <p className="text-base">
                Powered by <strong>Field Tasking Manager</strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-lg">
              <div className={CARD_CLASS}>
                <CardAddNew
                  title="Create"
                  description="a field mapping project"
                  buttonLabel="Create a project"
                />
              </div>
              {fieldProjects.map((project) => (
                <div key={project.id} className={CARD_CLASS}>
                  <FieldTMCard project={project} />
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* Map with social apps */}
          <div className="flex flex-col gap-sm py-lg">
            <div>
              <p className="font-semibold text-xl">
                <strong>Map</strong> with social apps
              </p>
              <p className="text-base">
                Powered by <strong>ChatMap</strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-lg">
              <div className={CARD_CLASS}>
                <CardAddNew
                  title="Map"
                  description="with chats"
                  buttonLabel="Create a map"
                />
              </div>
              {chatMaps.map((map) => (
                <div key={map.id} className={CARD_CLASS}>
                  <ChatMapCard project={map} />
                </div>
              ))}
              <div className={CARD_CLASS}>
                <CardTakeCourse
                  title="Take the course"
                  subtitle="& get your certification"
                  href="#"
                />
              </div>
            </div>
          </div>

        </div>
      </PageWrapper>
    </>
  );
}

export default FieldPage;
