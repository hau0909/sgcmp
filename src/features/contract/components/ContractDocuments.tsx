"use client";

import React, { useState, useRef } from "react";
import { FolderOpen, FileText, Eye, Download, UploadCloud, X } from "lucide-react";

interface ContractDocumentsProps {
  contractFileUrl: string | null;
  contractCode: string;
  onUpload?: (file: File) => void;
  onDeleteFile?: () => void;
  isReadOnly?: boolean;
}

export function ContractDocuments({
  contractFileUrl,
  contractCode,
  onUpload,
  onDeleteFile,
  isReadOnly = false,
}: ContractDocumentsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Hệ thống chỉ chấp nhận tệp định dạng PDF!");
      return;
    }
    
    setIsUploading(true);
    // Simulate loading upload process
    setTimeout(() => {
      setIsUploading(false);
      if (onUpload) {
        onUpload(file);
      }
    }, 1200);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm mt-2">
      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <FolderOpen className="w-5 h-5 text-secondary" />
        <span>Tài liệu hợp đồng</span>
      </h3>

      {isUploading ? (
        <div className="flex flex-col items-center justify-center p-8 border border-outline-variant rounded-xl bg-surface-bright/40 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p className="text-sm font-semibold text-on-surface font-headline">
            Đang tải lên tệp hợp đồng...
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1 max-w-xs leading-normal">
            Hệ thống đang xử lý tài liệu đính kèm.
          </p>
        </div>
      ) : contractFileUrl ? (
        <div className="border border-outline-variant/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface-bright hover:bg-surface-container-low transition-colors duration-150 group relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-lg flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/40">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-background group-hover:text-primary transition-colors truncate">
                Hop_Dong_P2P_{contractCode}.pdf
              </p>
              <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                PDF Document &bull; Tài liệu đã tải lên
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
              download={`Hop_Dong_P2P_${contractCode}.pdf`}
              className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg border border-outline-variant/60 hover:border-primary transition-all flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải xuống</span>
            </a>
            {onDeleteFile && !isReadOnly && (
              <button
                onClick={onDeleteFile}
                className="p-1.5 text-error hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg border border-outline-variant/60 hover:border-red-300 transition-all cursor-pointer"
                title="Xóa tài liệu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : isReadOnly ? (
        <div className="flex flex-col items-center justify-center p-8 border border-outline-variant/60 rounded-xl text-center bg-surface-bright/40">
          <FileText className="w-10 h-10 mb-2 text-on-surface-variant/40" />
          <p className="text-sm font-semibold text-on-surface-variant font-headline">
            Không có tệp tài liệu hợp đồng đính kèm
          </p>
          <p className="text-xs text-on-surface-variant/60 mt-1">
            Không thể tải tài liệu khi hợp đồng đã có chữ ký của khách hàng.
          </p>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-200 group
            ${isDragging 
              ? "border-primary bg-primary/5 shadow-inner" 
              : "border-outline-variant hover:border-primary hover:bg-surface-bright/80"}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="application/pdf"
            className="hidden"
          />
          <UploadCloud className={`w-10 h-10 mb-3 transition-transform group-hover:-translate-y-0.5 duration-200
            ${isDragging ? "text-primary animate-bounce" : "text-on-surface-variant/60 group-hover:text-primary"}`} 
          />
          <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors font-headline">
            Kéo thả tệp hợp đồng PDF vào đây
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1 max-w-xs leading-normal font-body">
            Hoặc <span className="text-primary font-bold underline group-hover:text-primary/90">bấm để chọn tệp</span> từ thiết bị của bạn
          </p>
          <p className="text-[10px] text-on-surface-variant/60 mt-2 font-mono">
            Hỗ trợ định dạng PDF tối đa 10MB
          </p>
        </div>
      )}
    </div>
  );
}
