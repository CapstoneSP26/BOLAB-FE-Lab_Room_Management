import { TEMPLATE_VARIABLES } from "../constants/template-variables";
import { EmailType } from "../types/email-template.type";

interface Props {
  type: EmailType;
}

export default function TemplateVariablesPanel({ type }: Props) {
  const variables = TEMPLATE_VARIABLES[type] ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h2 className="font-semibold text-gray-800 text-sm tracking-wide uppercase mb-4">
        Available Variables
      </h2>

      <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
        {variables.length === 0 ? (
          <div className="text-sm text-gray-400 italic">No variables config for this type.</div>
        ) : (
          variables.map((item) => (
            <div
              key={item.key}
              className="group border border-gray-100 rounded-lg p-3 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all"
            >
              <div className="font-mono text-xs text-blue-600 font-semibold select-all cursor-pointer">
                {`{{${item.key}}}`}
              </div>
              <div className="text-xs text-gray-500 mt-1 leading-normal">
                {item.description}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}