import { useState, useMemo, useEffect, useRef } from "react";
import { OppositionData } from "../types";
import { Search, RefreshCw, ExternalLink, MapPin, AlertTriangle, Sparkles, Loader2, CheckCircle, Clock } from "lucide-react";
import { generateClientOpposition } from "../lib/clientAiGenerator";

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

// Local cache helpers to store recent search results safely (max 30 items)
const getSearchCache = (): RSSItem[] => {
  try {
    const saved = localStorage.getItem("opo_searched_items_cache");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn("Error parsing search cache", e);
    return [];
  }
};

const saveToSearchCache = (items: RSSItem[]) => {
  try {
    const current = getSearchCache();
    const merged = [...items];
    current.forEach(oldItem => {
      const exists = merged.some(m => m.title.trim().toLowerCase() === oldItem.title.trim().toLowerCase());
      if (!exists && merged.length < 30) {
        merged.push(oldItem);
      }
    });
    localStorage.setItem("opo_searched_items_cache", JSON.stringify(merged.slice(0, 30)));
  } catch (e) {
    console.warn("Error saving to search cache", e);
  }
};

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
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Controller ref to abort previous in-flight requests on new keystrokes
  const activeControllerRef = useRef<AbortController | null>(null);

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

  const getItemStatus = (pubDateStr: string) => {
    if (!pubDateStr) return { label: "BOE Oficial", color: "bg-slate-100 text-slate-700 border-slate-200" };
    const pubDate = new Date(pubDateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 3600 * 24));
    
    if (isNaN(diffDays) || diffDays < 0) {
      return { label: "Plazo Reciente / Vigente", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    }
    
    if (diffDays <= 30) {
      return { label: "Plazo Abierto / Reciente", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    } else if (diffDays <= 60) {
      return { label: "En Tramitación", color: "bg-amber-100 text-amber-800 border-amber-300" };
    } else {
      const dateFormatted = pubDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
      return { label: `Publicado (${dateFormatted})`, color: "bg-slate-100 text-slate-600 border-slate-200" };
    }
  };

  const handleImportOpposition = async (item: RSSItem) => {
    setImportingTitle(item.title);
    setImportSuccessMessage(null);
    try {
      let data: any = null;
      try {
        const response = await fetch("/api/gemini/generate-custom-opposition", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: item.title, description: item.description }),
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (apiErr) {
        console.warn("Backend API not reachable. Using client-side AI generator.", apiErr);
      }

      // If backend fails, use client-side generator to guarantee 100% operation
      if (!data) {
        data = generateClientOpposition(item.title, item.description);
      }
      
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
      alert("Hubo un error al generar la oposición: " + err.message);
    } finally {
      setImportingTitle(null);
    }
  };

  const fetchRssFeed = async (searchQuery: any = "") => {
    // Abort any existing in-flight request
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    setLoadingRss(true);
    setRssError("");
    const actualQuery = typeof searchQuery === "string" ? searchQuery.trim() : searchTerm.trim();

    try {
      const url = actualQuery
        ? `/api/boe-rss?q=${encodeURIComponent(actualQuery)}`
        : "/api/boe-rss";
      
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error("No se pudo conectar con el servidor backend de BOE.");
      }
      const data = await response.json();
      setIsOfflineMode(false);
      
      let fetchedItems: RSSItem[] = [];
      if (data && Array.isArray(data.items)) {
        fetchedItems = data.items;
      }
      
      setRssItems(fetchedItems);
      if (fetchedItems.length > 0) {
        saveToSearchCache(fetchedItems);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // Silently return if aborted by a new typed search term
        return;
      }
      console.warn("API Error, utilizing client-side fallback mode:", err);
      setIsOfflineMode(true);
      
      // Client-side fallback: Match catalog oppositions + cached BOE searches
      const cache = getSearchCache();
      const normQuery = normalizeString(actualQuery);
      
      let fallbackList: RSSItem[] = [];

      // 1. Filter local cache
      if (normQuery) {
        fallbackList = cache.filter(item => 
          normalizeString(item.title).includes(normQuery) || 
          normalizeString(item.description).includes(normQuery)
        );
      } else {
        fallbackList = [...cache];
      }

      // 2. Add matching items from local catalog
      if (allOppositions && allOppositions.length > 0) {
        allOppositions.forEach(opp => {
          if (!normQuery || normalizeString(opp.name).includes(normQuery) || normalizeString(opp.shortName).includes(normQuery) || normalizeString(opp.region).includes(normQuery)) {
            const exists = fallbackList.some(item => normalizeString(item.title).includes(normalizeString(opp.name)));
            if (!exists) {
              fallbackList.push({
                title: `${opp.name} (${opp.region})`,
                link: opp.card?.officialLink || "https://www.boe.es/diario_boe/oposiciones.php",
                pubDate: new Date().toISOString(),
                description: `Oposición oficial del Catálogo: Plazas ${opp.card?.vacancies || 'Convocadas'}. Grupo ${opp.group}. ${opp.generalRequirements?.[0] || ''}`
              });
            }
          }
        });
      }

      setRssItems(fallbackList);
    } finally {
      setLoadingRss(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRssFeed(searchTerm);
    }, 400); // 400ms debounce
    return () => {
      clearTimeout(delayDebounceFn);
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
    };
  }, [searchTerm]);

  const filteredRssItems = useMemo(() => {
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
        {isOfflineMode ? (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Modo Catálogo Integrado (Offline/Estático)
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Conexión en Directo con Boletines Oficiales
          </div>
        )}
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
              <p className="text-xs text-gray-500 font-medium font-sans">Buscando convocatorias reales en el Boletín Oficial del Estado (BOE)...</p>
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

                const statusInfo = getItemStatus(item.pubDate);

                return (
                  <div
                    key={index}
                    id={`rss-card-${index}`}
                    className="p-5 bg-white border border-gray-100 hover:border-indigo-200 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeColor} uppercase tracking-wider`}>
                          {badgeText}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusInfo.color} flex items-center gap-1`}>
                          <Clock className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {item.title}
                        </h4>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer shrink-0"
                          title="Ver publicación oficial en el BOE"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          {item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 flex-wrap gap-2">
                      <span className="text-[10px] text-gray-400 font-semibold italic flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        BOE / Diario Oficial
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
                  Escribe términos como "Justicia", "Auxiliar", "Sanidad", "Policía", o limpia el campo para ver las convocatorias más recientes del BOE.
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
                  Limpiar búsqueda y ver recientes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
