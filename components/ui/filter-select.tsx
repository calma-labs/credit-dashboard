"use client";

import { useState, useRef, useEffect } from "react";

export interface SelectOption {
    value: string;
    label: string;
    color?: string;
    swatchShape?: "square" | "circle";
    icon?: string;
    iconUrls?: string[];
}

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
}

export function FilterSelect({ value, onChange, options }: FilterSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onMouse = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onMouse);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onMouse);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const selected = options.find((o) => o.value === value) ?? options[0];
    const isDefault = value === options[0]?.value;

    return (
        <div ref={ref} className="relative">
            {/* ── Trigger ── */}
            <button
                onClick={() => setOpen((o) => !o)}
                className={`h-10 px-3 pr-9 rounded-[10px] border text-[13px] inline-flex items-center gap-2 whitespace-nowrap transition-colors outline-none select-none cursor-pointer ${
                    open
                        ? "border-[#3a4556] bg-white/5 text-[#EEF1F6]"
                        : "border-[#232c3d] bg-white/[0.02]"
                } ${isDefault ? "text-[#8B96A9]" : "text-[#EEF1F6]"}`}
            >
                <Swatch option={selected} size={8} />
                {selected?.label}
                <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6577] text-[9px] pointer-events-none transition-transform duration-150 leading-none ${
                        open ? "rotate-180" : ""
                    }`}
                >
                    ▾
                </span>
            </button>

            {open && (
                <div className="absolute top-[calc(100%+6px)] left-0 min-w-full z-[200] bg-[#0d1420] border border-[#1d2635] rounded-xl p-1 shadow-[0_8px_32px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.3)] animate-[cmFade_0.14s_ease]">
                    {options.map((opt) => {
                        const active = opt.value === value;
                        return (
                            <OptionRow
                                key={opt.value}
                                opt={opt}
                                active={active}
                                onSelect={() => { onChange(opt.value); setOpen(false); }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function Swatch({ option, size }: { option: SelectOption | undefined; size: number }) {
    const urls = option?.iconUrls ?? (option?.icon ? [option.icon] : []);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
    }, [option?.value]);

    if (urls.length > 0 && index < urls.length) {
        const isSquare = option?.swatchShape === "square";
        return (
            <img
                key={urls[index]}
                src={urls[index]}
                alt=""
                loading="eager"
                fetchPriority={isSquare ? "high" : "auto"}
                decoding="async"
                className={`shrink-0 object-contain ${isSquare ? "rounded-[3px]" : "rounded-full"}`}
                style={{
                    width: size + 6,
                    height: size + 6,
                }}
                onError={() => setIndex((i) => i + 1)}
            />
        );
    }
    if (urls.length > 0 || !option?.color) return null;
    const isSquare = option.swatchShape === "square";
    return (
        <span
            className={`shrink-0 inline-block ${isSquare ? "rounded-[2px]" : "rounded-full"}`}
            style={{
                width: size,
                height: size,
                backgroundColor: option.color,
            }}
        />
    );
}

function OptionRow({
    opt,
    active,
    onSelect,
}: {
    opt: SelectOption;
    active: boolean;
    onSelect: () => void;
}) {
    return (
        <div
            onClick={onSelect}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer text-[13px] transition-colors hover:bg-white/[0.04] ${
                active
                    ? "bg-[#4FE3C1]/10 font-semibold text-[#4FE3C1]"
                    : "text-[#c7cdd8] font-normal"
            }`}
        >
            <Swatch option={opt} size={8} />
            <span className="flex-1">{opt.label}</span>
            {active && (
                <span className="text-[10px] text-[#4FE3C1] opacity-80">✓</span>
            )}
        </div>
    );
}
