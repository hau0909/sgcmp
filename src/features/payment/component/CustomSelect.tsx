"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function CustomSelect({
    value,
    options,
    onChange,
    placeholder = "Select...",
    className = "",
}: CustomSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((o) => o.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const getStatusDot = (val: string) => {
        switch (val) {
            case "completed":
                return <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />;
            case "pending":
                return <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />;
            case "failed":
                return <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />;
            default:
                return <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />;
        }
    };

    return (
        <div ref={containerRef} className={`relative ${open ? "z-30" : ""} ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`flex h-11 w-full items-center justify-between gap-2 rounded-lg border px-3.5 text-sm transition-all cursor-pointer select-none
                    ${open
                        ? "border-blue-500 bg-white ring-2 ring-blue-100 shadow-sm"
                        : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white"
                    }
                `}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    {getStatusDot(value)}
                    <span className="truncate font-medium text-slate-900">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-180 text-blue-600" : ""
                        }`}
                />
            </button>

            {/* Dropdown Menu Popover */}
            {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 min-w-[200px] rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="space-y-0.5 max-h-60 overflow-y-auto">
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none
                                        ${isSelected
                                            ? "bg-blue-50 text-blue-700 font-semibold"
                                            : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-2.5 truncate">
                                        {getStatusDot(option.value)}
                                        <span className="truncate">{option.label}</span>
                                    </div>
                                    {isSelected && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
