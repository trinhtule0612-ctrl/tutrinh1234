export interface OCRData {
  full_name: string;
  birth_date: string;
  address: string;
  issue_date: string;
  issued_by: string;
}

export interface FileData extends OCRData {
  id: string;
  file_name: string;
  status: "pending" | "processing" | "success" | "error";
  error_message?: string;
  file?: File; // Keep reference to file if needed for retry, though we process immediately
}
