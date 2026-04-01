import { useState } from "react";

export default function StepExperiments({ data, update, onBack, onNext }) {
  const [bulkInput, setBulkInput] = useState("");

  const parseQuestions = (text) => {
  return text
    .split(/(?<!\d)(?=(?:Q\s*)?\d+[.)]\s*)/i)
    .map((chunk) => chunk.replace(/^(?:Q\s*)?\d+[.)]\s*/i, "").trim())
    .filter(Boolean);
};

  const addExperiments = () => {
    const questions = parseQuestions(bulkInput);
    if (!questions.length) return;
    update({ experiments: [...data.experiments, ...questions.map((name) => ({ name }))] });
    setBulkInput("");
  };

  const removeExperiment = (i) => {
    const exps = [...data.experiments];
    exps.splice(i, 1);
    update({ experiments: exps });
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      addExperiments();
    }
  };

  const previews = parseQuestions(bulkInput);

  return (
    <div className="step-container">
      <div className="step-label">// step_02 › experiment_questions</div>
      <h2 className="step-title">Add your experiments</h2>
      <p className="step-sub">
        Paste all questions numbered (1. 2. 3.) - make sure to enter numbers properly
      </p>

      {/* Textarea with border */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <textarea
          className="exp-input"
          placeholder={`Paste numbered questions, e.g.\n\n1. Write a program to implement bubble sort and analyze its time complexity\n2. Implement a binary search tree with insert and delete operations\n3. Simulate Dijkstra's shortest path algorithm`}
          value={bulkInput}
          onChange={(e) => setBulkInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={6}
          style={{
            width: "100%",
            resize: "vertical",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "inherit",
            fontFamily: "inherit",
            fontSize: "0.9rem",
            lineHeight: "1.7",
            padding: 0,
          }}
        />

        {/* Preview chips */}
        {previews.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "0.7rem", opacity: 0.4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Preview — {previews.length} question{previews.length !== 1 ? "s" : ""} detected
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {previews.map((q, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "6px",
                    background: "rgba(99,179,237,0.08)",
                    border: "1px solid rgba(99,179,237,0.2)",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    fontSize: "0.8rem",
                    maxWidth: "100%",
                  }}
                >
                  <span
                    style={{
                      color: "#63b3ed",
                      fontWeight: 600,
                      minWidth: "20px",
                      fontSize: "0.75rem",
                      paddingTop: "1px",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ opacity: 0.85, lineHeight: "1.4" }}>{q}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Full-width Add all button */}
        <button
          onClick={addExperiments}
          disabled={previews.length === 0}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: previews.length > 0 ? "1px solid rgba(99,179,237,0.4)" : "1px solid rgba(255,255,255,0.08)",
            background: previews.length > 0 ? "rgba(99,179,237,0.12)" : "transparent",
            color: previews.length > 0 ? "#63b3ed" : "rgba(255,255,255,0.25)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: previews.length > 0 ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            letterSpacing: "0.02em",
          }}
        >
          {previews.length > 0
            ? `Add ${previews.length} question${previews.length !== 1 ? "s" : ""} ＋`
            : "Add all ＋"}
        </button>
      </div>

      {/* Already added experiments */}
      {data.experiments.length > 0 && (
        <div className="exp-input-box" style={{ marginTop: "12px" }}>
          {data.experiments.map((exp, i) => (
            <div key={i} className="exp-chip">
              <span className="exp-chip-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="exp-chip-name">{exp.name}</span>
              <button className="exp-chip-del" onClick={() => removeExperiment(i)}>×</button>
            </div>
          ))}
        </div>
      )}

      <div className="exp-counter" style={{ marginTop: "12px" }}>
        <span className="exp-counter-fn">
          generate_experiments(questions, language, project["subject"])
        </span>
        <span> → </span>
        <span className={`exp-count ${data.experiments.length > 0 ? "has-exps" : ""}`}>
          {data.experiments.length} experiments queued
        </span>
      </div>

      <div className="step-actions between">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <button
          className="btn-primary-lg"
          onClick={onNext}
          disabled={data.experiments.length === 0}
        >
          Review &amp; Generate →
        </button>
      </div>
    </div>
  );
}