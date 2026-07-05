import * as XLSX from "xlsx";
import { FileData } from "@/types";

export function exportToExcel(data: FileData[], filename: string = "CCCD_Data.xlsx") {
  // Filter out pending and processing files, we only want to export successes
  const exportableData = data.filter(d => d.status === "success" || d.status === "error");

  const rows = exportableData.map((item, index) => ({
    "STT": index + 1,
    "Tên file": item.file_name,
    "Họ và tên": item.full_name,
    "Ngày sinh": item.birth_date,
    "Địa chỉ": item.address,
    "Ngày cấp": item.issue_date,
    "Cơ quan cấp": item.issued_by,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  
  // Save file
  XLSX.writeFile(workbook, filename);
}
