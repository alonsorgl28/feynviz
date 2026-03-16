import Link from "next/link";
import HeroSimulation from "@/components/homepage/HeroSimulation";
import IntroOverlay from "@/components/homepage/IntroOverlay";

const chapters = [
  {
    n: 1,
    title: "Atoms in Motion",
    desc: "Everything that exists is made of atoms in constant motion.",
    route: "/cap1",
    available: true,
  },
  {
    n: 2,
    title: "Basic Physics",
    desc: "The three fundamental forces that explain all matter.",
    route: "/cap2",
    available: false,
  },
  {
    n: 3,
    title: "The Relation of Physics to Other Sciences",
    desc: "How physics is the foundation of all science.",
    route: "/cap3",
    available: false,
  },
  {
    n: 4,
    title: "Conservation of Energy",
    desc: "Energy is never created nor destroyed — only transformed.",
    route: "/cap4",
    available: false,
  },
  {
    n: 5,
    title: "The Theory of Gravitation",
    desc: "The invisible force that holds the universe together.",
    route: "/cap5",
    available: false,
  },
  {
    n: 6,
    title: "Quantum Behavior",
    desc: "Particles that can exist in two places at once.",
    route: "/cap6",
    available: false,
  },
];

export default function Home() {
  return (
    <main className="text-white overflow-x-hidden" style={{ position: "relative", zIndex: 2, background: "rgba(11,11,11,0.55)" }}>

      <HeroSimulation />
      <IntroOverlay />

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center"
        style={{ paddingTop: "120px", paddingBottom: "170px", minHeight: "100svh" }}
      >

        <div className="relative z-10 mx-auto px-8" style={{ maxWidth: "980px" }}>
          <p
            className="font-mono text-[#4da3ff] uppercase mb-6"
            style={{ fontSize: "11px", letterSpacing: "0.28em", opacity: 0.65 }}
          >
            Richard P. Feynman · Six Easy Pieces
          </p>
          <h1
            className="font-bold text-white mb-0"
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(56px, 8vw, 96px)",
              lineHeight: 0.96,
              letterSpacing: "-0.04em",
              marginBottom: "24px",
            }}
          >
            Visualize Feynman's<br />
            <span style={{ color: "#4da3ff" }}>physics</span> in 3D
          </h1>
          <p
            className="mx-auto"
            style={{
              fontFamily: "var(--font-body)",
              maxWidth: "700px",
              fontSize: "20px",
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.72)",
              marginBottom: "40px",
            }}
          >
            An interactive edition of <em>Six Easy Pieces</em> where each
            chapter becomes a simulation you can explore, manipulate, and understand.
          </p>
          <div className="flex items-center justify-center flex-wrap" style={{ gap: "14px" }}>
            <Link
              href="/cap1"
              className="hover:opacity-90 transition-opacity"
              style={{
                fontFamily: "var(--font-body)",
                background: "#4da3ff",
                color: "#0b0b0b",
                fontWeight: 600,
                fontSize: "15px",
                padding: "13px 28px",
                borderRadius: "100px",
              }}
            >
              Explore Chapter 1 →
            </Link>
            <a
              href="#chapters"
              className="hover:text-white transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                color: "rgba(255,255,255,0.6)",
                fontSize: "15px",
                padding: "13px 20px",
                textDecoration: "none",
              }}
            >
              View chapters ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURED CHAPTER ── */}
      <section style={{ paddingTop: "104px", paddingBottom: "104px", paddingLeft: "32px", paddingRight: "32px" }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <p
            className="font-mono uppercase text-center"
            style={{ fontSize: "11px", letterSpacing: "0.24em", color: "#4da3ff", opacity: 0.6, marginBottom: "24px" }}
          >
            Featured Chapter
          </p>

          <Link href="/cap1" className="group block" style={{ maxWidth: "960px", margin: "0 auto" }}>
            <div
              className="relative overflow-hidden transition-all duration-300"
              style={{
                padding: "48px 48px 42px",
                borderRadius: "24px",
                border: "1px solid rgba(88,140,255,0.18)",
                background: "radial-gradient(circle at top right, rgba(43,90,255,0.18), transparent 40%), linear-gradient(180deg, rgba(9,17,34,0.95), rgba(7,12,24,0.95))",
                boxShadow: "0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <div className="relative z-10">
                <span
                  className="inline-block font-mono uppercase"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.2em",
                    color: "#4da3ff",
                    border: "1px solid rgba(77,163,255,0.3)",
                    background: "rgba(77,163,255,0.08)",
                    padding: "5px 14px",
                    borderRadius: "100px",
                    marginBottom: "16px",
                  }}
                >
                  Cap. 1
                </span>
                <h2
                  className="font-bold"
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(38px, 5vw, 64px)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.04em",
                    marginBottom: "20px",
                  }}
                >
                  Atoms in Motion
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    maxWidth: "720px",
                    fontSize: "21px",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.74)",
                    marginBottom: "28px",
                  }}
                >
                  Everything that exists is made of atoms in constant motion.
                  Explore how temperature, states of matter, and chemical
                  reactions emerge from this single simple idea.
                </p>

                <div className="flex flex-wrap" style={{ gap: "10px", marginBottom: "32px" }}>
                  {["Atomic Hypothesis", "H₂O Molecule", "Three States", "Chemical Reaction", "Salt in Water"].map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center"
                      style={{
                        gap: "8px",
                        background: "rgba(10,21,37,0.8)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "100px",
                        padding: "7px 16px",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#4da3ff" }}>{i + 1}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{s}</span>
                    </div>
                  ))}
                </div>

                <span
                  className="inline-flex items-center group-hover:gap-3 transition-all"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "#4da3ff",
                    fontSize: "15px",
                    fontWeight: 500,
                    gap: "10px",
                  }}
                >
                  Explore simulation <span style={{ fontSize: "18px" }}>→</span>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 32px" }} />

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ paddingTop: "104px", paddingBottom: "104px", paddingLeft: "32px", paddingRight: "32px" }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto 56px", textAlign: "center" }}>
            <p
              className="font-mono uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.24em", color: "#4da3ff", opacity: 0.6, marginBottom: "12px" }}
            >
              How it works
            </p>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(34px, 4vw, 52px)",
                lineHeight: 1.04,
                letterSpacing: "-0.035em",
                fontWeight: 650,
              }}
            >
              The Feynman method, visualized
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "28px" }}>
            {[
              { n: "01", title: "Read the idea", desc: "A line from Feynman introduces the core concept of the chapter." },
              { n: "02", title: "See it in action", desc: "A 3D simulation shows the physical phenomenon in real time." },
              { n: "03", title: "Explore", desc: "Manipulate variables and discover the physics yourself." },
            ].map((step) => (
              <div
                key={step.n}
                style={{
                  padding: "28px 28px 32px",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  minHeight: "220px",
                }}
              >
                <p
                  className="font-mono uppercase"
                  style={{ fontSize: "13px", letterSpacing: "0.18em", color: "rgba(94,146,255,0.78)", marginBottom: "18px" }}
                >
                  {step.n}
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "24px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                    marginBottom: "12px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "17px",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 32px" }} />

      {/* ── CHAPTER LIBRARY ── */}
      <section id="chapters" style={{ paddingTop: "104px", paddingBottom: "104px", paddingLeft: "32px", paddingRight: "32px" }}>
        <div style={{ maxWidth: "1120px", margin: "0 auto" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto 64px", textAlign: "center" }}>
            <p
              className="font-mono uppercase"
              style={{ fontSize: "11px", letterSpacing: "0.24em", color: "#4da3ff", opacity: 0.6, marginBottom: "12px" }}
            >
              Chapters
            </p>
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(34px, 4vw, 56px)",
                lineHeight: 1.04,
                letterSpacing: "-0.035em",
                fontWeight: 650,
                marginBottom: "16px",
              }}
            >
              Six Easy Pieces
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "19px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              Six fundamental ideas in physics, each with its own interactive simulation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "28px" }}>
            {/* Cap. 1 — available */}
            <Link href="/cap1" className="group block">
              <div
                className="transition-all duration-200 group-hover:-translate-y-[3px]"
                style={{
                  padding: "30px 30px 34px",
                  borderRadius: "22px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  minHeight: "240px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    className="font-mono uppercase"
                    style={{ fontSize: "12px", letterSpacing: "0.18em", opacity: 0.6, marginBottom: "14px" }}
                  >
                    Cap. 1
                  </p>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "32px",
                      lineHeight: 1.08,
                      letterSpacing: "-0.035em",
                      marginBottom: "14px",
                    }}
                  >
                    Atoms in Motion
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "17px",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.7)",
                      maxWidth: "34ch",
                    }}
                  >
                    Everything that exists is made of atoms in constant motion.
                  </p>
                </div>
                <p
                  className="group-hover:gap-3 transition-all inline-flex items-center"
                  style={{ fontFamily: "var(--font-body)", color: "#4da3ff", fontSize: "15px", fontWeight: 500, gap: "8px", marginTop: "28px" }}
                >
                  Explore →
                </p>
              </div>
            </Link>

            {/* Caps. 2–6 — upcoming */}
            {chapters.slice(1).map((ch) => (
              <div
                key={ch.n}
                style={{
                  padding: "30px 30px 34px",
                  borderRadius: "22px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  minHeight: "240px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: 0.78,
                }}
              >
                <div>
                  <p
                    className="font-mono uppercase"
                    style={{ fontSize: "12px", letterSpacing: "0.18em", opacity: 0.6, marginBottom: "14px" }}
                  >
                    Cap. {ch.n}
                  </p>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "32px",
                      lineHeight: 1.08,
                      letterSpacing: "-0.035em",
                      marginBottom: "14px",
                    }}
                  >
                    {ch.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "17px",
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.7)",
                      maxWidth: "34ch",
                    }}
                  >
                    {ch.desc}
                  </p>
                </div>
                <p
                  className="font-mono uppercase"
                  style={{ fontSize: "12px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginTop: "28px" }}
                >
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between"
          style={{ maxWidth: "1120px", margin: "0 auto", padding: "88px 32px 56px", gap: "16px" }}
        >
          <div>
            <p
              className="font-semibold"
              style={{ fontFamily: "var(--font-heading)", fontSize: "15px", marginBottom: "6px" }}
            >
              FeynViz
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                color: "rgba(255,255,255,0.3)",
                maxWidth: "520px",
              }}
            >
              An interactive reinterpretation of Richard Feynman's physics.
            </p>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "rgba(255,255,255,0.15)" }}>
            Inspired by <em>Six Easy Pieces</em>
          </p>
        </div>
      </footer>

    </main>
  );
}
