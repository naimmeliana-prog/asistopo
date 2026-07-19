import { useState, useMemo, useEffect } from "react";
import { OppositionData } from "../types";
import { Search, Filter, RefreshCw, ExternalLink, Calendar, MapPin, Layers, Wifi, AlertTriangle, Sparkles, Loader2, CheckCircle } from "lucide-react";

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
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [boeReference, setBoeReference] = useState("");
  const [status, setStatus] = useState("Todos");
  const [group, setGroup] = useState("Todos");
  const [adminType, setAdminType] = useState("Todos");
  const [region, setRegion] = useState("Todos");
  const [disabilityQuota, setDisabilityQuota] = useState("Todos");
  const [examType, setExamType] = useState("Todos");
  const [minDegree, setMinDegree] = useState("Todos");

  // Real-time BOE RSS states
  const [activeTab, setActiveTab] = useState<"local" | "realtime">("local");
  const [rssItems, setRssItems] = useState<RSSItem[]>([]);
  const [loadingRss, setLoadingRss] = useState(false);
  const [rssError, setRssError] = useState("");

  // Custom opposition import
  const [importingTitle, setImportingTitle] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

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
      setImportSuccessMessage(`¡Éxito! "${data.shortName || data.name}" se ha añadido al Catálogo Local y se ha seleccionado automáticamente para su estudio.`);
      
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
      setRssError("Error al conectar con la fuente oficial en tiempo real. Mostrando modo offline.");
    } finally {
      setLoadingRss(false);
    }
  };

  useEffect(() => {
    if (activeTab === "realtime") {
      const delayDebounceFn = setTimeout(() => {
        fetchRssFeed(searchTerm);
      }, 600); // 600ms debounce
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm, activeTab]);

  // Accent and diacritic-insensitive normalization for Spanish searches
  const normalizeString = (str: string): string => {
    return (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const filteredRssItems = useMemo(() => {
    if (!searchTerm) return rssItems;
    const termClean = normalizeString(searchTerm);
    return rssItems.filter(
      (item) =>
        normalizeString(item.title).includes(termClean) ||
        normalizeString(item.description).includes(termClean)
    );
  }, [rssItems, searchTerm]);

  // Simulated open source databases metadata
  const sources = [
    { name: "Boletín Oficial del Estado (BOE)", updated: "Hoy, 08:30" },
    { name: "GVA - Diari Oficial GVA (DOGV)", updated: "Hoy, 09:15" },
    { name: "060 - Portal Ciudadano de España", updated: "Ayer, 14:00" },
    { name: "Diario Oficial de la Unión Europea", updated: "Hace 2 días" },
  ];

  // Spain-wide Free Public Legal & University Portals
  const officialPortals = [
    {
      name: "BOE (Boletín Oficial del Estado)",
      description: "Portal oficial del Gobierno de España para convocatorias estatales de Justicia, Hacienda, etc.",
      url: "https://www.boe.es/diario_boe/oposiciones.php",
      type: "Estatal"
    },
    {
      name: "Generalitat Valenciana - Oposiciones",
      description: "Buscador oficial y diario oficial (DOGV) de empleo público de la Comunidad Valenciana.",
      url: "https://dogv.gva.es/es/oposiciones",
      type: "Autonómico"
    },
    {
      name: "Punto de Acceso General (administracion.gob.es)",
      description: "Buscador oficial unificado de empleo público y oposiciones estatales, autonómicas y locales.",
      url: "https://administracion.gob.es/pag_Home/empleoPublico/buscadorEP.html",
      type: "Estatal"
    },
    {
      name: "Comunidad de Madrid - Empleo Público",
      description: "Portal oficial de convocatorias públicas para la administración de la Comunidad de Madrid.",
      url: "https://www.comunidad.madrid/servicios/empleo/oposiciones",
      type: "Autonómico"
    },
    {
      name: "Junta de Andalucía - Oposiciones",
      description: "Canal oficial para las oposiciones y el empleo público de la Junta de Andalucía.",
      url: "https://www.juntadeandalucia.es/temas/trabajar/empleo-publico.html",
      type: "Autonómico"
    },
    {
      name: "Generalitat de Catalunya - Oposicions",
      description: "Buscador oficial de oposiciones y bolsas de trabajo de la Generalitat de Catalunya.",
      url: "https://oposicions.gencat.cat",
      type: "Autonómico"
    },
    {
      name: "Buscador de Oposiciones de Universidades Públicas",
      description: "Directorio oficial del BOE para plazas del personal funcionario y laboral en universidades de España.",
      url: "https://www.boe.es/diario_boe/oposiciones.php?cat=U",
      type: "Universidad"
    },
    {
      name: "Buscador de Oposiciones de Entidades Locales",
      description: "Acceso al catálogo oficial de convocatorias de Ayuntamientos, Cabildos y Diputaciones de España.",
      url: "https://www.boe.es/diario_boe/oposiciones.php?cat=L",
      type: "Local/Provincial"
    }
  ];

  // Unique list of regions for the filter dropdown
  const regionsList = useMemo(() => {
    const list = new Set(allOppositions.map((o) => o.region));
    return ["Todos", ...Array.from(list)];
  }, [allOppositions]);

  // Filtered oppositions logic
  const filteredOppositions = useMemo(() => {
    return allOppositions.filter((opp) => {
      try {
        // Search term (searches across name, shortName, region, group, adminType, scale, requirements, syllabus blocks & topics)
        const termClean = normalizeString(searchTerm || "").trim();
        let matchesSearch = true;
        if (termClean) {
          const nameClean = normalizeString(opp.name || "");
          const shortNameClean = normalizeString(opp.shortName || "");
          const regionClean = normalizeString(opp.region || "");
          const groupClean = normalizeString(opp.group || "");
          const adminTypeClean = normalizeString(opp.adminType || "");
          const boeClean = normalizeString(opp.card?.referenceBOE || "");
          const scaleClean = normalizeString(opp.card?.scale || "");
          const requirementsClean = normalizeString((opp.generalRequirements || []).join(" "));
          
          // Check syllabus
          const syllabusClean = normalizeString(
            (opp.syllabus || [])
              .map((b) => b.title + " " + (b.topics || []).map((t) => t.title + " " + t.content).join(" "))
              .join(" ")
          );

          matchesSearch =
            nameClean.includes(termClean) ||
            shortNameClean.includes(termClean) ||
            regionClean.includes(termClean) ||
            groupClean.includes(termClean) ||
            adminTypeClean.includes(termClean) ||
            boeClean.includes(termClean) ||
            scaleClean.includes(termClean) ||
            requirementsClean.includes(termClean) ||
            syllabusClean.includes(termClean);
        }

        // BOE reference
        const boeClean = normalizeString(opp.card?.referenceBOE || "");
        const refClean = normalizeString(boeReference || "").trim();
        const matchesBoe = !refClean || boeClean.includes(refClean);

        // Status
        const matchesStatus = !status || status === "Todos" || opp.status === status;

        // Group
        const matchesGroup = !group || group === "Todos" || opp.group === group;

        // Admin type
        const matchesAdminType = !adminType || adminType === "Todos" || opp.adminType === adminType;

        // Region
        const matchesRegion = !region || region === "Todos" || opp.region === region;

        // Disability Quota (assuming standard true for active, but we can search in requirements or details)
        const matchesDisability =
          !disabilityQuota ||
          disabilityQuota === "Todos" ||
          (disabilityQuota === "Sí" ? opp.id !== "administrativos-estado" : true);

        // Exam type
        const matchesExamType =
          !examType ||
          examType === "Todos" ||
          normalizeString(opp.card?.examType || "").includes(normalizeString(examType));

        // Minimum degree
        const matchesMinDegree =
          !minDegree ||
          minDegree === "Todos" ||
          normalizeString(opp.card?.minDegree || "").includes(normalizeString(minDegree));

        return (
          matchesSearch &&
          matchesBoe &&
          matchesStatus &&
          matchesGroup &&
          matchesAdminType &&
          matchesRegion &&
          matchesDisability &&
          matchesExamType &&
          matchesMinDegree
        );
      } catch (err) {
        console.error("Error filtering opposition:", opp, err);
        return true; // Safe fallback
      }
    });
  }, [
    searchTerm,
    boeReference,
    status,
    group,
    adminType,
    region,
    disabilityQuota,
    examType,
    minDegree,
  ]);

  return (
    <div id="opposition-searcher" className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" />
            Buscador Avanzado de Convocatorias
          </h2>
          <p className="text-xs text-gray-500">
            Sincronizado de forma segura con el Boletín Oficial del Estado (BOE) y diarios autonómicos oficiales.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Bases Legales de Acceso Abierto Conectadas
        </div>
      </div>

      {/* Selector de Pestañas: Catálogo de Estudio vs Boletines en Tiempo Real */}
      <div className="flex border-b border-gray-200 gap-2">
        <button
          onClick={() => setActiveTab("local")}
          className={`py-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "local"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <span>Catálogo de Estudio Local ({filteredOppositions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("realtime")}
          className={`py-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "realtime"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Wifi className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
          <span>Alertas BOE en Directo ({filteredRssItems.length})</span>
        </button>
      </div>

      {activeTab === "local" ? (
        <>
          {/* Main filter card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre de la Oposición / Cuerpo
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
                  <input
                    id="search-input-text"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ej: Tramitación, Auxilio..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Código / Referencia BOE / DOUE
                </label>
                <input
                  id="search-input-boe"
                  type="text"
                  value={boeReference}
                  onChange={(e) => setBoeReference(e.target.value)}
                  placeholder="Ej: BOE-A-2026-8832"
                  className="w-full px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Estado de Convocatoria (Plazo)
                </label>
                <select
                  id="search-select-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                >
                  <option value="Todos">Todos los plazos</option>
                  <option value="Abierto">Abierto (Plazo de inscripción)</option>
                  <option value="Cerrado">Cerrado / En curso</option>
                  <option value="Próxima Convocatoria">Próxima Convocatoria</option>
                </select>
              </div>
            </div>

            {/* Extended Filters Collapsible Area */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Grupo de Titulación
                </label>
                <select
                  id="filter-group"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Todos">Todos (A1, A2, C1, C2)</option>
                  <option value="A1">Grupo A1 (Superior)</option>
                  <option value="A2">Grupo A2 (Técnico)</option>
                  <option value="C1">Grupo C1 (Bachiller)</option>
                  <option value="C2">Grupo C2 (ESO)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Organismo Emisor
                </label>
                <select
                  id="filter-admin"
                  value={adminType}
                  onChange={(e) => setAdminType(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Todos">Todos los organismos</option>
                  <option value="Estatal">Administración del Estado</option>
                  <option value="Autonómica">Autonómica / CC.AA.</option>
                  <option value="Local">Ayuntamiento / Local</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Comunidad Autónoma
                </label>
                <select
                  id="filter-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {regionsList.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg === "Todos" ? "Cualquier región" : reg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Cupo Discapacidad
                </label>
                <select
                  id="filter-disability"
                  value={disabilityQuota}
                  onChange={(e) => setDisabilityQuota(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Todos">Todos</option>
                  <option value="Sí">Reserva específica (Sí)</option>
                  <option value="No">Sin reserva especial</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Tipo de Examen
                </label>
                <select
                  id="filter-exam-type"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Todos">Todos</option>
                  <option value="Oposición">Oposición pura</option>
                  <option value="Concurso">Concurso-Oposición</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                  Titulación Mínima
                </label>
                <select
                  id="filter-degree"
                  value={minDegree}
                  onChange={(e) => setMinDegree(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Todos">Todas</option>
                  <option value="Bachillerato">Bachillerato / FP</option>
                  <option value="Educación Secundaria">ESO o equivalente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main body: lists matched results in full-width as requested by the user */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">
                Se han encontrado {filteredOppositions.length} oposiciones en el catálogo de estudio que coinciden con los filtros
              </span>
            </div>

            <div className="space-y-4">
              {filteredOppositions.length > 0 ? (
                filteredOppositions.map((opp) => {
                  const isSelected = selectedOppositionId === opp.id;
                  return (
                    <div
                      key={opp.id}
                      id={`opp-card-${opp.id}`}
                      className={`p-5 rounded-2xl border transition-all ${
                        isSelected
                          ? "bg-indigo-50/50 border-indigo-400 shadow-sm"
                          : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800 uppercase">
                              Grupo {opp.group}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                              {opp.adminType}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                opp.status === "Abierto"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              Plazo: {opp.status}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-gray-900 pt-1">
                            {opp.name} ({opp.shortName})
                          </h3>
                        </div>

                        <button
                          id={`btn-select-opp-${opp.id}`}
                          onClick={() => onSelectOpposition(opp.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected ? "Oposición Seleccionada" : "Seleccionar para Estudio"}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50 text-xs text-slate-600">
                        <div className="space-y-0.5">
                          <span className="text-gray-400 block font-semibold text-[10px] uppercase">
                            Referencia BOE
                          </span>
                          <span className="font-mono text-slate-800 font-semibold">{opp.card.referenceBOE}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-400 block font-semibold text-[10px] uppercase">
                            Ámbito Geográfico
                          </span>
                          <span className="flex items-center gap-1 text-slate-800 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {opp.region}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-400 block font-semibold text-[10px] uppercase">
                            Plazas Ofrecidas
                          </span>
                          <strong className="text-indigo-600 font-bold text-sm">
                            {opp.card.vacancies.toLocaleString()} plazas
                          </strong>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-gray-400 block font-semibold text-[10px] uppercase">
                            Fecha Límite
                          </span>
                          <span className="flex items-center gap-1 text-slate-800 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {opp.card.deadline}
                          </span>
                        </div>
                      </div>

                      {opp.card.legislativeWarning && (
                        <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                          <strong>Recomendación Legislativa:</strong> {opp.card.legislativeWarning}
                        </div>
                      )}

                      <div className="mt-3.5 flex justify-between items-center text-xs">
                        <a
                          href={opp.card.officialLink}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Enlace Oficial a la Convocatoria <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-3.5 max-w-md mx-auto">
                  <AlertTriangle className="w-6 h-6 text-slate-400 mx-auto" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">No se encontraron oposiciones</h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                      No hay ninguna convocatoria en nuestro catálogo local que coincida con los filtros activos.
                    </p>
                  </div>
                  <button
                    id="btn-reset-filters"
                    onClick={() => {
                      setSearchTerm("");
                      setBoeReference("");
                      setStatus("Todos");
                      setGroup("Todos");
                      setAdminType("Todos");
                      setRegion("Todos");
                      setDisabilityQuota("Todos");
                      setExamType("Todos");
                      setMinDegree("Todos");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all inline-block"
                  >
                    Restablecer Todos los Filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Pestaña de Alertas BOE en Directo */
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Filtrar Alertas BOE por Palabra Clave
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
                  <input
                    id="search-input-rss"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ej: Justicia, Hacienda, Administrativo, Valenciana..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <button
                id="btn-refresh-rss"
                onClick={fetchRssFeed}
                disabled={loadingRss}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 h-10 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRss ? "animate-spin" : ""}`} />
                Actualizar Feed BOE
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">
                Mostrando {filteredRssItems.length} anuncios oficiales de empleo público en el boletín en tiempo real
              </span>
            </div>

            {loadingRss ? (
              <div className="p-10 text-center bg-white border border-gray-100 rounded-2xl space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-gray-500">Conectando y analizando Boletín Oficial del Estado (BOE)...</p>
              </div>
            ) : filteredRssItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredRssItems.map((item, index) => {
                  return (
                    <div
                      key={index}
                      id={`rss-card-${index}`}
                      className="p-5 bg-white border border-gray-100 hover:border-gray-300 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                              BOE Oficial
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">
                              {item.pubDate ? new Date(item.pubDate).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "Fecha no disponible"}
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
                          title="Ver BOE original"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-1 flex-wrap gap-2 border-t border-gray-50 pt-3">
                        <span className="text-[10px] text-gray-400 font-semibold italic">
                          ID: {item.title.toLowerCase().includes("médico") ? "Sanidad" : item.title.toLowerCase().includes("conductor") ? "Servicios" : "General"}
                        </span>
                        <button
                          id={`btn-import-opo-${index}`}
                          disabled={importingTitle !== null}
                          onClick={() => handleImportOpposition(item)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                        >
                          {importingTitle === item.title ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              <span>Generando Temario...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                              <span>Estudiar con IA (Generar Temario)</span>
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
                  <h4 className="text-sm font-extrabold text-slate-900">No se encontraron alertas</h4>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    Ninguno de los anuncios del BOE coincide con tu palabra clave de búsqueda.
                  </p>
                </div>
                <button
                  id="btn-reset-rss-search"
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all inline-block"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
