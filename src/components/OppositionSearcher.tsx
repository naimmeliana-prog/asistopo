import { useState, useMemo, useEffect } from "react";
import { OppositionData } from "../types";
import { Search, RefreshCw, ExternalLink, MapPin, AlertTriangle, Sparkles, Loader2, CheckCircle } from "lucide-react";

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

interface OppositionSearcherProps {
  onSelectOpposition: (id: string) => void;
  selectedOppositionId: string;
  allOppositions: OppositionData[];
  onAddCustomOpposition: (newOpp: OppositionData) => void;
}

export default function OppositionSearcher({
  onSelectOpposition,
  selectedOppositionId,
  allOppositions,
  onAddCustomOpposition,
}: OppositionSearcherProps) {
  // Search and results state
  const [searchTerm, setSearchTerm] = useState("");
  const [rssItems, setRssItems] = useState<RSSItem[]>([]);
  const [loadingRss, setLoadingRss] = useState(false);
  const [rssError, setRssError] = useState("");

  // Custom opposition import state
  const [importingTitle, setImportingTitle] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Accent and diacritic-insensitive normalization for Spanish searches
  const normalizeString = (str: string): string => {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const handleImportOpposition = async (item: RSSItem) => {
    setImportingTitle(item.title);
    setImportSuccessMessage(null);
    try {
      const response = await fetch("/api/gemini/generate-custom-opposition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, description: item.description }),
      });
      if (!response.ok) {
        throw new Error("No se pudo generar la oposición.");
      }
      const data = await response.json();
      
      if (!data.id) {
        data.id = normalizeString(item.title)
          .replace(/[^a-zA-Z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .toLowerCase()
          .slice(0, 50);
      }
      
      onAddCustomOpposition(data);
      setImportSuccessMessage(`¡Éxito! "${data.shortName || data.name}" se ha añadido al Catálogo y se ha seleccionado automáticamente para su estudio.`);
      
      // Auto-select immediately
      onSelectOpposition(data.id);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setImportSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error(err);
      alert("Hubo un error al generar la oposición con IA: " + err.message);
    } finally {
      setImportingTitle(null);
    }
  };

  const fetchRssFeed = async (searchQuery: any = "") => {
    setLoadingRss(true);
    setRssError("");
    try {
      const actualQuery = typeof searchQuery === "string" ? searchQuery.trim() : searchTerm.trim();
      const url = actualQuery
        ? `/api/boe-rss?q=${encodeURIComponent(actualQuery)}`
        : "/api/boe-rss";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("No se pudo obtener el feed de BOE.");
      }
      const data = await response.json();
      if (data && Array.isArray(data.items)) {
        setRssItems(data.items);
      } else if (data && typeof data.xml === "string") {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.xml, "text/xml");
        const xmlItems = xmlDoc.querySelectorAll("item");
        const parsedItems: RSSItem[] = [];
        xmlItems.forEach((item) => {
          const title = item.querySelector("title")?.textContent || "";
          const link = item.querySelector("link")?.textContent || "";
          const pubDate = item.querySelector("pubDate")?.textContent || "";
          const description = item.querySelector("description")?.textContent || "";
          parsedItems.push({ title, link, pubDate, description });
        });
        setRssItems(parsedItems);
      }
    } catch (err: any) {
      console.error(err);
      setRssError("No se pudieron cargar los resultados en este momento. Por favor, inténtelo de nuevo más tarde.");
    } finally {
      setLoadingRss(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRssFeed(searchTerm);
    }, 600); // 600ms debounce
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const filteredRssItems = useMemo(() => {
    // The backend now queries the live official BOE XML API in real time and returns pre-filtered
    // matches for the user's specific query. We return rssItems directly to avoid over-filtering.
    return rssItems;
  }, [rssItems]);

  return (
    <div id="opposition-searcher" className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" />
            Buscador de Convocatorias en Directo
          </h2>
          <p className="text-xs text-gray-500">
            Sincronizado en tiempo real con el Boletín Oficial del Estado (BOE) y diarios oficiales autonómicos.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Conexión en Directo con Boletines Oficiales
        </div>
      </div>

      <div className="space-y-6">
        {/* Search Bar for Real-time bulletins */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Buscar por palabra clave en boletines oficiales (BOE, BOJA, BOCM, DOGV...)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="search-input-rss"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: Justicia, Hacienda, Auxiliar Administrativo, Sanidad, Policía..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <button
              id="btn-refresh-rss"
              onClick={() => fetchRssFeed(searchTerm)}
              disabled={loadingRss}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 h-10 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRss ? "animate-spin" : ""}`} />
              Buscar en Boletines
            </button>
          </div>

          {rssError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{rssError}</span>
            </div>
          )}
        </div>

        {importSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-start gap-3 shadow-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{importSuccessMessage}</span>
          </div>
        )}

        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold">
              Resultados encontrados: {filteredRssItems.length} convocatorias oficiales
            </span>
          </div>

          {loadingRss ? (
            <div className="p-10 text-center bg-white border border-gray-100 rounded-2xl space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium font-sans">Buscando convocatorias reales mediante Grounding Web en boletines oficiales...</p>
            </div>
          ) : filteredRssItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRssItems.map((item, index) => {
                const titleLower = item.title.toLowerCase();
                const isSanidad = titleLower.includes("medic") || titleLower.includes("sanidad") || titleLower.includes("salud") || titleLower.includes("enfermer") || titleLower.includes("celador");
                const isPolicia = titleLower.includes("policia") || titleLower.includes("bomber") || titleLower.includes("interior") || titleLower.includes("seguridad") || titleLower.includes("guardia civil") || titleLower.includes("conductor");
                const isHacienda = titleLower.includes("hacienda") || titleLower.includes("auxiliar") || titleLower.includes("administrativo") || titleLower.includes("gestion") || titleLower.includes("tramitacion");
                const badgeText = isSanidad ? "Sanidad" : isPolicia ? "Seguridad" : isHacienda ? "Administración" : "Empleo Público";
                const badgeColor = isSanidad ? "bg-cyan-100 text-cyan-800" : isPolicia ? "bg-amber-100 text-amber-800" : isHacienda ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800";

                return (
                  <div
                    key={index}
                    id={`rss-card-${index}`}
                    className="p-5 bg-white border border-gray-100 hover:border-gray-200 rounded-2xl shadow-xs hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeColor} uppercase tracking-wider`}>
                            {badgeText}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {item.pubDate ? new Date(item.pubDate).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "Fecha reciente"}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer shrink-0"
                        title="Ver boletín original"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 flex-wrap gap-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400 font-semibold italic flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        BOE / Boletín Oficial
                      </span>
                      <button
                        id={`btn-import-opo-${index}`}
                        disabled={importingTitle !== null}
                        onClick={() => handleImportOpposition(item)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow-sm disabled:cursor-not-allowed"
                      >
                        {importingTitle === item.title ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            <span>Analizando...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
                            <span>Estudiar con IA</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-3.5 max-w-md mx-auto">
              <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">No se encontraron convocatorias</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                  Realiza una búsqueda escribiendo palabras clave como "Justicia", "Auxiliar", "Madrid", etc., para buscar en tiempo real en los boletines oficiales.
                </p>
              </div>
              {searchTerm && (
                <button
                  id="btn-reset-rss-search"
                  onClick={() => {
                    setSearchTerm("");
                    fetchRssFeed("");
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all inline-block"
                >
                  Limpiar búsqueda y mostrar recientes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
