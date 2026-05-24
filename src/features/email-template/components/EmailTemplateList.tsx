import { type EmailTemplate } from "../types/email-template.type";
import { getEmailTypeName } from "../utils/email-template.util";

interface Props {
  templates: EmailTemplate[];
  selectedTemplateId?: number;
  onSelect: (template: EmailTemplate) => void;
}

export default function EmailTemplateList({
  templates,
  selectedTemplateId,
  onSelect,
}: Props) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-gray-200 font-semibold text-gray-800 bg-gray-50/50">
        Templates List
      </div>

      <div className="divide-y divide-gray-100 max-h-[650px] overflow-y-auto">
        {templates.map((template) => {
          const isActive = selectedTemplateId === template.id;

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`w-full text-left px-5 py-4 transition-all relative ${isActive
                ? "bg-blue-50/60 hover:bg-blue-50"
                : "bg-white hover:bg-gray-50/80"
                }`}
            >
              {/* Đánh dấu vạch xanh dọc cho template đang chọn */}
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}

              <div className={`font-semibold text-sm ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                {getEmailTypeName(template.type)}
              </div>

              <div className="text-xs text-gray-400 font-mono mt-1 truncate">
                {template.content.replace(/<[^>]*>/g, '') /* Loại bỏ tag html để hiển thị text preview ngắn gọn */}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}