"use client";

import React, { useRef, useState, useEffect } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";

interface UploadZoneProps {
  label: string;
  placeholder?: string;
  accept?: string;
  defaultValue?: string | File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export default function UploadZone({
  label,
  placeholder = "Kéo thả file vào đây hoặc nhấp để chọn",
  accept = "image/*",
  defaultValue,
  onChange,
  className = "",
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (defaultValue) {
      if (defaultValue instanceof File) {
        setSelectedFile(defaultValue);
        if (defaultValue.type.startsWith("image/")) {
          setPreviewUrl(URL.createObjectURL(defaultValue));
        }
      } else if (typeof defaultValue === "string") {
        setPreviewUrl(defaultValue);
      }
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [defaultValue]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    onChange(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isPdf = selectedFile?.type === "application/pdf" || 
    (typeof defaultValue === "string" && defaultValue.toLowerCase().endsWith(".pdf"));

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-on-surface">
        {label}
      </label>
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`relative flex flex-col items-center justify-center min-h-[160px] rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200
          ${
            dragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : previewUrl || selectedFile
              ? "border-outline-variant bg-surface-container-low"
              : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-lowest"
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-2">
            {isPdf ? (
              <div className="flex flex-col items-center gap-2 p-2">
                <FileText className="w-12 h-12 text-primary" />
                <span className="text-sm font-medium text-on-surface truncate max-w-[250px]">
                  {selectedFile ? selectedFile.name : "Giấy phép đăng ký kinh doanh.pdf"}
                </span>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="File preview"
                className="max-h-[140px] rounded-lg object-contain"
              />
            )}
            
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-md hover:bg-error/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : selectedFile ? (
          <div className="relative w-full flex flex-col items-center justify-center gap-2">
            <FileText className="w-12 h-12 text-primary" />
            <span className="text-sm font-medium text-on-surface truncate max-w-[250px]">
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-md hover:bg-error/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-on-surface">
                {placeholder}
              </p>
              <p className="text-xs text-on-surface-variant">
                Hỗ trợ định dạng {accept.replace("/*", "").toUpperCase()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
