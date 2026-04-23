import { useNavigate } from "react-router-dom";
import Button from "../components/shared/Button";
import PageWrapper from "../components/shared/PageWrapper";
import { useLanguage } from "../contexts/LanguageContext";

function NotFoundPage() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center gap-md py-xl text-center">
        <p className="text-8xl font-bold text-hot-gray-200">404</p>
        <div className="flex flex-col gap-xs">
          <p className="text-2xl font-bold text-hot-gray-950">Page not found</p>
          <p className="text-hot-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button onClick={() => navigate(`/${currentLanguage}`)}>
          Go to home
        </Button>
      </div>
    </PageWrapper>
  );
}

export default NotFoundPage;
