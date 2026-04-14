import Divider from "../components/shared/Divider";
import PageWrapper from "../components/shared/PageWrapper";
import SectionHeader from "../components/shared/SectionHeader";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";

interface ISectionBannerProps {
  sectionTitle: string;
  sectionDescription: string;
  sectionPath: string;
}

function SectionBanner({
  sectionTitle,
  sectionDescription,
  sectionPath,
}: ISectionBannerProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between items-center">
      <a href={sectionPath} className="text-lg font-bold">
        {sectionTitle} {">"}
      </a>
      <p
        className="text-hot-gray-600 italic"
        dangerouslySetInnerHTML={{ __html: sectionDescription }}
      />
    </div>
  );
}
function WelcomePage() {
  const { currentLanguage } = useLanguage();

  const sections = {
    imagery: {
      title: m.section_imagery(),
      description: m.section_imagery_by(),
      path: `/${currentLanguage}/imagery`,
    },
    mapping: {
      title: m.section_mapping(),
      description: m.section_mapping_by(),
      path: `/${currentLanguage}/mapping`,
    },
    field: {
      title: m.section_field(),
      description: m.section_field_by(),
      path: `/${currentLanguage}/field`,
    },
    data: {
      title: m.section_data(),
      description: m.section_data_by(),
      path: `/${currentLanguage}/data`,
    },
  };

  return (
    <>
      <SectionHeader>
        <strong>{m.welcome()}</strong>
      </SectionHeader>
      <PageWrapper>
        <div className="flex flex-col gap-sm py-lg">
          <div>
            <h3>{m.welcome_intro_title()}</h3>
            <p dangerouslySetInnerHTML={{ __html: m.welcome_intro_p() }} />
          </div>
        </div>

        {Object.entries(sections).map(([key, section]) => (
          <div key={key}>
            <Divider />
            <SectionBanner
              sectionTitle={section.title}
              sectionDescription={section.description}
              sectionPath={section.path}
            />
          </div>
        ))}
      </PageWrapper>
    </>
  );
}

export default WelcomePage;
