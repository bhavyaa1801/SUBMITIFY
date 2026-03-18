import { useState } from "react";

export default function StepProjectInfo({ data, update, onNext }) {
  const [logoPreview, setLogoPreview] = useState(data.logo || null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update({ logo: reader.result });
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const languages = [
    "C", "C++", "Java", "Python", "JavaScript",
    "TypeScript", "SQL", "R", "MATLAB", "Other"
  ];

  return (
    <div className="step-container">
      <div className="step-label">// step_01 › project_information</div>
      <h2 className="step-title">Enter project details</h2>
      <p className="step-sub">These appear on your cover page and index</p>

      <form onSubmit={handleSubmit} className="step-form">
        {/* Institution */}
        <div className="form-section">
          <div className="form-section-label">
            <span className="form-section-bullet">▸</span> institution
          </div>

          {/* Logo upload — full width row */}
          <div className="form-row">
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label>college_logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogo}
                style={{ display: "none" }}
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  padding: "10px 14px",
                  border: logoPreview
                    ? "1px solid rgba(99,179,237,0.3)"
                    : "1px dashed rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  background: logoPreview
                    ? "rgba(99,179,237,0.05)"
                    : "transparent",
                  transition: "all 0.2s",
                }}
              >
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="logo preview"
                      style={{ height: 40, borderRadius: 4, objectFit: "contain" }}
                    />
                    <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>
                      click to change
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: "0.85rem", opacity: 0.45 }}>
                    ⬆ Upload college logo (PNG / JPG)
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>university</label>
              <input
                placeholder="your university name"
                value={data.university}
                onChange={(e) => update({ university: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>department</label>
              <input
                placeholder="e.g. Computer Science & Engineering"
                value={data.department}
                onChange={(e) => update({ department: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>academic_year</label>
              <input
                placeholder="e.g. 2024-25"
                value={data.academic_year}
                onChange={(e) => update({ academic_year: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>semester</label>
              <select
                value={data.semester}
                onChange={(e) => update({ semester: e.target.value })}
              >
                <option value="">Select semester</option>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <option key={n} value={n}>
                    {n}{["st","nd","rd","th","th","th","th","th"][n-1]} Semester
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="form-section">
          <div className="form-section-label">
            <span className="form-section-bullet">▸</span> subject
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>subject_name</label>
              <input
                placeholder="e.g. Data Structures Lab"
                value={data.subject_name}
                onChange={(e) => update({ subject_name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>subject_code</label>
              <input
                placeholder="e.g. KCS451"
                value={data.subject_code}
                onChange={(e) => update({ subject_code: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>course</label>
              <input
                placeholder="e.g. B.Tech"
                value={data.course}
                onChange={(e) => update({ course: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>select language</label>
              <select
                value={data.language}
                onChange={(e) => update({ language: e.target.value })}
              >
                <option value="">Select language</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student & Faculty */}
        <div className="form-section">
          <div className="form-section-label">
            <span className="form-section-bullet">▸</span> student &amp; faculty
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>student_name</label>
              <input
                placeholder="Full name"
                value={data.student_name}
                onChange={(e) => update({ student_name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>enrollment_number</label>
              <input
                placeholder="e.g. 2200601520001"
                value={data.enrollment_number}
                onChange={(e) => update({ enrollment_number: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>submitted_to</label>
              <input
                placeholder="Prof. / Dr. Full Name"
                value={data.submitted_to}
                onChange={(e) => update({ submitted_to: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label>designation</label>
              <input
                placeholder="e.g. Assistant Professor"
                value={data.designation}
                onChange={(e) => update({ designation: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="step-actions right">
          <button type="submit" className="btn-primary-lg">Next →</button>
        </div>
      </form>
    </div>
  );
}