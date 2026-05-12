import { m } from "../../../paraglide/messages";

interface PlanNameFieldProps {
  value: string;
  onChange: (v: string) => void;
}

function PlanNameField({ value, onChange }: PlanNameFieldProps) {
  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor="plan-name" className="text-sm font-medium text-hot-gray-700">
        {m.plan_form_name_label()} <span className="text-hot-red-600">*</span>
      </label>
      <input
        id="plan-name"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        placeholder={m.plan_form_name_placeholder()}
        className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
      />
    </div>
  );
}

export default PlanNameField;
