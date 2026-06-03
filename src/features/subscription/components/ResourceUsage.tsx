import React from "react";
import { Database } from "lucide-react";

export default function ResourceUsage() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-outline transition-all">
      <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-5 flex items-center gap-2">
        <Database className="w-4 h-4 text-secondary" />
        Mức độ sử dụng tài nguyên
      </h3>
      <div className="space-y-6">
        {/* Progress 1 */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-on-surface">
              Số lượng nhân viên đăng ký
            </span>
            <span className="text-xs font-mono text-on-surface-variant font-bold">
              <strong className="text-on-surface">85</strong> / 100
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant/10">
            <div className="h-full bg-secondary rounded-full" style={{ width: "85%" }} />
          </div>
          <p className="text-[10px] text-on-surface-variant/80 mt-1.5 text-right font-medium">
            Đã sử dụng 85%
          </p>
        </div>
        
        {/* Progress 2 */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-on-surface">
              Số lượng chi nhánh quản lý
            </span>
            <span className="text-xs font-mono text-on-surface-variant font-bold">
              <strong className="text-on-surface">12</strong> / 20
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden border border-outline-variant/10">
            <div className="h-full bg-primary rounded-full" style={{ width: "60%" }} />
          </div>
          <p className="text-[10px] text-on-surface-variant/80 mt-1.5 text-right font-medium">
            Đã sử dụng 60%
          </p>
        </div>
      </div>
    </div>
  );
}
