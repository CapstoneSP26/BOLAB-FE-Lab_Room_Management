// EmailTemplateEditor.tsx
import { type EmailTemplate } from "../types/email-template.type";
import { useUpdateEmailTemplate } from "../hooks/useUpdateEmailTemplate";

interface Props {
  template: EmailTemplate;
  content: string;
  onChange: (value: string) => void;
}

export default function EmailTemplateEditor({ template, content, onChange }: Props) {
  console.log("content in editor", content);
  const updateMutation = useUpdateEmailTemplate();

  const handleSave = () => {
    updateMutation.mutate({
      id: template.id,
      payload: { content },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Type ID: {template.type}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            Sử dụng cú pháp HTML chuẩn kết hợp với các biến biến ở cột phải.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="⚡ Viết code mã HTML của bạn tại đây..."
        className="w-full min-h-[500px] border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-mono text-sm leading-relaxed bg-gray-900 text-gray-100 shadow-inner"
      />
    </div>
  );
}