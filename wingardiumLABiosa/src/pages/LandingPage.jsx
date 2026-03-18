import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingCode from "../components/Floatingcode";
import CursorEffect from "../components/CursorEffect";

const SAMPLE_PDF_URL = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/static/sample.pdf`;

const FEATURES = ["cover_page", "index", "aim", "algorithm", "source_code", "output"];

const HOW_STEPS = [
  { num: "01", title: "Enter details", desc: "College, subject, student name, professor, year and branch" },
  { num: "02", title: "List experiments", color: true, desc: "Add experiment names and aims - as many as you need" },
  { num: "03", title: "AI fills content", desc: "Groq generates algorithm, code, and expected output per experiment" },
  { num: "04", title: "Download PDF / Word File", desc: "Fully formatted, indexed, and ready to print and submit" },
];

const FEATURE_CARDS = [
  { icon: "📄", title: "Cover page", desc: "year, subject, student and professor details with proper formatting" },
  { icon: "📑", title: "Auto index", desc: "contents listing all experiments with page numbers" },
  { icon: "⚙️", title: "Each experiment", desc: "section: aim, algorithm, code, and output - consistent template throughout" },
  { icon: "⚡", title: "Groq powered", desc: "Fast AI generation for algorithms and source code using Groq's ultra-low latency inference" },
  { icon: "📥", title: "Instant PDF", desc: "One-click download. Print-ready A4 layout with proper margins, fonts, and page numbers" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [showSample, setShowSample] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    if (!showSample || pdfBlobUrl) return;
    setPdfLoading(true);
    setPdfError(false);
    fetch(SAMPLE_PDF_URL)
      .then(function(r) {
        if (!r.ok) throw new Error("Failed");
        return r.blob();
      })
      .then(function(blob) {
        setPdfBlobUrl(URL.createObjectURL(blob));
        setPdfLoading(false);
      })
      .catch(function() {
        setPdfError(true);
        setPdfLoading(false);
      });
  }, [showSample]);

  useEffect(() => {
    function handler(e) {
      if (e.key === "Escape") setShowSample(false);
    }
    window.addEventListener("keydown", handler);
    return function() { window.removeEventListener("keydown", handler); };
  }, []);

  return (
    <div className="lp-root">
      <CursorEffect />
      <FloatingCode />

      {showSample && (
        <div
          onClick={function() { setShowSample(false); }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={function(e) { e.stopPropagation(); }}
            style={{
              width: "min(780px, 92vw)",
              height: "88vh",
              background: "#111318",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1rem" }}>📄</span>
                <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>
                  Sample Lab File
                </span>
                <span
                  style={{
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    color: "#4ade80",
                    borderRadius: 999,
                    padding: "2px 10px",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                  }}
                >
                  PREVIEW
                </span>
              </div>
              <button
                onClick={function() { setShowSample(false); }}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#aaa",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                X
              </button>
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              {pdfLoading && (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                    fontSize: "0.9rem",
                    gap: 10,
                  }}
                >
                  Loading sample...
                </div>
              )}

              {pdfError && (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ color: "#f87171", fontSize: "0.9rem" }}>
                    Could not load preview
                  </span>
                  <a
                    href={SAMPLE_PDF_URL}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#60a5fa", fontSize: "0.85rem" }}
                  >
                    Open in new tab
                  </a>
                </div>
              )}

              {!pdfLoading && !pdfError && pdfBlobUrl && (
                <iframe
                  src={pdfBlobUrl}
                  title="Sample PDF"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "0",
                  }}
                />
              )}
            </div>

            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                flexShrink: 0,
              }}
            >
              <a
                href={SAMPLE_PDF_URL}
                download="sample_lab_file.pdf"
                style={{
                  padding: "8px 18px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Download Sample
              </a>
              <button
                className="btn-primary-lg"
                onClick={function() { setShowSample(false); navigate("/create"); }}
                style={{ padding: "8px 18px", fontSize: "0.85rem" }}
              >
                Generate mine
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-tags">
            <span className="lp-tag">● Groq AI</span>
            <span className="lp-tag">● FastAPI</span>
            <span className="lp-tag">● PostgreSQL</span>
          </div>
          <h1 className="lp-headline">
            Generate your <span className="lp-headline-accent">ASSIGNMENTS</span>
            <br />
            in seconds.
          </h1>
          <p className="lp-subtext">
            Enter your college details and experiment list. We write the cover
            page, index, algorithms, source code, and output - formatted and
            print-ready.(For all colleges)
          </p>

          <div className="lp-feature-tags">
            {FEATURES.map(function(f) {
              return <span key={f} className="lp-feature-tag">{f}</span>;
            })}
          </div>

          <div className="lp-hero-actions">
            <button className="btn-primary-lg" onClick={function() { navigate("/create"); }}>
              Generate my file
            </button>
            <button className="btn-ghost-lg" onClick={function() { setShowSample(true); }}>
              View sample PDF
            </button>
          </div>
        </div>
      </section>

      <section className="lp-section" id="how">
        <div className="lp-section-label">// how_it_works</div>
        <h2 className="lp-section-title">Four steps to a complete submission</h2>
        <p className="lp-section-sub">No formatting, no typing - just your details and we handle the rest</p>
        <div className="lp-steps">
          {HOW_STEPS.map(function(s) {
            return (
              <div key={s.num} className="lp-step-card">
                <span className="lp-step-num" style={{ color: "#3b82f6" }}>{s.num}</span>
                <h3 className={s.color ? "lp-step-title accent" : "lp-step-title"}>{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="lp-section" id="templates">
        <div className="lp-section-label">// everything_in_one_file</div>
        <h2 className="lp-section-title">Everything in one file</h2>
        <p className="lp-section-sub">Your lab file, exactly how your professor expects it</p>
        <div className="lp-features-grid">
          {FEATURE_CARDS.map(function(f) {
            return (
              <div key={f.title} className="lp-feature-card">
                <span className="lp-feature-icon">{f.icon}</span>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="lp-cta-banner">
        <div className="lp-cta-content">
          <div>
            <h2 className="lp-cta-title">Ready to stop formatting manually?</h2>
            <p className="lp-cta-sub">Takes less than 5 minutes. No account required to try.</p>
          </div>
          <button className="btn-primary-lg" onClick={function() { navigate("/create"); }}>
            Generate my lab file
          </button>
        </div>
      </section>
    </div>
  );
}