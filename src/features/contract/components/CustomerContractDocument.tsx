"use client";

import React from "react";
import { FolderOpen, FileText, Eye, Download } from "lucide-react";

interface CustomerContractDocumentProps {
  contractFileUrl: string | null;
  contractCode: string;
}

export function CustomerContractDocument({
  contractFileUrl,
  contractCode,
}: CustomerContractDocumentProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <FolderOpen className="w-5 h-5 text-secondary" />
        <span>Tài liệu hợp đồng</span>
      </h3>

      {contractFileUrl ? (
        <div className="border border-outline-variant/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-bright hover:bg-surface-container-low transition-colors duration-150 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0 border border-red-100">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-background group-hover:text-primary transition-colors truncate">
                Hop_Dong_{contractCode}.pdf
              </p>
              <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                PDF Document · Tài liệu hợp đồng chính thức
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <a
              href={contractFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-secondary/5 rounded-lg border border-outline-variant/60 hover:border-secondary transition-all flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trực tuyến</span>
            </a>
            <a
              href={contractFileUrl}
              download={`Hop_Dong_${contractCode}.pdf`}
              className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg border border-outline-variant/60 hover:border-primary transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải xuống</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 border border-dashed border-outline-variant/60 rounded-xl bg-surface-bright/40 text-center">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-on-surface-variant/40" />
          </div>
          <p className="text-sm font-semibold text-on-surface-variant font-headline">
            Chưa có tài liệu hợp đồng
          </p>
          <p className="text-xs text-on-surface-variant/60 mt-1 max-w-xs">
            Tệp PDF sẽ xuất hiện tại đây khi công ty hoàn tất chuẩn bị
          </p>
        </div>
      )}
    </div>
  );
}
