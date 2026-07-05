"use client";

import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { DataTable } from "@/components/DataTable";
import { FileData, OCRData } from "@/types";
import { exportToExcel } from "@/lib/ExportExcel";
import { Button } from "@/components/ui/button";
import { Download, ScanFace, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [data, setData] = useState<FileData[]>([]);

  const handleDropFiles = (files: File[]) => {
    const newFiles: FileData[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file_name: file.name,
      status: "pending",
      file: file,
      full_name: "",
      birth_date: "",
      address: "",
      issue_date: "",
      issued_by: "",
    }));

    setData((prev) => [...prev, ...newFiles]);

    // Process them asynchronously
    newFiles.forEach((f) => processFile(f));
  };

  const processFile = async (fileData: FileData) => {
    if (!fileData.file) return;

    // Update status to processing
    setData((prev) =>
      prev.map((item) =>
        item.id === fileData.id ? { ...item, status: "processing" } : item
      )
    );

    try {
      const formData = new FormData();
      formData.append("image", fileData.file);

      // Call the internal Next.js API route
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Lỗi kết nối máy chủ OCR");
      }

      const result = await response.json();

      if (result.success && result.data) {
        const ocrData: OCRData = result.data;
        setData((prev) =>
          prev.map((item) =>
            item.id === fileData.id
              ? {
                  ...item,
                  status: "success",
                  ...ocrData,
                }
              : item
          )
        );
        toast.success(`Trích xuất thành công: ${fileData.file_name}`);
      } else {
        throw new Error("Không đọc được thông tin (OCR failed)");
      }
    } catch (error: any) {
      setData((prev) =>
        prev.map((item) =>
          item.id === fileData.id
            ? { ...item, status: "error", error_message: error.message }
            : item
        )
      );
      toast.error(`Lỗi: ${fileData.file_name} - ${error.message}`);
    }
  };

  const handleUpdateData = (id: string, field: keyof FileData, value: string) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleExport = () => {
    if (data.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }
    exportToExcel(data, "CCCD_Data.xlsx");
    toast.success("Đã xuất file Excel");
  };

  const handleClear = () => {
    setData([]);
  };

  const processedCount = data.filter((d) => d.status === "success").length;
  const errorCount = data.filter((d) => d.status === "error").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanFace className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">CCCD OCR System</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Tải lên ảnh CCCD</h2>
              <p className="text-sm text-muted-foreground">
                Hỗ trợ xử lý hàng loạt. Dữ liệu sẽ tự động được trích xuất.
              </p>
            </div>
            <UploadZone onDropFiles={handleDropFiles} />
          </section>

          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Kết quả trích xuất
                  <span className="text-xs font-normal bg-muted px-2 py-1 rounded-full">
                    Tổng: {data.length} | Thành công: {processedCount} | Lỗi: {errorCount}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Bạn có thể chỉnh sửa trực tiếp trên bảng.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleClear} disabled={data.length === 0}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa tất cả
                </Button>
                <Button size="sm" onClick={handleExport} disabled={data.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
            <DataTable data={data} onUpdateData={handleUpdateData} />
          </section>
        </div>
      </main>
    </div>
  );
}
