import { NextRequest, NextResponse } from 'next/server';
import {
    STATIC_ICON_MAP,
    ASSET_ID_OVERRIDES,
    sanitizeImageUrl,
} from '@/app/icons/iconConstants';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CACHE_TTL = 1000 * 60 * 60 * 12;
const NEGATIVE_CACHE_TTL = 1000 * 60 * 5;

type CoinGeckoSearchCoin = {
    id: string;
    symbol: string;
    market_cap_rank: number | null;
    thumb: string;
    large: string;
};

const cache = new Map<string, { image: string | null; expires: number }>();

async function fetchByCoinId(coinId: string): Promise<string | null> {
    const res = await fetch(
        `${COINGECKO_API}/coins/${encodeURIComponent(coinId)}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`,
        {
            headers: { accept: 'application/json' },
            next: { revalidate: 60 * 60 * 12 },
        },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (
        sanitizeImageUrl(data.image?.large) ??
        sanitizeImageUrl(data.image?.small) ??
        sanitizeImageUrl(data.image?.thumb)
    );
}

async function fetchBySearch(
    query: string,
    symbolKey: string,
): Promise<string | null> {
    const res = await fetch(
        `${COINGECKO_API}/search?query=${encodeURIComponent(query)}`,
        {
            headers: { accept: 'application/json' },
            next: { revalidate: 60 * 60 * 12 },
        },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { coins: CoinGeckoSearchCoin[] };
    const match = data.coins
        .filter((c) => c.symbol.toLowerCase() === symbolKey)
        .sort(
            (a, b) =>
                (a.market_cap_rank ?? Infinity) -
                (b.market_cap_rank ?? Infinity),
        )[0];
    return sanitizeImageUrl(match?.large) ?? sanitizeImageUrl(match?.thumb);
}

async function resolveImage(symbol: string): Promise<string | null> {
    const key = symbol.toLowerCase();

    const cached = cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.image;

    const staticUrl = STATIC_ICON_MAP[key];
    if (staticUrl) {
        cache.set(key, { image: staticUrl, expires: Date.now() + CACHE_TTL });
        return staticUrl;
    }

    try {
        const overrideId = ASSET_ID_OVERRIDES[key];
        let image: string | null = null;

        if (overrideId) {
            image = await fetchByCoinId(overrideId);
        }

        if (!image) {
            image = await fetchBySearch(overrideId ?? key, key);
        }

        const ttl = image ? CACHE_TTL : NEGATIVE_CACHE_TTL;
        cache.set(key, { image, expires: Date.now() + ttl });
        return image;
    } catch {
        cache.set(key, {
            image: null,
            expires: Date.now() + NEGATIVE_CACHE_TTL,
        });
        return null;
    }
}

export async function GET(req: NextRequest) {
    const symbol = req.nextUrl.searchParams.get('symbol')?.trim();
    if (!symbol) {
        return NextResponse.json(
            { error: 'missing ?symbol=' },
            { status: 400 },
        );
    }

    try {
        const image = await resolveImage(symbol);
        return NextResponse.json(
            { image },
            {
                headers: {
                    'Cache-Control':
                        'public, max-age=3600, stale-while-revalidate=86400',
                },
            },
        );
    } catch {
        return NextResponse.json({ image: null }, { status: 200 });
    }
}
