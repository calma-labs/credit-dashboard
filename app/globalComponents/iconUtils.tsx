'use client';

import React, { useEffect, useState } from 'react';
import {
    STATIC_ICON_MAP,
    getCategoryFallbackUrls,
} from '@/app/icons/iconConstants';

const CHAIN_SLUG_MAP: Record<string, string> = {
    solana: 'solana.svg',
    ethereum: 'eth.svg',
    base: 'base.png',
};

const PROTOCOL_PRIMARY_URLS: Record<string, string> = {
    morpho: 'https://icons.llama.fi/morpho.png',
    jupiter: 'https://icons.llama.fi/jupiter.jpg',
    save: 'https://icons.llama.fi/save.jpg',
    solend: 'https://icons.llama.fi/save.jpg',
    kamino: 'https://icons.llama.fi/kamino-lend.jpg',
    marginfi: 'https://icons.llama.fi/marginfi.jpg',
    aave: 'https://icons.llama.fi/aave.jpg',
};

const protocolCache = new Map<string, Promise<string | null>>();
const ASSET_CACHE_TTL = 1000 * 60 * 30;
const assetCache = new Map<
    string,
    { promise: Promise<string | null>; expires: number }
>();

function fetchProtocolLogo(name: string): Promise<string | null> {
    const key = name.toLowerCase();
    const primary = PROTOCOL_PRIMARY_URLS[key];
    if (primary) {
        return Promise.resolve(primary);
    }
    let promise = protocolCache.get(key);
    if (!promise) {
        promise = fetch(`/api/icons/protocol?name=${encodeURIComponent(key)}`)
            .then((res) => (res.ok ? res.json() : { logo: null }))
            .then((data) => data.logo as string | null)
            .catch(() => null);
        protocolCache.set(key, promise);
    }
    return promise;
}

function fetchAssetImage(symbol: string): Promise<string | null> {
    const key = symbol.toLowerCase();
    const staticIcon = STATIC_ICON_MAP[key];
    if (staticIcon) return Promise.resolve(staticIcon);

    const cached = assetCache.get(key);
    if (cached && cached.expires > Date.now()) return cached.promise;

    const promise = fetch(`/api/icons/asset?symbol=${encodeURIComponent(key)}`)
        .then((res) => (res.ok ? res.json() : { image: null }))
        .then((data) => data.image as string | null)
        .catch(() => null);

    assetCache.set(key, { promise, expires: Date.now() + ASSET_CACHE_TTL });
    return promise;
}

export function getChainIconUrl(chain: string): string | null {
    const filename = CHAIN_SLUG_MAP[chain.toLowerCase()];
    return filename ? `/chains/${filename}` : null;
}

export function getProtocolIconUrl(protocol: string): string {
    const key = protocol.toLowerCase();
    return (
        PROTOCOL_PRIMARY_URLS[key] ??
        `https://icons.llama.fi/${encodeURIComponent(key)}.jpg`
    );
}

export function getProtocolIconUrls(protocol: string): string[] {
    const key = protocol.toLowerCase();
    const primary = PROTOCOL_PRIMARY_URLS[key];
    const urls: string[] = [];
    if (primary) urls.push(primary);
    urls.push(`https://icons.llama.fi/${encodeURIComponent(key)}.jpg`);
    urls.push(`https://icons.llama.fi/${encodeURIComponent(key)}.png`);
    return Array.from(new Set(urls));
}

function LetterFallback({
    label,
    size,
    rounded = 'rounded-full',
    className = '',
}: {
    label: string;
    size: number;
    rounded?: string;
    className?: string;
}) {
    return (
        <span
            className={`shrink-0 inline-flex items-center justify-center ${rounded} bg-[#1e2836] font-bold text-[#c7cdd8] shadow-sm ${className}`}
            style={{
                width: size,
                height: size,
                fontSize: Math.max(9, Math.floor(size * 0.45)),
            }}
        >
            {label[0]?.toUpperCase() ?? '?'}
        </span>
    );
}

export function ProtocolIcon({
    name,
    size = 18,
    className = '',
}: {
    name: string;
    size?: number;
    className?: string;
}) {
    const [urls, setUrls] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [inView, setInView] = useState(false);
    const containerRef = React.useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px' },
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!inView) return;

        let cancelled = false;
        setIndex(0);
        setLoading(true);
        const list = getProtocolIconUrls(name);
        fetchProtocolLogo(name).then((logo) => {
            if (cancelled) return;
            const finalUrls = logo
                ? [logo, ...list.filter((u) => u !== logo)]
                : list;
            setUrls(finalUrls);
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [name, inView]);

    if (loading && urls.length === 0) {
        return (
            <span
                ref={containerRef}
                className={`inline-block shrink-0 ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    if (index >= urls.length || urls.length === 0) {
        return (
            <LetterFallback
                label={name}
                size={size}
                rounded='rounded'
                className={className}
            />
        );
    }

    return (
        <img
            key={urls[index]}
            src={urls[index]}
            alt={name}
            loading='lazy'
            decoding='async'
            className={`shrink-0 rounded object-contain ${className}`}
            style={{ width: size, height: size }}
            onError={() => setIndex((i) => i + 1)}
        />
    );
}

export function ChainIcon({
    name,
    size = 14,
    className = '',
}: {
    name: string;
    size?: number;
    className?: string;
}) {
    const [error, setError] = useState(false);
    const iconUrl = getChainIconUrl(name);

    if (error || !iconUrl) {
        return (
            <span
                className={`shrink-0 inline-block rounded-full bg-[#556677] ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <img
            key={iconUrl}
            src={iconUrl}
            alt={name}
            loading='lazy'
            decoding='async'
            className={`shrink-0 rounded-full object-contain ${className}`}
            style={{ width: size, height: size }}
            onError={() => setError(true)}
        />
    );
}

export function AssetIcon({
    name,
    size = 28,
    className = '',
    priority = 'normal',
}: {
    name: string;
    size?: number;
    className?: string;
    priority?: 'high' | 'normal' | 'low';
}) {
    const [urls, setUrls] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [inView, setInView] = useState(false);
    const containerRef = React.useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (priority === 'high') {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px' },
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [priority]);

    useEffect(() => {
        if (!inView) return;

        let cancelled = false;
        setIndex(0);
        setLoading(true);
        const key = name.toLowerCase();
        const staticIcon = STATIC_ICON_MAP[key];
        const fallbacks = getCategoryFallbackUrls(key);

        fetchAssetImage(name).then((image) => {
            if (cancelled) return;
            const list = [staticIcon, image, ...fallbacks].filter(
                (u): u is string => Boolean(u),
            );
            setUrls(Array.from(new Set(list)));
            setLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [name, inView]);

    if (loading && urls.length === 0) {
        return (
            <span
                ref={containerRef}
                className={`inline-block shrink-0 ${className}`}
                style={{ width: size, height: size }}
            />
        );
    }

    if (index >= urls.length || urls.length === 0) {
        return (
            <LetterFallback label={name} size={size} className={className} />
        );
    }

    const fetchPriorityVal =
        priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'auto';
    const loadingVal = priority === 'high' ? 'eager' : 'lazy';

    return (
        <img
            key={urls[index]}
            src={urls[index]}
            alt={name}
            loading={loadingVal}
            fetchPriority={fetchPriorityVal}
            decoding='async'
            className={`shrink-0 rounded-full object-contain shadow-sm ${className}`}
            style={{ width: size, height: size }}
            onError={() => setIndex((i) => i + 1)}
        />
    );
}
