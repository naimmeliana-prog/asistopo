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
      if (!isRealOpposition(title, fullDescription, query)) {
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

// Helper to filter out non-opposition results (noise)
function isRealOpposition(title: string, description: string, userQuery?: string): boolean {
  const combined = (title + " " + description).toLowerCase();
  
  // STRONG EXCLUSIONS: Very obvious non-opposition items
  const strongExcludePatterns = [
    /relaci[óo]n\s+(?:definitiva|provisional|de\s+aprobados?|de\s+admitidos?|de\s+suplentes?)/i,
    /resoluci[óo]n\s+.*\s+(?:nombra|nombre|designa)(?:\s+funcionarios?)?/i,
    /tribunal\s+calificador/i,
    /errata|fe\s+de\s+erratas?/i,
    /resultado(?:s)?\s+(?:de\s+)?(?:la\s+)?(?:prueba|examen|fase|valoraci[óo]n)/i,
    /inadmisi[óo]n|desestima(?:ci[óo]n)?/i,
    /recurso\s+(?:contencioso|administrativo|de\s+alzada)/i,
  ];
  
  // SOFT EXCLUSIONS: Could be oposición but need more evidence
  // These patterns are only exclusionary if NOT accompanied by opposition keywords
  const softExcludePatterns = [
    /correci[óo]n\s+de\s+(?:erratas?|errores?)/i,
    /aclaraci[óo]n|ampliaci[óo]n|suspensi[óo]n|anulaci[óo]n/i,
    /modificaci[óo]n/i,
  ];
  
  // Strong exclusions always filter out
  for (const pattern of strongExcludePatterns) {
    if (pattern.test(combined)) {
      return false;
    }
  }
  
  // INCLUSIONS: Strong indicators of opposition
  const strongIncludePatterns = [
    /convocatoria\s+(?:de\s+)?oposiciones?/i,
    /oposiciones?\s+(?:libres?|por\s+orden|de\s+promoci[óo]n)/i,
    /plazas?\s+(?:de\s+)?oposici[óo]n/i,
    /base(?:s)?\s+(?:de\s+)?(?:la\s+)?(?:convocatoria|oposici[óo]n)/i,
    /adjudicaci[óo]n\s+de\s+plazas/i,
    /proceso\s+selectivo/i,
    /prueba(?:s)?\s+selectiva(?:s)?/i,
    /cuerpo\s+(?:de\s+)?(?:cuerpos?)?\s+\w+\s+(?:oposici[óo]n|selecci[óo]n)/i,
  ];
  
  // Check strong inclusions
  const hasStrongInclusion = strongIncludePatterns.some(pattern => pattern.test(combined));
  
  // WEAKER INCLUSIONS: Common opposition keywords
  const weakIncludePatterns = [
    /oposici[óo]n/i,
    /selecci[óo]n\s+p[úu]blica/i,
    /empleo\s+p[úu]blico/i,
  ];
  
  const hasWeakInclusion = weakIncludePatterns.some(pattern => pattern.test(combined));
  
  // HEURISTIC: If user made a specific query and it appears in title/desc, trust it
  // (user is looking for "conductor oposiciones" - if BOE returns something with conductor, likely valid)
  if (userQuery && userQuery.length > 3) {
    const normalizedQuery = userQuery.toLowerCase()
      .replace(/\s+oposiciones?/i, "")
      .trim();
    
    if (normalizedQuery.length > 2 && combined.includes(normalizedQuery)) {
      // User's specific term is in the result, assume it's relevant
      // But still apply strong exclusions
      return hasWeakInclusion || hasStrongInclusion || true; // Give benefit of doubt if user's keyword is there
    }
  }
  
  // For soft exclusions: only apply if we don't have any inclusion signals
  if (!hasStrongInclusion && !hasWeakInclusion) {
    for (const pattern of softExcludePatterns) {
      if (pattern.test(combined)) {
        return false;
      }
    }
    return false; // Doesn't match any inclusion pattern
  }
  
  // Has some form of opposition indication
  return hasStrongInclusion || hasWeakInclusion;
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
    
    if (query) {
      // Apply strict keyword matching AND opposition filter
      items = items.filter(item => {
        const lowerQuery = query.toLowerCase();
        return (item.title.toLowerCase().includes(lowerQuery) || item.description.toLowerCase().includes(lowerQuery)) &&
               isRealOpposition(item.title, item.description, query);
      });
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
