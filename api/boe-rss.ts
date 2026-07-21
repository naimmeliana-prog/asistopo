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
async function fetchBoeRealSearch(query: string, page: number = 1, scope?: string, category?: string, dateFrom?: string): Promise<any[]> {
  try {
    const normalizedQuery = query.trim() || "oposiciones";
    const searchQuery = normalizedQuery.toLowerCase().includes("oposicion")
      ? normalizedQuery
      : `${normalizedQuery} oposiciones`;

    // Add scope filter if provided
    let finalQuery = searchQuery;
    if (scope === "nacional") {
      finalQuery += " estado";
    } else if (scope === "autonomico") {
      finalQuery += " comunidad autónoma";
    } else if (scope === "local") {
      finalQuery += " ayuntamiento municipio";
    }

    // Add category filter if provided
    if (category) {
      finalQuery += ` ${category}`;
    }

    const params = new URLSearchParams({
      accion: "Buscar",
      bd: "boe",
      texto: finalQuery,
      orden: "fecha",
    });

    // Add pagination if supported by BOE
    if (page > 1) {
      params.set("pagina", page.toString());
    }

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
          const isoDate = new Date(`${year}-${month}-${day}`);
          
          // Apply date filter if provided
          if (dateFrom) {
            const filterDate = new Date(dateFrom);
            if (isoDate < filterDate) {
              continue; // Skip items older than filter date
            }
          }
          
          pubDate = `${year}-${month}-${day}T08:00:00Z`;
        }
      }

      const descriptionParts = [lineDem, linePub, description].filter((part) => part && part.trim());
      const uniqueDescriptionParts = Array.from(new Set(descriptionParts));
      const fullDescription = uniqueDescriptionParts.join(" | ").trim();

      // FILTER: Only include real opposition convocatorias
      if (!isRealOpposition(title, fullDescription)) {
        continue; // Skip non-opposition results
      }

      if (title && link) {
        items.push({
          id: link,
          title,
          link,
          pubDate,
          description: fullDescription,
          htmlUrl: link,
          scope: lineDem.toLowerCase().includes("estado") ? "nacional" : 
                 (lineDem.toLowerCase().includes("comunidad") || lineDem.toLowerCase().includes("junta") || lineDem.toLowerCase().includes("generalitat")) ? "autonomico" : "local",
          ministry: lineDem,
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
    const page = parseInt(req.query.page as string) || 1;
    const scope = req.query.scope as string; // "nacional", "autonomico", "local"
    const category = req.query.category as string; // "A1", "A2", "C1", "C2", etc.
    const dateFrom = req.query.dateFrom as string; // "YYYY-MM-DD"

    // Query the live official BOE Search API as the primary source
    let items = await fetchBoeRealSearch(query, page, scope, category, dateFrom);
    
    // 1. FILTER OUT OBVIOUS NON-OPPOSITION NOISE (always, regardless of query)
    items = items.filter(item => {
      const titleLC = item.title.toLowerCase();
      const descLC = item.description.toLowerCase();
      
      // STRONG EXCLUSIONS: These are definitely NOT opposition convocatorias
      if (titleLC.includes("relación definitiva") || 
          titleLC.includes("relación de admitidos") ||
          titleLC.includes("relación de aprobados") ||
          descLC.includes("relación definitiva") ||
          descLC.includes("relación de admitidos")) {
        return false; // This is NOT a convocatoria, it's a results list
      }
      
      // Exclude tribunal calificador articles (judge appointment notifications)
      if ((titleLC + descLC).includes("tribunal calificador") && 
          !(titleLC + descLC).includes("convocatoria")) {
        return false;
      }
      
      // Exclude errata/corrections
      if (titleLC.includes("errata") || titleLC.includes("fe de erratas")) {
        return false;
      }
      
      return true;
    });
    
    // 2. If user provided a search query, filter by keyword match
    if (query) {
      const beforeFilter = items.length;
      items = items.filter(item => {
        const lowerQuery = query.toLowerCase();
        const titleLC = item.title.toLowerCase();
        const descLC = item.description.toLowerCase();
        
        // Must contain search query
        return titleLC.includes(lowerQuery) || descLC.includes(lowerQuery);
      });
      
      console.log(`[FILTER] Query: "${query}" - Before: ${beforeFilter}, After: ${items.length} items`);
    }

    // Apply scope filter if specified
    if (scope) {
      items = items.filter(item => item.scope === scope);
    }

    // No fallback to AI or local repositories: return only official BOE results.
    if (!(items && items.length > 0)) {
      console.log("No items from direct BOE search for query.");
    }
    
    res.json({ 
      items,
      total: items.length,
      page,
      hasMore: items.length >= 50, // BOE typically returns ~50 items per page
    });
  } catch (error: any) {
    console.error("Error in /api/boe-rss:", error);
    res.json({ items: [], total: 0, page: 1, hasMore: false });
  }
}
