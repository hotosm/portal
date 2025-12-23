import { ReactNode } from "react";

function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="container mt-lg mb-lg">{children}</div>;
}

export default PageWrapper;
