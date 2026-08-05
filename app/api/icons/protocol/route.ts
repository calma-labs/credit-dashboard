import { NextRequest, NextResponse } from "next/server";

const DEFILLAMA_PROTOCOLS_URL = "https://api.llama.fi/protocols";


const PROTOCOL_NAME_ALIASES: Record<string, string> = {
  save: "solend",
};

type DefiLlamaProtocol = {
  name: string;
  slug: string;
  logo: string;
};

let protocolIndexPromise: Promise<Map<string, string>> | null = null;

async function loadProtocolIndex(): Promise<Map<string, string>> {
  if (!protocolIndexPromise) {
    protocolIndexPromise = fetch(DEFILLAMA_PROTOCOLS_URL, {
      next: { revalidate: 60 * 60 * 12 },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`DefiLlama /protocols ${res.status}`);
        return res.json() as Promise<DefiLlamaProtocol[]>;
      })
      .then((protocols) => {
        const index = new Map<string, string>();
        for (const p of protocols) {
          if (!p.logo) continue;
          if (p.slug) index.set(p.slug.toLowerCase(), p.logo);
          if (p.name) index.set(p.name.toLowerCase(), p.logo);
        }
        return index;
      })
      .catch((err) => {
        protocolIndexPromise = null;
        throw err;
      });
  }
  return protocolIndexPromise;
}

const STATIC_PROTOCOL_ICONS: Record<string, string> = {
  morpho: "https://icons.llama.fi/morpho.png",
  jupiter: "https://icons.llama.fi/jupiter.jpg",
  save: "https://icons.llama.fi/save.jpg",
  solend: "https://icons.llama.fi/save.jpg",
  kamino: "https://icons.llama.fi/kamino-lend.jpg",
  marginfi: "https://icons.llama.fi/marginfi.jpg",
  aave: "https://icons.llama.fi/aave.jpg",
};

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.toLowerCase().trim();
  if (!name) {
    return NextResponse.json({ error: "missing ?name=" }, { status: 400 });
  }

  const lookupKey = PROTOCOL_NAME_ALIASES[name] ?? name;

  const staticLogo = STATIC_PROTOCOL_ICONS[lookupKey];
  if (staticLogo) {
    return NextResponse.json(
      { logo: staticLogo },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
    );
  }

  try {
    const index = await loadProtocolIndex();
    const logo = index.get(lookupKey) ?? `https://icons.llama.fi/${encodeURIComponent(lookupKey)}.png`;
    return NextResponse.json(
      { logo },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
    );
  } catch {
    const fallbackLogo = `https://icons.llama.fi/${encodeURIComponent(lookupKey)}.png`;
    return NextResponse.json({ logo: fallbackLogo }, { status: 200 });
  }
}
