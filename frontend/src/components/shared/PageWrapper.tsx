import { ReactNode } from "react";

function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="container space-y-xl">{children}</div>;
}

export default PageWrapper;
