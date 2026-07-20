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
    const pdfMatch = normalizedLink.match(/\.(pdf|docx?|zip|xlsm?)(\?.*)?$/i);
    if (pdfMatch) {
      res.json({
        title: "Documento oficial",
        materialFiles: [
          {
            label: "Documento oficial descargable",
            url: normalizedLink,
            type: pdfMatch[1].toLowerCase(),
          },
        ],
      });
      return;
    }

    const response = await fetch(normalizedLink, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      throw new Error(`BOE page HTTP error: ${response.status}`);
    }

    const html = await response.text();
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : "Convocatoria oficial";

    const fileLinks: { label: string; url: string; type: string }[] = [];
    const anchorRegex = /<a[^>]+href=(?:"|')([^"']+)(?:"|')[^>]*>([\s\S]*?)<\/a>/gi;
    let anchorMatch;
    while ((anchorMatch = anchorRegex.exec(html)) !== null) {
      const url = anchorMatch[1];
      const text = anchorMatch[2].replace(/<[^>]*>/g, "").trim();
      const normalizedUrl = url.startsWith("http") ? url : (url.startsWith("/") ? `https://www.boe.es${url}` : url);
      const extMatch = normalizedUrl.match(/\.(pdf|docx?|zip|xlsm?)(\?.*)?$/i);
      if (extMatch) {
        const type = extMatch[1].toLowerCase();
        fileLinks.push({
          label: text || type.toUpperCase(),
          url: normalizedUrl,
          type,
        });
      }
    }

    res.json({
      title: pageTitle,
      materialFiles: fileLinks.length > 0 ? fileLinks : [{ label: "Página oficial", url: normalizedLink, type: "html" }],
    });
  } catch (error: any) {
    console.error("Error in /api/boe-material:", error);
    res.status(500).json({ error: "Error al obtener los materiales oficiales." });
  }
}
