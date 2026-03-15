import Link from "next/link";

const chapters = [
  {
    n: 1,
    title: "Átomos en Movimiento",
    desc: "Todo lo que existe está hecho de átomos en constante movimiento.",
    route: "/cap1",
    available: true,
    border: "border-blue-700/50 hover:border-blue-400",
    badge: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  },
  {
    n: 2,
    title: "Física Básica",
    desc: "Las tres fuerzas fundamentales que explican toda la materia.",
    route: "/cap2",
    available: false,
    border: "border-[#1a2a4a]/50",
    badge: "text-[#2a3a6a] border-[#1a2a4a] bg-[#0a1020]",
  },
  {
    n: 3,
    title: "Relación con Otras Ciencias",
    desc: "Cómo la física es la base de toda la ciencia.",
    route: "/cap3",
    available: false,
    border: "border-[#1a2a4a]/50",
    badge: "text-[#2a3a6a] border-[#1a2a4a] bg-[#0a1020]",
  },
  {
    n: 4,
    title: "Conservación de Energía",
    desc: "La energía nunca se crea ni se destruye, solo cambia de forma.",
    route: "/cap4",
    available: false,
    border: "border-[#1a2a4a]/50",
    badge: "text-[#2a3a6a] border-[#1a2a4a] bg-[#0a1020]",
  },
  {
    n: 5,
    title: "Teoría de la Gravitación",
    desc: "La fuerza invisible que mantiene el universo unido.",
    route: "/cap5",
    available: false,
    border: "border-[#1a2a4a]/50",
    badge: "text-[#2a3a6a] border-[#1a2a4a] bg-[#0a1020]",
  },
  {
    n: 6,
    title: "Comportamiento Cuántico",
    desc: "Partículas que existen en dos lugares a la vez.",
    route: "/cap6",
    available: false,
    border: "border-[#1a2a4a]/50",
    badge: "text-[#2a3a6a] border-[#1a2a4a] bg-[#0a1020]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#05050f] px-8 py-16">
      <div className="max-w-4xl mx-auto mb-14">
        <p className="text-[#2255aa] text-xs font-mono uppercase tracking-widest mb-3">
          Richard P. Feynman
        </p>
        <h1 className="text-white text-4xl font-light tracking-wide mb-4">
          Seis Piezas Fáciles
        </h1>
        <p className="text-[#2a4a7a] font-mono text-sm max-w-lg">
          Visualizaciones 3D interactivas de los conceptos fundamentales de la física.
          Cada capítulo es un mundo que puedes explorar.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chapters.map((ch) => (
          <div
            key={ch.n}
            className={`rounded-xl border bg-[#080d18] p-6 transition-all duration-200 ${ch.border} ${ch.available ? "cursor-pointer group hover:bg-[#0a1222]" : "opacity-40"}`}
          >
            {ch.available ? (
              <Link href={ch.route} className="block">
                <CardContent ch={ch} />
              </Link>
            ) : (
              <CardContent ch={ch} />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto mt-14 text-center">
        <p className="text-[#0d1a30] font-mono text-xs">feynviz — visualizaciones personales</p>
      </div>
    </main>
  );
}

function CardContent({ ch }: { ch: (typeof chapters)[0] }) {
  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <span className={`text-xs font-mono font-bold px-2 py-1 rounded border ${ch.badge}`}>
          CAP. {ch.n}
        </span>
        {ch.available ? (
          <span className="text-blue-500 font-mono text-[10px] uppercase tracking-widest group-hover:text-blue-300 transition-colors">
            explorar →
          </span>
        ) : (
          <span className="text-[#1a2a4a] font-mono text-[10px] uppercase tracking-widest">
            próximamente
          </span>
        )}
      </div>
      <h2 className="text-white text-sm font-light mb-2 leading-snug">{ch.title}</h2>
      <p className="text-[#2a4060] font-mono text-xs leading-relaxed">{ch.desc}</p>
    </>
  );
}
