import RichTextEditor from "../../../components/shared/RichTextEditor";
import { m } from "../../../paraglide/messages";

interface PlanDescriptionFieldProps {
  value: string;
  onChange: (v: string) => void;
}

function PlanDescriptionField({ value, onChange }: PlanDescriptionFieldProps) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="flex flex-col">
        <label htmlFor="plan-description" className="text-sm font-medium text-hot-gray-700">
          {m.plan_form_description_label()}
        </label>
        <span className="text-xs text-hot-gray-500">
          {m.plan_form_description_markdown_hint()}
        </span>
      </span>
      <RichTextEditor
        id="plan-description"
        value={value}
        onChange={onChange}
        placeholder={m.plan_form_description_placeholder()}
      />
    </div>
  );
}

export default PlanDescriptionField;
