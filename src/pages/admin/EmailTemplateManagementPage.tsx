// EmailTemplateManagementPage.tsx
import { useState, useEffect } from "react";
import PreviewEmailTemplate from "../../features/email-template/components/PreviewEmailTemplate";
import TemplateVariablesPanel from "../../features/email-template/components/TemplateVariablesPanel";
import EmailTemplateEditor from "../../features/email-template/components/EmailTemplateEditor";
import EmailTemplateList from "../../features/email-template/components/EmailTemplateList";
import { useEmailTemplates } from "../../features/email-template/hooks/useEmailTemplates";
import type { EmailTemplate } from "../../features/email-template/types/email-template.type";

export default function EmailTemplateManagementPage() {
  const { data, isLoading } = useEmailTemplates();
  const templates: EmailTemplate[] = data ?? [];

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>();

  // Lưu trữ nội dung đang chỉnh sửa để Preview có thể cập nhật Real-time trước khi bấm Save
  const [currentContent, setCurrentContent] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Tự động map dữ liệu khi chọn template mới
  useEffect(() => {
    if (selectedTemplate) {
      const selectedContent = templates.find(t => t.id === selectedTemplate.id)?.content || "";
      setCurrentContent(selectedContent);
    } else if (templates.length > 0) {
      setSelectedTemplate(templates[0]);
    }
  }, [selectedTemplate, templates]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500 font-medium">
        <div className="animate-pulse">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900">
      {/* Header gọn gàng, hiện đại hơn */}
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize and preview system-automated email notifications.
        </p>
      </header>

      {/* Bố cục 2 cột chính: Trái chọn danh sách - Phải là Không gian xử lý */}
      <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6">

        {/* Cột trái: Chiếm 3/12 không gian */}
        <div className="col-span-12 lg:col-span-3">
          <EmailTemplateList
            templates={templates}
            selectedTemplateId={selectedTemplate?.id}
            onSelect={setSelectedTemplate}
          />
        </div>

        {/* Cột phải: Chiếm 9/12 không gian bớt ngột ngạt */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {selectedTemplate ? (
            <div className="grid grid-cols-12 gap-6">

              {/* Khu vực chính (Editor & Preview dạng Tab) */}
              <div className="col-span-12 xl:col-span-8 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 bg-gray-50/70">
                  <div className="flex space-x-1 mt-2">
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === "edit"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Code Editor
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === "preview"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {activeTab === "edit" ? (
                    <EmailTemplateEditor
                      template={selectedTemplate}
                      content={currentContent}
                      onChange={setCurrentContent}
                    />
                  ) : (
                    <PreviewEmailTemplate
                      content={currentContent}
                      type={selectedTemplate.type}
                    />
                  )}
                </div>
              </div>

              {/* Khu vực phụ bên cạnh (Danh sách biến) */}
              <div className="col-span-12 xl:col-span-4">
                <TemplateVariablesPanel type={selectedTemplate.type} />
              </div>

            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
              Select a template from the list to start editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}