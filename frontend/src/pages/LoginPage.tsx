import { useSearchParams } from "react-router-dom";
import { useEffect, useRef } from "react";

function LoginPage() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("return_to") || "/";
  const osmRequired = searchParams.get("osm_required") === "true";
  const authRef = useRef<HTMLElement>(null);
  const hankoUrl = import.meta.env.VITE_HANKO_URL || 'http://127.0.0.1:5173';

  useEffect(() => {
    // Set attributes after mount
    if (authRef.current) {
      console.log("LoginPage: Setting attributes", { returnTo, osmRequired });
      authRef.current.setAttribute("redirect-after-login", returnTo);
      if (osmRequired) {
        authRef.current.setAttribute("osm-required", "true");
      }
      console.log(
        "LoginPage: Attributes set",
        authRef.current.getAttribute("redirect-after-login"),
        authRef.current.getAttribute("osm-required")
      );
    }
  }, [returnTo, osmRequired]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Login
        </h1>
        <hotosm-auth ref={authRef as any} hanko-url={hankoUrl} show-profile />
      </div>
    </div>
  );
}

export default LoginPage;
