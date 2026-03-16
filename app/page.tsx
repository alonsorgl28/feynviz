import Link from "next/link";
import HeroSimulation from "@/components/homepage/HeroSimulation";

const chapters = [
  {
    n: 1,
    title: "Átomos en Movimiento",
    desc: "Todo lo que existe está hecho de átomos en constante movimiento.",
    route: "/cap1",
    available: true,
  },
  {
    n: 2,
    title: "Física Básica",
    desc: "Las tres fuerzas fundamentales que explican toda la materia.",
    route: "/cap2",
    available: false,
  },
  {
    n: 3,
    title: "Relación con Otras Ciencias",
    desc: "Cómo la física es la base de toda la ciencia.",
    route: "/cap3",
    available: false,
  },
  {
    n: 4,
    title: "Conservación de Energía",
    desc: "La energía nunca se crea ni se destruye, solo cambia de forma.",
    route: "/cap4",
    available: false,
  },
  {
    n: 5,
    title: "Teoría de la Gravitación",
    desc: "La fuerza invisible que mantiene el universo unido.",
    route: "/cap5",
    available: false,
  },
  {
    n: 6,
    title: "Comportamiento Cuántico",
    desc: "Partículas que existen en dos lugares a la vez.",
    route: "/cap6",
    available: false,
  },
];

