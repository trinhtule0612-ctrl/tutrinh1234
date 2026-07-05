"use client";

import { useState } from "react";
import { FileData } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface DataTableProps {
  data: FileData[];
  onUpdateData: (id: string, field: keyof FileData, value: string) => void;
}

export function DataTable({ data, onUpdateData }: DataTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20 text-muted-foreground">
        No data yet. Upload some images to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">STT</TableHead>
            <TableHead className="w-[200px]">Tên file</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Họ và tên</TableHead>
            <TableHead>Ngày sinh</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Ngày cấp</TableHead>
            <TableHead>Cơ quan cấp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="truncate max-w-[200px]" title={item.file_name}>
                {item.file_name}
              </TableCell>
              <TableCell>
                {item.status === "processing" && (
                  <Badge variant="outline" className="text-yellow-500 border-yellow-500 bg-yellow-500/10 gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang xử lý
                  </Badge>
                )}
                {item.status === "success" && (
                  <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10 gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Thành công
                  </Badge>
                )}
                {item.status === "error" && (
                  <Badge variant="outline" className="text-red-500 border-red-500 bg-red-500/10 gap-1" title={item.error_message}>
                    <AlertCircle className="w-3 h-3" /> Lỗi
                  </Badge>
                )}
                {item.status === "pending" && (
                  <Badge variant="outline" className="text-gray-500">
                    Chờ xử lý
                  </Badge>
                )}
              </TableCell>
              
              {item.status === "processing" ? (
                <>
                  <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                </>
              ) : (
                <>
                  <TableCell>
                    <Input
                      value={item.full_name}
                      onChange={(e) => onUpdateData(item.id, "full_name", e.target.value)}
                      className="h-8 w-full min-w-[120px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.birth_date}
                      onChange={(e) => onUpdateData(item.id, "birth_date", e.target.value)}
                      className="h-8 w-[100px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.address}
                      onChange={(e) => onUpdateData(item.id, "address", e.target.value)}
                      className="h-8 w-full min-w-[200px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.issue_date}
                      onChange={(e) => onUpdateData(item.id, "issue_date", e.target.value)}
                      className="h-8 w-[100px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.issued_by}
                      onChange={(e) => onUpdateData(item.id, "issued_by", e.target.value)}
                      className="h-8 w-full min-w-[150px]"
                    />
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
