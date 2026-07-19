import { useState, FormEvent } from "react";
import { ForumPost } from "../types";
import { Users, MessageSquare, ThumbsUp, Calendar, Send, Filter, AlertCircle } from "lucide-react";

export default function ForumComponent() {
  const [activeCategory, setActiveCategory] = useState<"all" | "general" | "auxilio" | "tramitacion" | "tecnicas">("all");
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: "post-1",
      title: "Análisis del RDL 6/2023: ¿Qué plazos digitales entran en juego?",
      content: "Buenas compañeros. He estado analizando los cambios del Real Decreto-ley 6/2023 de Eficiencia Digital. Creo que la clave estará en la obligatoriedad de la Sede Judicial Electrónica y las notificaciones telemáticas. ¿Alguien tiene esquemas de plazos?",
      author: "OpositorPro88",
      date: "2026-07-15",
      category: "tramitacion",
      likes: 12,
      replies: [
        { author: "AuxiliarJust", content: "¡Muchas gracias! Sí, la verdad que el tema de las comparecencias telemáticas tiene pinta de caer sí o sí.", date: "2026-07-16" },
        { author: "Legislador20", content: "Recuerda que el RDL 6/2023 también afecta a la Ley de Enjuiciamiento Criminal. Ojo con eso.", date: "2026-07-17" },
      ],
    },
    {
      id: "post-2",
      title: "Consejos para el examen de mecanografía / ofimática",
      content: "Hola a todos. Es mi primera convocatoria y me aterroriza el examen práctico de Tramitación Procesal. ¿Qué programas o test de velocidad recomendáis para prepararlo desde casa gratis?",
      author: "MecaOpo",
      date: "2026-07-14",
      category: "tecnicas",
      likes: 8,
      replies: [
        { author: "TutorIA", content: "Intenta hacer sesiones diarias de 15 minutos en portales open source como KLAVARO. La regularidad es todo.", date: "2026-07-15" },
      ],
    },
    {
      id: "post-3",
      title: "Calendario previsto de exámenes - Auxilio Judicial",
      content: "Se rumorea en los sindicatos que el primer ejercicio de Auxilio se retrasará a finales de año debido al volumen de instancias. ¿Hay confirmación en el BOE?",
      author: "JusticiaFirme",
      date: "2026-07-10",
      category: "auxilio",
      likes: 15,
      replies: [],
    },
  ]);

  // Adding post state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"general" | "auxilio" | "tramitacion" | "tecnicas">("general");

  // Reply state
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title: newTitle,
      content: newContent,
      author: "EstudianteAnonimo",
      date: new Date().toISOString().split("T")[0],
      category: newCategory,
      likes: 0,
      replies: [],
    };

    setPosts([newPost, ...posts]);
    setNewTitle("");
    setNewContent("");
  };

  const handleAddReply = (postId: string) => {
    if (!replyText) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            replies: [
              ...p.replies,
              {
                author: "EstudianteAnonimo",
                content: replyText,
                date: new Date().toISOString().split("T")[0],
              },
            ],
          };
        }
        return p;
      })
    );
    setReplyText("");
  };

  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, likes: p.likes + 1 };
        }
        return p;
      })
    );
  };

  const filteredPosts = posts.filter(
    (p) => activeCategory === "all" || p.category === activeCategory
  );

  return (
    <div id="forum-component" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Foro de Discusión General & Específico
          </h2>
          <p className="text-xs text-gray-500">
            Comparte dudas legislativas, comentarios de plazos y técnicas de estudio con otros opositores de forma privada.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filter categories column */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wide text-gray-400 block">
              Filtrar por Categoría
            </span>

            <div className="space-y-1">
              {[
                { id: "all", label: "Todos los temas" },
                { id: "general", label: "Foro Común General" },
                { id: "auxilio", label: "Grupo C2 - Auxilio Judicial" },
                { id: "tramitacion", label: "Grupo C1 - Tramitación Procesal" },
                { id: "tecnicas", label: "Técnicas de Estudio" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  id={`btn-forum-cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-indigo-50 text-indigo-800 font-bold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Discussions posts list */}
        <div className="lg:col-span-9 space-y-6">
          {/* Create post form */}
          <form
            id="form-create-forum-post"
            onSubmit={handleCreatePost}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4"
          >
            <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              Publicar una nueva consulta o sugerencia
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                id="forum-input-title"
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título descriptivo de la duda..."
                className="sm:col-span-2 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <select
                id="forum-select-cat"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="general">Foro Común General</option>
                <option value="auxilio">Auxilio Judicial (C2)</option>
                <option value="tramitacion">Tramitación Procesal (C1)</option>
                <option value="tecnicas">Técnicas de Estudio</option>
              </select>
            </div>

            <textarea
              id="forum-input-content"
              required
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Describa su duda técnica o plazos legislativos para debatir..."
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
            />

            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-medium leading-none">
                La publicación es anónima para resguardar la privacidad del estudiante.
              </span>
              <button
                id="btn-submit-forum-post"
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Publicar en Foro
              </button>
            </div>
          </form>

          {/* Posts list */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 uppercase font-bold tracking-wider">
                      {post.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 pt-1">{post.title}</h4>
                    <div className="flex gap-4 text-[10px] text-slate-400 font-medium">
                      <span>Por: {post.author}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.date}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`btn-like-post-${post.id}`}
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-xs text-slate-500 font-semibold cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>{post.likes}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">{post.content}</p>

                {/* Replies trigger */}
                <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                  <button
                    id={`btn-toggle-replies-${post.id}`}
                    onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Ver comentarios ({post.replies.length})
                  </button>
                </div>

                {/* Replies detail panel */}
                {activePostId === post.id && (
                  <div className="pl-4 border-l-2 border-slate-100 space-y-4 pt-2 animate-fade-in">
                    {post.replies.map((rep, rIdx) => (
                      <div key={rIdx} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 text-xs space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                          <span>{rep.author}</span>
                          <span>{rep.date}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-sans">{rep.content}</p>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <input
                        id={`reply-input-${post.id}`}
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribe una sugerencia o respuesta de ley..."
                        className="flex-1 px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                      />
                      <button
                        id={`btn-send-reply-${post.id}`}
                        onClick={() => handleAddReply(post.id)}
                        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
