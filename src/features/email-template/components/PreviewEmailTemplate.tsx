// PreviewEmailTemplate.tsx
import { useMemo } from "react";
import { TEMPLATE_VARIABLES } from "../constants/template-variables";
import { EmailType } from "../types/email-template.type";

interface Props {
  content: string;
  type: EmailType;
}

export default function PreviewEmailTemplate({ content, type }: Props) {

  const parsedHtml = useMemo(() => {
    if (!content.trim()) {
      return `<div style="font-family: sans-serif; text-align: center; padding: 40px; color: #9ca3af;"><p>Không có dữ liệu hiển thị.</p></div>`;
    }

    // Xử lý chuỗi thô từ database (nếu bị dính ký tự \n dạng chuỗi văn bản)
    let mockHtml = content.replace(/\\n/g, "\n");

    // Lấy danh sách biến mẫu tương ứng với loại Email hiện tại
    const variables = TEMPLATE_VARIABLES[type] ?? [];

    // Tự động map dữ liệu mẫu tương ứng với từng thuộc tính xuất hiện trong database của bạn
    variables.forEach((v) => {
      let mockValue = `[${v.description}]`;
      const keyUpper = v.key.toUpperCase();

      // 1. Định nghĩa dữ liệu giả lập cho từng loại biến
      if (keyUpper.includes("NAME")) {
        mockValue = keyUpper.includes("STUDENT") ? "Nguyễn Văn Học Sinh" : "TS. Nguyễn Văn Giảng Viên";
      }
      else if (keyUpper.includes("DATE")) mockValue = "26/05/2026";
      else if (keyUpper.includes("TIME")) mockValue = keyUpper.includes("START") ? "07:30" : "11:30";
      else if (keyUpper.includes("ROOM")) mockValue = "Phòng Máy Tính Lab 501";
      else if (keyUpper.includes("SUBJECT")) mockValue = keyUpper.includes("CODE") ? "INT1432" : "Phát triển ứng dụng Web nâng cao";
      else if (keyUpper.includes("ID")) mockValue = "9482";
      else if (keyUpper.includes("PURPOSE")) mockValue = "Thực hành nghiên cứu AI và Hệ thống nhúng";
      else if (keyUpper.includes("REASON")) mockValue = "Phòng Lab bận đột xuất phục vụ hội thảo khoa học.";
      else if (keyUpper.includes("URL") || keyUpper.includes("LINK")) mockValue = "#"; // Trả về link thô

      const regex = new RegExp(`{{${v.key}}}`, "gi");

      // 2. KIỂM TRA QUAN TRỌNG: Nếu là biến chứa URL hoặc LINK thì KHÔNG bọc thẻ span style nữa
      if (keyUpper.includes("URL") || keyUpper.includes("LINK")) {
        // Chỉ thay thế bằng chuỗi ký tự sạch để href="#" chạy đúng cú pháp
        mockHtml = mockHtml.replace(regex, mockValue);
      } else {
        // Các biến văn bản thông thường thì vẫn bọc thẻ span highlight màu vàng để dễ nhận biết
        mockHtml = mockHtml.replace(
          regex,
          `<span style="background-color: #fef08a; color: #854d0e; padding: 1px 5px; border-radius: 4px; font-weight: 600; font-size: 0.95em; border: 1px dashed #ca8a04;">${mockValue}</span>`
        );
      }
    });

    // Trả về luồng tài liệu chuẩn để Iframe thông dịch UI
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 16px; background-color: #f3f4f6; }
            /* Khắc phục lỗi hiển thị do khoảng trắng thừa khi lưu trữ database */
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${mockHtml}
        </body>
      </html>
    `;
  }, [content, type]);

  return (
    <div className="space-y-4">
      {/* Khung viền giả lập Mockup ứng dụng Mail */}
      <div className="bg-gray-50 border border-gray-200 rounded-t-xl px-4 py-3 space-y-1 shadow-sm">
        <div className="flex items-center space-x-2 pb-1.5 border-b border-gray-200/60">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block"></span>
          <span className="text-xs font-semibold text-gray-400 ml-2">BookLAB Mail Simulator</span>
        </div>
        <div className="text-xs text-gray-500">
          <span className="text-gray-400 font-medium">Người gửi:</span> <span className="text-gray-700">no-reply@booklab.edu.vn</span>
        </div>
      </div>

      {/* Vùng chứa Iframe hiển thị chính xác layout HTML có CSS inline từ Database */}
      <div className="border border-t-0 border-gray-200 rounded-b-xl bg-white overflow-hidden">
        <iframe
          srcDoc={parsedHtml}
          title="Email Live Preview"
          className="w-full min-h-[580px] block border-0 bg-white"
          sandbox="allow-popups"
        />
      </div>
    </div>
  );
}