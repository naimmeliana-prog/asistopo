import { useState, useEffect } from "react";
import { OppositionData } from "../types";
import { Search, RefreshCw, ExternalLink, MapPin, AlertTriangle, FileText, Loader2, CheckCircle } from "lucide-react";

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  pdfUrl?: string;
  htmlUrl?: string;
}

interface MaterialFile {
  label: string;
  url: string;
  type: string;
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
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [selectedItemForMaterials, setSelectedItemForMaterials] = useState<RSSItem | null>(null);
  const [materialFiles, setMaterialFiles] = useState<MaterialFile[]>([]);
  const [materialTitle, setMaterialTitle] = useState<string | null>(null);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialError, setMaterialError] = useState<string | null>(null);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedScope, setSelectedScope] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Accent and diacritic-insensitive normalization for Spanish searches
  const normalizeString = (str: string): string => {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const handleFetchOfficialMaterials = async (item: RSSItem) => {
    setSelectedItemForMaterials(item);
    setMaterialFiles([]);
    setMaterialError(null);
    setLoadingMaterials(true);

    try {
      const response = await fetch(`/api/boe-material?link=${encodeURIComponent(item.link)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "No se pudo obtener el material oficial.");
      }

      const data = await response.json();
      setMaterialTitle(data.title || item.title);
      setMaterialFiles(Array.isArray(data.materialFiles) ? data.materialFiles : []);
      
      // IMPORTANT: Register the opposition from BOE search result as active
      // Use the BOE link as the unique ID for this opposition
      const boeLinkId = item.link;
      
      // Auto-select this opposition to make it "active"
      onSelectOpposition(boeLinkId);
    } catch (error: any) {
      console.error(error);
      setMaterialError(error.message || "No se pudo cargar el material oficial.");
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchRssFeed = async (searchQuery: any = "", page: number = 1, fetchMultiplePages: boolean = false) => {
    setLoadingRss(true);
    setRssError("");
    try {
      const actualQuery = typeof searchQuery === "string" ? searchQuery.trim() : searchTerm.trim();
      
      let allFetchedItems: RSSItem[] = [];
      
      // If user wants comprehensive search, fetch multiple pages
      const maxPages = fetchMultiplePages ? 5 : 1; // Fetch up to 5 pages for comprehensive search
      
      for (let pageNum = page; pageNum < page + maxPages; pageNum++) {
        const params = new URLSearchParams();
        if (actualQuery) params.append("q", actualQuery);
        if (selectedScope) params.append("scope", selectedScope);
        if (selectedCategory) params.append("category", selectedCategory);
        if (dateFrom) params.append("dateFrom", dateFrom);
        if (pageNum > 1) params.append("page", pageNum.toString());
        
        const url = `/api/boe-rss?${params.toString()}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("No se pudo obtener el feed de BOE.");
        }
        const data = await response.json();
        let fetchedItems: RSSItem[] = [];
        if (data && Array.isArray(data.items)) {
          fetchedItems = data.items;
        }
        
        // Add to all items
        allFetchedItems = [...allFetchedItems, ...fetchedItems];
        
        // If this page had fewer items than 50, no point fetching more
        if (fetchedItems.length < 50) {
          break;
        }
      }
      
      setRssItems(allFetchedItems);
      setCurrentPage(page);
    } catch (err: any) {
      console.error("Error fetching BOE data:", err);
      setRssError("No se pudo obtener resultados desde el BOE. Comprueba tu conexión o intenta otra consulta.");
      setRssItems([]);
    } finally {
      setLoadingRss(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRssFeed(searchTerm, 1);
    }, 600); // 600ms debounce
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedScope, selectedCategory, dateFrom]);

  const filteredRssItems = rssItems;

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
              onClick={() => fetchRssFeed(searchTerm, 1, false)}
              disabled={loadingRss}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 h-10 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRss ? "animate-spin" : ""}`} />
              Buscar en Boletines
            </button>
            <button
              onClick={() => fetchRssFeed(searchTerm, 1, true)}
              disabled={loadingRss}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 h-10 shrink-0 cursor-pointer disabled:opacity-50"
              title="Busca en múltiples páginas para obtener más resultados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRss ? "animate-spin" : ""}`} />
              Búsqueda Exhaustiva
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 h-10 shrink-0 cursor-pointer"
            >
              ⚙️ Filtros
            </button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Scope Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ámbito
                  </label>
                  <select
                    value={selectedScope}
                    onChange={(e) => {
                      setSelectedScope(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">Todos los ámbitos</option>
                    <option value="nacional">Nacional (Estado)</option>
                    <option value="autonomico">Autonómico</option>
                    <option value="local">Local (Municipios)</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Categoría/Grupo
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">Todos los grupos</option>
                    <option value="A1">Grupo A1 (Licenciados)</option>
                    <option value="A2">Grupo A2 (Diplomados)</option>
                    <option value="C1">Grupo C1 (Técnicos)</option>
                    <option value="C2">Grupo C2 (Auxiliares)</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Desde fecha
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedScope || selectedCategory || dateFrom) && (
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setSelectedScope("");
                      setSelectedCategory("");
                      setDateFrom("");
                      setCurrentPage(1);
                      fetchRssFeed(searchTerm, 1);
                    }}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}

          {rssError && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{rssError}</span>
            </div>
          )}
        </div>

        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-semibold">
              Resultados encontrados: {filteredRssItems.length} convocatorias oficiales
            </span>
          </div>

          {loadingRss ? (
            <div className="p-10 text-center bg-white border border-gray-100 rounded-2xl space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium font-sans">Consultando convocatorias oficiales en tiempo real desde el BOE...</p>
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

                    <div className="flex flex-col gap-3 pt-2 border-t border-gray-50">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-semibold italic flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          BOE / Boletín Oficial
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] rounded-xl border border-slate-200 transition-all"
                          >
                            Abrir convocatoria oficial
                          </a>
                          <button
                            id={`btn-materials-${index}`}
                            onClick={() => handleFetchOfficialMaterials(item)}
                            disabled={loadingMaterials && selectedItemForMaterials?.link === item.link}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-[10px] rounded-xl transition-all flex items-center gap-1"
                          >
                            {loadingMaterials && selectedItemForMaterials?.link === item.link ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-white" />
                            )}
                            <span>{selectedItemForMaterials?.link === item.link ? "Actualizando material" : "Ver material oficial"}</span>
                          </button>
                        </div>
                      </div>
                      {(item.pdfUrl || item.htmlUrl) && (
                        <div className="text-[10px] text-slate-500 space-y-1">
                          {item.pdfUrl && (
                            <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">
                              Descargar documento oficial en PDF
                            </a>
                          )}
                          {item.htmlUrl && item.htmlUrl !== item.link && (
                            <a href={item.htmlUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 underline">
                              Abrir versión HTML completa
                            </a>
                          )}
                        </div>
                      )}
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

          {selectedItemForMaterials && (
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Material oficial para</h3>
                  <p className="text-xs text-slate-500">{materialTitle || selectedItemForMaterials.title}</p>
                </div>
                <a href={selectedItemForMaterials.link} target="_blank" rel="noreferrer" className="text-[10px] uppercase font-semibold text-indigo-600 hover:text-indigo-800">
                  Abrir página oficial
                </a>
              </div>

              {materialError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
                  {materialError}
                </div>
              )}

              {!materialError && materialFiles.length === 0 && !loadingMaterials && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                  No se encontraron documentos oficiales descargables en la página. Abre la convocatoria oficial para acceder al temario completo y exámenes anteriores publicados por el BOE.
                </div>
              )}

              {materialFiles.length > 0 && (
                <div className="space-y-3 text-xs text-slate-700">
                  {materialFiles.map((file, idx) => (
                    <a key={idx} href={file.url} target="_blank" rel="noreferrer" className="block p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all">
                      <div className="font-semibold text-slate-900">{file.label}</div>
                      <div className="text-[10px] text-slate-500">Tipo: {file.type.toUpperCase()}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