export default function Home() {
  return (
    <main className="bg-[#0b0b0b] text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <HeroSimulation />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,11,11,0.5)_50%,rgba(11,11,11,0.85)_100%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-mono text-[#4da3ff]/70 text-xs uppercase tracking-[0.25em] mb-6">
            Richard P. Feynman · Six Easy Pieces
          </p>
          <h1
            className="text-[clamp(52px,8vw,88px)] font-semibold leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Visualiza la física<br />
            <span className="text-[#4da3ff]">de Feynman</span> en 3D
          </h1>
          <p
            className="text-[#b0b0b0] text-lg leading-relaxed max-w-xl mx-auto mb-10"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Una edición interactiva de <em>Six Easy Pieces</em> donde cada
            capítulo es una simulación que puedes explorar, manipular y entender.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/cap1"
              className="px-7 py-3.5 rounded-xl bg-[#4da3ff] text-[#0b0b0b] font-semibold text-sm hover:bg-[#6bb5ff] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Explorar Capítulo 1 →
            </Link>
            <a
              href="#chapters"
              className="px-7 py-3.5 rounded-xl border border-white/15 text-[#b0b0b0] text-sm hover:border-white/30 hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Ver capítulos ↓
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20">
          <div className="w-px h-12 bg-white/40 mx-auto" />
        </div>
      </section>

      {/* ── FEATURED CHAPTER ── */}
      <section className="px-6 py-36 max-w-5xl mx-auto">
        <p className="font-mono text-[#4da3ff] text-xs uppercase tracking-[0.2em] mb-14 text-center">
          Capítulo Destacado
        </p>

        <Link href="/cap1" className="group block">
          <div className="relative rounded-2xl border border-[#1a2a4a] bg-gradient-to-br from-[#0d1525] to-[#080d18] p-10 md:p-14 overflow-hidden hover:border-[#4da3ff]/40 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#4da3ff]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-lg">
                <span className="inline-block font-mono text-[#4da3ff] text-xs uppercase tracking-[0.2em] border border-[#4da3ff]/30 bg-[#4da3ff]/10 px-3 py-1 rounded-full mb-6">
                  Cap. 1
                </span>
                <h2
                  className="text-[clamp(32px,5vw,52px)] font-semibold leading-tight mb-4"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Átomos en Movimiento
                </h2>
                <p
                  className="text-[#808080] text-base leading-relaxed mb-8"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Todo lo que existe está hecho de átomos en constante movimiento.
                  Explora cómo la temperatura, los estados de la materia y las
                  reacciones químicas emergen de este principio simple.
                </p>
                <span
                  className="inline-flex items-center gap-2 text-[#4da3ff] text-sm font-medium group-hover:gap-3 transition-all"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Explorar simulación <span className="text-lg">→</span>
                </span>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                {["Hipótesis Atómica", "Molécula H₂O", "Tres Estados", "Reacción química", "Sal en Agua"].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#0a1525]/80 border border-[#1a2a4a] rounded-lg px-4 py-2">
                    <span className="w-5 h-5 rounded-full bg-[#4da3ff]/15 border border-[#4da3ff]/30 flex items-center justify-center font-mono text-[9px] text-[#4da3ff]">{i + 1}</span>
                    <span className="font-mono text-[11px] text-[#405060]">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ── CÓMO FUNCIONA — editorial, no cards ── */}
      <section className="px-6 py-36 max-w-5xl mx-auto">
        <p className="font-mono text-[#4da3ff] text-xs uppercase tracking-[0.2em] mb-5 text-center">
          Cómo funciona
        </p>
        <h2
          className="text-center font-semibold mb-20"
          style={{ fontFamily: "var(--font-heading)", fontSize: "40px" }}
        >
          El método Feynman, visualizado
        </h2>

        {/* 3-column editorial layout — no borders, no backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            {
              n: "01",
              title: "Lee la idea",
              desc: "Una frase de Feynman introduce el concepto.",
            },
            {
              n: "02",
              title: "Mírala en acción",
              desc: "Una simulación 3D muestra el fenómeno.",
            },
            {
              n: "03",
              title: "Explora",
              desc: "Manipula variables y descubre la física.",
            },
          ].map((step) => (
            <div key={step.n}>
              <p
                className="text-[#4da3ff] text-sm mb-4"
                style={{ letterSpacing: "0.1em", fontFamily: "var(--font-mono)" }}
              >
                {step.n}
              </p>
              <h3
                className="text-white font-semibold mb-3"
                style={{ fontFamily: "var(--font-heading)", fontSize: "24px" }}
              >
                {step.title}
              </h3>
              <p
                className="text-[#b0b0b0] leading-relaxed max-w-[280px]"
                style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHAPTER LIBRARY ── */}
      <section id="chapters" className="px-6 py-36 max-w-5xl mx-auto">
        <p className="font-mono text-[#4da3ff] text-xs uppercase tracking-[0.2em] mb-5 text-center">
          Capítulos
        </p>
        <h2
          className="text-center font-semibold mb-4"
          style={{ fontFamily: "var(--font-heading)", fontSize: "40px" }}
        >
          Six Easy Pieces
        </h2>
        <p
          className="text-center text-[#b0b0b0] mb-20 max-w-lg mx-auto"
          style={{ fontFamily: "var(--font-body)", fontSize: "18px" }}
        >
          Seis ideas fundamentales de la física, cada una con su propia simulación interactiva.
        </p>

        {/* Cap. 1 — available, inline featured row */}
        <Link href="/cap1" className="group block mb-0">
          <div className="flex items-center justify-between py-8 border-b border-white/[0.08] hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex items-baseline gap-6">
              <span className="font-mono text-[#4da3ff] text-xs uppercase tracking-[0.2em] opacity-60 w-12 shrink-0">
                Cap. 1
              </span>
              <div>
                <h3
                  className="text-white font-medium mb-1"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "22px" }}
                >
                  Átomos en Movimiento
                </h3>
                <p
                  className="text-[#b0b0b0]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
                >
                  Todo lo que existe está hecho de átomos en constante movimiento.
                </p>
              </div>
            </div>
            <span
              className="text-[#4da3ff] text-sm shrink-0 ml-6 group-hover:translate-x-1 transition-transform"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Explorar →
            </span>
          </div>
        </Link>

        {/* Caps. 2–6 — upcoming, vertical list */}
        {chapters.slice(1).map((ch) => (
          <div
            key={ch.n}
            className="flex items-center justify-between py-8 border-b border-white/[0.08] opacity-40 cursor-default"
          >
            <div className="flex items-baseline gap-6">
              <span className="font-mono text-[#b0b0b0] text-xs uppercase tracking-[0.2em] opacity-60 w-12 shrink-0">
                Cap. {ch.n}
              </span>
              <div>
                <h3
                  className="text-white font-medium mb-1"
                  style={{ fontFamily: "var(--font-heading)", fontSize: "22px" }}
                >
                  {ch.title}
                </h3>
                <p
                  className="text-[#b0b0b0]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
                >
                  {ch.desc}
                </p>
              </div>
            </div>
            <span
              className="font-mono text-[#404040] text-xs uppercase tracking-[0.15em] shrink-0 ml-6"
            >
              Próximamente
            </span>
          </div>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] px-6 py-14">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p
              className="text-white font-semibold text-sm mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              FeynViz
            </p>
            <p
              className="text-[#404040] text-sm"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Una reinterpretación interactiva de la física de Richard Feynman.
            </p>
          </div>
          <p className="text-[#2a2a2a] font-mono text-xs">
            Inspirado en <em>Six Easy Pieces</em>
          </p>
        </div>
      </footer>

    </main>
  );
}
