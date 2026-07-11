"use client";

import { useState, useRef, useEffect } from "react";

export interface SelectOption {
    value: string;
    label: string;
    /** Small colored swatch shown left of the label (protocol dot, chain dot, etc.) */
    color?: string;
    /** Square (protocol badge) vs circle (chain dot). Defaults to circle. */
    swatchShape?: "square" | "circle";
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
        <div ref={ref} style={{ position: "relative" }}>
            {/* ── Trigger ── */}
            <button
                onClick={() => setOpen((o) => !o)}
                style={{
                    height: 40,
                    padding: "0 36px 0 12px",
                    borderRadius: 10,
                    border: `1px solid ${open ? "#3a4556" : "#232c3d"}`,
                    background: open ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.02)",
                    color: isDefault ? "#8B96A9" : "#EEF1F6",
                    fontSize: 13,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    whiteSpace: "nowrap",
                    transition: "border-color .12s, background .12s, color .12s",
                    outline: "none",
                    userSelect: "none",
                }}
            >
                <Swatch option={selected} size={8} />
                {selected?.label}
                <span
                    style={{
                        position: "absolute",
                        right: 11,
                        top: "50%",
                        transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
                        color: "#5C6577",
                        fontSize: 9,
                        transition: "transform .15s",
                        pointerEvents: "none",
                        lineHeight: 1,
                    }}
                >
                    ▾
                </span>
            </button>

            {/* ── Panel ── */}
            {open && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        minWidth: "100%",
                        zIndex: 200,
                        background: "#0d1420",
                        border: "1px solid #1d2635",
                        borderRadius: 12,
                        padding: 4,
                        boxShadow: "0 8px 32px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.3)",
                        animation: "cmFade .14s ease",
                    }}
                >
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
    if (!option?.color) return null;
    const isSquare = option.swatchShape === "square";
    return (
        <span
            style={{
                width: size,
                height: size,
                borderRadius: isSquare ? 2 : "50%",
                background: option.color,
                flex: "none",
                display: "inline-block",
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
    const [hovered, setHovered] = useState(false);

    let bg = "transparent";
    if (active) bg = "rgba(79,227,193,.10)";
    else if (hovered) bg = "rgba(255,255,255,.04)";

    return (
        <div
            onClick={onSelect}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#4FE3C1" : "#c7cdd8",
                background: bg,
                transition: "background .1s",
            }}
        >
            <Swatch option={opt} size={8} />
            <span style={{ flex: 1 }}>{opt.label}</span>
            {active && (
                <span style={{ fontSize: 10, color: "#4FE3C1", opacity: 0.8 }}>✓</span>
            )}
        </div>
    );
}
