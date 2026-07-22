import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import PageWrapper from "../components/shared/PageWrapper";
import { useLanguage } from "../contexts/LanguageContext";

function ForbiddenPage() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center gap-md py-xl text-center">
        <p className="text-8xl font-bold text-hot-gray-200">403</p>
        <div className="flex flex-col gap-xs">
          <p className="text-2xl font-bold text-hot-gray-950">Access denied</p>
          <p className="text-hot-gray-600">
            You don't have permission to view this page.
          </p>
        </div>
        <Button onClick={() => navigate(`/${currentLanguage}`)}>
          Go to home
        </Button>
      </div>
    </PageWrapper>
  );
}

export default ForbiddenPage;
