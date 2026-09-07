import MarkdownEditor from '../../../components/shared/MarkdownEditor'
import { m } from '../../../paraglide/messages'

interface PlanDescriptionFieldProps {
  value: string
  onChange: (v: string) => void
}

function PlanDescriptionField({ value, onChange }: PlanDescriptionFieldProps) {
  return (
    <div className="flex flex-col gap-xs">
        <label htmlFor="plan-description" className="text-sm font-medium text-hot-gray-700">
          {m.plan_form_description_label()}
        </label>
      <MarkdownEditor
        id="plan-description"
        value={value}
        onChange={onChange}
        placeholder={m.plan_form_description_markdown_hint()}
      />
    </div>
  )
}

export default PlanDescriptionField
