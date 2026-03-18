import { useState } from "react";

export default function StepReview({ data, onBack, onGenerate }) {
  const [loading, setLoading] = useState(false);

  const fields = [
    ["university", data.university],
    ["department", data.department],
    ["academic_year", data.academic_year],
    ["semester", data.semester],
    ["subject", data.subject_name],
    ["subject_code", data.subject_code],
    ["course", data.course],
    ["student", data.student_name],
    ["enrollment_no", data.enrollment_number],
    ["submitted_to", data.submitted_to],
    ["designation", data.designation],
    ["language", `"${data.language}"`],
  ];

  const handleClick = async () => {
    setLoading(true);
    try {
      await onGenerate(); // 👈 parent handles API + screen switch
    } catch (e) {
      console.error(e);
      setLoading(false); // fallback if parent fails
    }
  };

  return (
    <div className="step-container">
      <div className="step-label">// step_04 › review</div>
      <h2 className="step-title">Review before generating</h2>
      <p className="step-sub">
        Confirm everything looks right — Groq will generate your full lab file
      </p>

      {/* PROJECT */}
      <div className="review-box">
        <div className="review-section-label">
          <span className="form-section-bullet">▸</span> project
        </div>
        <div className="review-table">
          {fields.map(([key, val]) => (
            <div key={key} className="review-row">
              <span className="review-key">{key}</span>
              <span className="review-val">
                {val || <span className="review-empty">—</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* EXPERIMENTS */}
      <div className="review-box" style={{ marginTop: 16 }}>
        <div className="review-section-label">
          <span className="form-section-bullet">▸</span> experiments
        </div>
        <div className="review-exp-chips">
          {data.experiments.map((e, i) => (
            <span key={i} className="review-exp-chip">
              exp_{String(i + 1).padStart(2, "0")}: {e.name}
            </span>
          ))}
          {data.experiments.length === 0 && (
            <span className="review-empty">No experiments added</span>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="step-actions between">
        <button
          className="btn-ghost"
          onClick={onBack}
          disabled={loading}
        >
          ← Back
        </button>

        <button
          className="btn-generate"
          onClick={handleClick}
          disabled={loading || data.experiments.length === 0}
          style={{ minWidth: 180 }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Generating...
            </span>
          ) : (
            "⚡ Generate lab file"
          )}
        </button>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}