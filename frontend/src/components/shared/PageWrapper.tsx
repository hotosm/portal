import { ReactNode } from "react";

function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="container mt-xl mb-xl">{children}</div>;
}

export default PageWrapper;
