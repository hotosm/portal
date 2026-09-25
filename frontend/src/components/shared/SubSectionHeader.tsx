import * as m from "../../paraglide/messages";
import PageWrapper from "./PageWrapper";

interface SubSectionHeaderProps {
  icon?: string;
  title: string;
  toolName?: string;
}

function SubSectionHeader({ icon, title, toolName }: SubSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between border-t border-b border-gray-100">
      <PageWrapper>
        <div className="flex items-center gap-sm">
          {icon && <img src={icon} alt="" className="w-8 h-8" />}
          <div className="flex flex-col sm:contents">
            <span
              className="text-xl font-semibold leading-tight"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            {toolName && (
              <span
                className="text-sm italic sm:ml-auto"
                style={{ color: "var(--hot-color-neutral-400, #9ca3af)" }}
              >
                {m.by()}{" "}
                <strong>
                  <span dangerouslySetInnerHTML={{ __html: toolName }} />
                </strong>
              </span>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default SubSectionHeader;
