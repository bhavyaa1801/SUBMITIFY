import { useState } from "react";
import StepProjectInfo from "../components/steps/StepProjectInfo";
import StepExperiments from "../components/steps/StepExperiments";
import StepReview from "../components/steps/StepReview";
import GeneratingScreen from "../components/GeneratingScreen";
import PreviewScreen from "../components/PreviewScreen";
import FloatingCode from "../components/Floatingcode";
import CursorEffect from "../components/CursorEffect";
import { generatePDF } from "../services/api";

const STEPS = ["Project info", "Experiments", "Review"];

export default function CreatePage() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState("form"); 
  const [files, setFiles] = useState(null);

  const [formData, setFormData] = useState({
    university: "",
    department: "",
    academic_year: "",
    semester: "",
    subject_name: "",
    subject_code: "",
    course: "",
    student_name: "",
    enrollment_number: "",
    submitted_to: "",
    designation: "",
    language: "",
    logo: null,
    experiments: [],
  });

  const update = (fields) =>
    setFormData((prev) => ({ ...prev, ...fields }));

  const handleGenerate = async () => {
    setStatus("generating");

    const payload = {
      project: {
        university: formData.university,
        year: formData.academic_year,
        department: formData.department,
        subject: formData.subject_name,
        code: formData.subject_code,
        student: formData.student_name,
        roll: formData.enrollment_number,
        course: formData.course,
        semester: formData.semester,
        submitted_to: formData.submitted_to,
        designation: formData.designation,
        logo: formData.logo || null,
      },
      language: formData.language,
      questions: formData.experiments.map((e) => e.name),
    };

    try {
      const result = await generatePDF(payload);
      console.log("API RESULT:", result);

      if (!result?.pdf_url) {
        throw new Error("Invalid response from server");
      }

      setFiles(result);
      setStatus("preview");
    } catch (err) {
      console.error("Generation failed:", err);
      setStatus("form");

      // check for rate limit
      if (err.message.includes("429")) {
        alert("Too many requests — please wait a minute and try again.");
      } else {
        alert("Something went wrong while generating file.");
      }
    }
  };

  //  SCREENS
  if (status === "generating") {
    return <GeneratingScreen />;
  }

  if (status === "preview" && files) {
    return (
      <PreviewScreen
        files={files}
        onNew={() => {
          setStatus("form");
          setStep(0);
          setFiles(null);
        }}
      />
    );
  }

  // 🧾 FORM FLOW
  return (
    <div className="cp-root">
      <CursorEffect />
      <FloatingCode />

      {/* TOP BAR */}
      <div className="cp-topbar">
        <div className="cp-stepper">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`cp-step ${i < step ? "done" : i === step ? "active" : ""
                }`}
            >
              <span className="cp-step-num">
                {i < step ? "✓" : i + 1}
              </span>
              <span className="cp-step-label">{label}</span>
              {i < STEPS.length - 1 && (
                <span className="cp-step-sep">——</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STEP CONTENT */}
      <div className="cp-body">
        <div className="cp-code-bg-subtle" />

        {step === 0 && (
          <StepProjectInfo
            data={formData}
            update={update}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && (
          <StepExperiments
            data={formData}
            update={update}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepReview
            data={formData}
            onBack={() => setStep(1)}
            onGenerate={handleGenerate}
          />
        )}
      </div>
    </div>
  );
}