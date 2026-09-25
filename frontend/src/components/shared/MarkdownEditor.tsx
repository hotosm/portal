import { useState } from "react";
import { m } from "../../paraglide/messages";
import { RichTextContent } from "./RichTextContent";
import { Tab, TabGroup, TabPanel } from "./Tabs";
import Textarea from "./Textarea";

interface MarkdownEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Plain textarea with a markdown preview tab.
 *
 * The preview renders through `RichTextContent` (react-markdown), the same
 * component that renders the stored description on the read view, so what the
 * user sees here matches what gets published — and it inherits react-markdown's
 * safe-by-default HTML handling.
 */
function MarkdownEditor({
  id,
  value,
  onChange,
  placeholder = "Write something…",
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="markdown-editor">
      <TabGroup
        active={tab}
        onWaTabShow={(e) => setTab(e.detail.name as "write" | "preview")}
        className="wa-tabs-equal-height wa-tabs-compact"
      >
        <Tab panel="write">{m.plan_form_description_tab_write()}</Tab>
        <Tab panel="preview">{m.plan_form_description_tab_preview()}</Tab>

        <TabPanel name="write">
          <Textarea
            id={id}
            value={value}
            rows={14}
            placeholder={placeholder}
            onInput={(e) => onChange(e.currentTarget.value ?? "")}
          />
        </TabPanel>

        <TabPanel name="preview">
          <div className="h-[350px] overflow-scroll">
            <RichTextContent content={value} />
          </div>
        </TabPanel>
      </TabGroup>
    </div>
  );
}

export default MarkdownEditor;
