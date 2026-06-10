"use client";

import React from "react";
import { FolderOpen, FileText, Eye, Download } from "lucide-react";

interface ContractDocument {
  name: string;
  size: string;
  uploadedTime: string;
}

interface ContractDocumentsProps {
  documents: ContractDocument[];
}

export function ContractDocuments({ documents }: ContractDocumentsProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm mt-2">
      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <FolderOpen className="w-5 h-5 text-secondary" />
        <span>Tài liệu hợp đồng</span>
      </h3>

      <div className="space-y-3">
        {documents.map((doc, idx) => (
          <div
            key={idx}
            className="border border-outline-variant/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-bright hover:bg-surface-container-low transition-colors duration-150 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-lg flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/40">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-background group-hover:text-primary transition-colors truncate">
                  {doc.name}
                </p>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                  {doc.size} &bull; {doc.uploadedTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button className="px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-secondary/5 rounded-lg border border-outline-variant/60 hover:border-secondary transition-all flex items-center gap-1 cursor-pointer">
                <Eye className="w-3.5 h-3.5" />
                <span>Xem trực tuyến</span>
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg border border-outline-variant/60 hover:border-primary transition-all flex items-center gap-1 cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                <span>Tải xuống</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
