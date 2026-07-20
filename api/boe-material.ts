import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const link = (req.query.link as string || "").trim();
  if (!link) {
    res.status(400).json({ error: "No se ha especificado el enlace oficial de la convocatoria." });
    return;
  }

  try {
    const normalizedLink = link;
    
    console.log("Fetching material from:", normalizedLink);
    
    const response = await fetch(normalizedLink, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      console.error(`BOE page HTTP error: ${response.status}`);
      // Return at least the link itself as a fallback
      res.json({
        title: "Documento oficial de BOE",
        materialFiles: [{ 
          label: "Ver en BOE (enlace directo)", 
          url: normalizedLink, 
          type: "html" 
        }],
      });
      return;
    }

    const html = await response.text();
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : "Convocatoria oficial";

    const fileLinks: { label: string; url: string; type: string }[] = [];
    
    // Look for PDF links on the page
    const pdfRegex = /href=["']([^"']*\.pdf[^"']*?)["']/gi;
    let pdfMatch;
    while ((pdfMatch = pdfRegex.exec(html)) !== null) {
      const url = pdfMatch[1];
      const normalizedUrl = url.startsWith("http") ? url : (url.startsWith("/") ? `https://www.boe.es${url}` : `https://www.boe.es/${url}`);
      
      // Extract document ID from URL if available
      const docIdMatch = url.match(/BOE-[A-Z]-\d+-\d+/);
      const label = docIdMatch ? `PDF ${docIdMatch[0]}` : "Descargar PDF";
      
      fileLinks.push({
        label,
        url: normalizedUrl,
        type: "pdf",
      });
    }

    // Also look for general document links
    const anchorRegex = /<a[^>]+href=(?:"|')([^"']+)(?:"|')[^>]*title=(?:"|')([^"']*?)(?:"|')[^>]*>([\s\S]*?)<\/a>/gi;
    let anchorMatch;
    while ((anchorMatch = anchorRegex.exec(html)) !== null) {
      const url = anchorMatch[1];
      const title = anchorMatch[2] || anchorMatch[3];
      const text = title.replace(/<[^>]*>/g, "").trim();
      
      if (!url.includes("#") && (url.includes("pdf") || url.includes("doc") || url.includes("xml") || text.toLowerCase().includes("descargar"))) {
        const normalizedUrl = url.startsWith("http") ? url : (url.startsWith("/") ? `https://www.boe.es${url}` : url);
        const extMatch = normalizedUrl.match(/\.(pdf|docx?|xlsx?|zip)(\?.*)?$/i);
        
        if (extMatch) {
          const type = extMatch[1].toLowerCase();
          const isDuplicate = fileLinks.some(f => f.url === normalizedUrl);
          
          if (!isDuplicate) {
            fileLinks.push({
              label: text || `Descargar ${type.toUpperCase()}`,
              url: normalizedUrl,
              type,
            });
          }
        }
      }
    }

    // If no documents found, provide the main page link
    if (fileLinks.length === 0) {
      fileLinks.push({ 
        label: "Ver en BOE (página principal)", 
        url: normalizedLink, 
        type: "html" 
      });
    }

    console.log(`Found ${fileLinks.length} material files`);
    
    res.json({
      title: pageTitle,
      materialFiles: fileLinks,
    });
  } catch (error: any) {
    console.error("Error in /api/boe-material:", error);
    res.status(500).json({ 
      error: "Error al obtener los materiales oficiales.",
      message: error.message 
    });
  }
}
