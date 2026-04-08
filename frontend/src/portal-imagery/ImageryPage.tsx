import CardAddNew from "../components/shared/CardAddNew";
import CardDataNotAvailable from "../components/shared/CardDataNotAvailable";
import CardTakeCourse from "../components/shared/CardTakeCourse";
import Divider from "../components/shared/Divider";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import ImageryCard from "./components/ImageryCard";
import { useDroneProjects } from "./hooks";

const CARD_CLASS =
  "w-full md:w-[calc(33.333%_-_var(--hot-spacing-large)*0.667)] lg:w-[calc(25%_-_var(--hot-spacing-large)*0.75)] shrink-0";

function ImageryPage() {
  const { data: droneProjects = [], isLoading } = useDroneProjects();

  if (isLoading) {
    return <p className="flex justify-center items-center pt-10">Loading...</p>;
  }

  return (
    <>
      <SectionHeader>
        <strong>Drone Tasking Manager</strong> and <strong>OpenAerialMap</strong>
      </SectionHeader>
      <PageWrapper>
        {/* Drone image capturing section */}
        <div className="flex flex-col gap-sm py-lg">
          <div>
            <p className="font-semibold text-xl">
              <strong>Drone image</strong> capturing
            </p>
            <p className="text-base">
              Powered by <strong>Drone Tasking Manager</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-lg">
            <div className={CARD_CLASS}>
              <CardAddNew
                title="Create"
                description="a drone capture plan"
                buttonLabel="Create new plan"
              />
            </div>
            {droneProjects.map((project) => (
              <div key={project.id} className={CARD_CLASS}>
                <ImageryCard project={project} />
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Image publishing section */}
        <div className="flex flex-col gap-sm py-lg">
          <div>
            <p className="font-semibold text-xl">
              <strong>Image</strong> publishing
            </p>
            <p className="text-base">
              Powered by <strong>OpenAerialMap</strong>
            </p>
          </div>
          <div className="flex flex-wrap gap-lg">
            <div className={CARD_CLASS}>
              <CardAddNew
                title="Upload"
                description="new imagery"
                buttonLabel="Upload imagery"
              />
            </div>
            <div className={CARD_CLASS}>
              <CardDataNotAvailable />
            </div>
            <div className={CARD_CLASS}>
              <CardTakeCourse
                title="Take the course"
                subtitle="& get your certification"
                href="#"
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

export default ImageryPage;
