import { useEffect, useState } from "react";

const GEN_STEPS = [
  "Building cover page...",
  "Building index page...",
  "Calling generate_experiments()...",
  "Writing experiment pages...",
  "Formatting PDF...",
  "Done!",
];

export function GeneratingScreen() {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleSteps(i);
      if (i >= GEN_STEPS.length) clearInterval(interval);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gen-screen">
      <div className="gen-code-bg" />
      <div className="gen-card">
        <div className="gen-spinner" />
        <h2 className="gen-title">Generating your lab file...</h2>
        <p className="gen-sub">
          Groq is writing aim, algorithm, source code, and output for each experiment
        </p>
        <div className="gen-log">
          {GEN_STEPS.slice(0, visibleSteps).map((s, i) => (
            <div key={i} className="gen-log-line">
              <span className="gen-arrow">→</span>{" "}
              <span className={s === "Done!" ? "gen-done" : "gen-step"}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DoneScreen({ url, onNew }) {
  return (
    <div className="gen-screen">
      <div className="gen-code-bg" />
      <div className="gen-card">
        <div className="done-check">✓</div>
        <h2 className="gen-title">Lab file is ready!</h2>
        <p className="gen-sub">
          Your complete submission PDF has been generated with cover page, index, and all experiments formatted.
        </p>
        <div className="done-actions">
          <a
            className="btn-primary-lg"
            href={url || "#"}
            download="lab_file.pdf"
          >
            ↓ Download PDF
          </a>
          <button className="btn-ghost-lg" onClick={onNew}>
            Start new file
          </button>
        </div>
      </div>
    </div>
  );
}


export default GeneratingScreen;