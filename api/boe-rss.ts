import { VercelRequest, VercelResponse } from "@vercel/node";

// Helper function to clean and decode XML/HTML text
function cleanXmlText(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Helper function to fetch real search results from the BOE search page and parse HTML results
async function fetchBoeRealSearch(query: string): Promise<any[]> {
  try {
    const normalizedQuery = query.trim() || "oposiciones";
    const searchQuery = normalizedQuery.toLowerCase().includes("oposicion")
      ? normalizedQuery
      : `${normalizedQuery} oposiciones`;

    const params = new URLSearchParams({
      accion: "Buscar",
      bd: "boe",
      texto: searchQuery,
    });

    const url = `https://www.boe.es/buscar/redirector.php?${params.toString()}`;

    console.log("Fetching real BOE search from URL:", url);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`BOE HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const itemRegex = /<li class="resultado-busqueda">([\s\S]*?)<\/li>/gi;
    const items: any[] = [];
    let match;

    while ((match = itemRegex.exec(html)) !== null) {
      const itemHtml = match[1];
      const lineDemMatch = itemHtml.match(/<p class="linea-dem">([\s\S]*?)<\/p>/i);
      const linePubMatch = itemHtml.match(/<p class="linea-pub">([\s\S]*?)<\/p>/i);
      const descriptionMatch = itemHtml.match(/<p>([\s\S]*?)<\/p>/i);
      const linkMatch = itemHtml.match(/href="([^"]*\b(?:doc|act)\.php\?id=[^"]+)"/i);

      const lineDem = lineDemMatch ? cleanXmlText(lineDemMatch[1]) : "";
      const linePub = linePubMatch ? cleanXmlText(linePubMatch[1]) : "";
      const description = descriptionMatch ? cleanXmlText(descriptionMatch[1]) : "";
      const relativeLink = linkMatch ? linkMatch[1].trim() : "";
      const link = relativeLink
        ? relativeLink.startsWith("http")
          ? relativeLink
          : `https://www.boe.es${relativeLink.startsWith("/") ? "" : "/"}${relativeLink.replace(/^(\.\.)?\//, "")}`
        : "";

      let title = description || lineDem || linePub;
      if (title) {
        title = title.replace(/\s+/g, " ").trim();
      }

      let pubDate = new Date().toISOString();
      if (linePub) {
        const pubDateMatch = linePub.match(/(\d{2}\/\d{2}\/\d{4})/);
        if (pubDateMatch) {
          const [day, month, year] = pubDateMatch[1].split("/");
          pubDate = `${year}-${month}-${day}T08:00:00Z`;
        }
      }

      const descriptionParts = [lineDem, linePub, description].filter((part) => part && part.trim());
      const uniqueDescriptionParts = Array.from(new Set(descriptionParts));
      const fullDescription = uniqueDescriptionParts.join(" | ").trim();

      if (title && link) {
        items.push({
          id: link,
          title,
          link,
          pubDate,
          description: fullDescription,
          htmlUrl: link,
        });
      }
    }

    console.log(`Parsed ${items.length} items from BOE search`);
    return items;
  } catch (error) {
    console.error("Error fetching BOE search:", error);
    return [];
  }
}

// Helper to match query against title/description
function matchesQuery(title: string, description: string, query: string): boolean {
  if (!query.trim()) return true;
  const lowerQuery = query.toLowerCase();
  return title.toLowerCase().includes(lowerQuery) || description.toLowerCase().includes(lowerQuery);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const query = (req.query.q as string) || "";

    // 1. Query the live official BOE Search API as the primary source
    let items = await fetchBoeRealSearch(query);
    if (query) {
      // Apply strict keyword matching
      items = items.filter(item => matchesQuery(item.title, item.description, query));
    }

    if (items && items.length > 0) {
      res.json({ items });
      return;
    }

    // No fallback to AI or local repositories: return only official BOE results.
    console.log("No items from direct BOE search for query.");
    res.json({ items: [] });
  } catch (error: any) {
    console.error("Error in /api/boe-rss:", error);
    res.json({ items: [] });
  }
}
