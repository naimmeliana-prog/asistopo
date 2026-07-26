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
    res.status(400).json({ error: "Falta el enlace oficial de la convocatoria." });
    return;
  }

  try {
    const response = await fetch(link, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      }
    });

    if (!response.ok) {
      console.warn(`BOE page HTTP error: ${response.status}`);
      res.json({
        title: "Documento Oficial del BOE",
        pdfUrl: link,
        text: `<div class="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-3">
                <p className="font-semibold">⚠️ El servidor del BOE está experimentando alta demanda o restricciones de acceso temporales.</p>
                <p>Para garantizar que accedes a la información consolidada en tiempo real y sin intermediarios, puedes abrir la publicación oficial directamente:</p>
                <a href="${link}" target="_blank" class="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-all decoration-none">
                  Abrir Convocatoria en BOE.es
                </a>
               </div>`,
        attachments: []
      });
      return;
    }

    const html = await response.text();
    
    // Parse title
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/ - BOE\.es/g, "").trim() : "Convocatoria Oficial del BOE";

    // Extract PDF link
    let pdfUrl = "";
    const pdfLinkMatch = html.match(/href="([^"]+\.pdf)"/i) || html.match(/href='([^']+\.pdf)'/i);
    if (pdfLinkMatch) {
      const relativePdf = pdfLinkMatch[1];
      pdfUrl = relativePdf.startsWith("http") ? relativePdf : `https://www.boe.es${relativePdf.startsWith("/") ? "" : "/"}${relativePdf}`;
    } else {
      const docIdMatch = link.match(/id=(BOE-[A-Z]-\d{4}-\d+)/i);
      if (docIdMatch) {
        const docId = docIdMatch[1];
        const parts = docId.split("-");
        if (parts.length >= 4) {
          const year = parts[2];
          pdfUrl = `https://www.boe.es/boe/dias/${year}/03/01/pdfs/${docId}.pdf`;
        }
      }
    }

    // Extract clean document body
    let cleanText = "";
    const textoxsMatch = html.match(/<div[^>]+id="textoxs"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<div/i) 
      || html.match(/<div[^>]+class="documento"[^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/<div[^>]+id="bloqueTexto"[^>]*>([\s\S]*?)<\/div>/i);
      
    if (textoxsMatch) {
      cleanText = textoxsMatch[1]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .trim();
    } else {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      cleanText = bodyMatch ? bodyMatch[1] : html;
    }

    // Parse out links to official annexes or exam sheets if present
    const attachments: { label: string; url: string }[] = [];
    const anchorRegex = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const matches = Array.from(html.matchAll(anchorRegex));
    for (const match of matches) {
      const urlGroup = match[1];
      const textGroup = match[2].replace(/<[^>]*>/g, "").trim();
      if (urlGroup.includes(".pdf") || urlGroup.includes("inap") || urlGroup.includes("sede") || urlGroup.includes("convocatoria") || urlGroup.includes("examen")) {
        const fullUrl = urlGroup.startsWith("http") ? urlGroup : `https://www.boe.es${urlGroup.startsWith("/") ? "" : "/"}${urlGroup}`;
        if (!attachments.some(a => a.url === fullUrl)) {
          attachments.push({
            label: textGroup || "Enlace Oficial Relacionado",
            url: fullUrl
          });
        }
      }
    }

    res.json({
      title,
      pdfUrl,
      text: cleanText,
      attachments
    });

  } catch (err: any) {
    console.error("Error fetching BOE text:", err);
    res.status(500).json({ error: "No se pudo obtener el texto oficial consolidado de la convocatoria." });
  }
}
