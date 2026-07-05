"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UploadZoneProps {
  onDropFiles: (files: File[]) => void;
}

export function UploadZone({ onDropFiles }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onDropFiles(acceptedFiles);
  }, [onDropFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
  });

  return (
    <Card
      {...getRootProps()}
      className={`border-2 border-dashed cursor-pointer transition-colors duration-200 ease-in-out ${
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
      }`}
    >
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <input {...getInputProps()} />
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <UploadCloud className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Kéo thả ảnh CCCD vào đây</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Hỗ trợ tải lên một hoặc nhiều ảnh cùng lúc. Định dạng: JPG, PNG, WEBP.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <ImageIcon className="w-3 h-3" />
          <span>Tự động nhận diện & trích xuất dữ liệu</span>
        </div>
      </CardContent>
    </Card>
  );
}
