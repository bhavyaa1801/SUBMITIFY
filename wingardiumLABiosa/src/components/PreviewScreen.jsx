import { useEffect, useState } from "react";

export default function PreviewScreen({ files, onNew }) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch(files.pdf_url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch PDF");
        return res.blob();
      })
      .then((blob) => {
        setPdfBlobUrl(URL.createObjectURL(blob));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });

    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [files.pdf_url]);

  const handleDownload = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = url.split("/").pop();
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      width: "100vw",
      height: isMobile ? "auto" : "100vh",
      minHeight: "100vh",
      background: "#0d0f14",
      overflow: isMobile ? "auto" : "hidden",
    }}>

      {/* ── LEFT: PDF Preview (desktop only) ── */}
      {!isMobile && (
        <div style={{
          flex: 1,
          height: "100%",
          background: "#1a1d24",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
        }}>
          {loading && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
              Loading preview...
            </div>
          )}
          {error && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", flexDirection: "column", gap: 12 }}>
              <span>Preview unavailable</span>
              <a href={files.pdf_url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", fontSize: "0.9rem" }}>
                Open in new tab
              </a>
            </div>
          )}
          {!loading && !error && pdfBlobUrl && (
            <iframe
              src={pdfBlobUrl}
              title="PDF Preview"
              style={{ flex: 1, width: "100%", border: "none" }}
            />
          )}
        </div>
      )}

      {/* ── RIGHT/BOTTOM: Info + Actions ── */}
      <div style={{
        width: isMobile ? "100%" : "380px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: isMobile ? "40px 24px 60px 24px" : "48px 40px",
        gap: 0,
      }}>

        {/* Warning */}
        <p style={{
          color: "#f59e0b",
          fontSize: "0.78rem",
          background: "rgba(245, 158, 11, 0.08)",
          border: "1px solid rgba(245, 158, 11, 0.2)",
          borderRadius: 8,
          padding: "8px 12px",
          marginBottom: 20,
          lineHeight: 1.5,
          width: "100%",
        }}>
          If content is missing or incomplete, click <strong style={{ color: "#fbbf24" }}>Start New File</strong> and regenerate - AI responses may take time to fetch. (NO need to fill details again)
        </p>

        {/* Badge */}
        <div style={{
          background: "rgba(74, 222, 128, 0.12)",
          border: "1px solid rgba(74, 222, 128, 0.3)",
          color: "#4ade80",
          borderRadius: 999,
          padding: "4px 14px",
          fontSize: "0.8rem",
          fontWeight: 600,
          marginBottom: 20,
          letterSpacing: "0.05em",
        }}>
          GENERATED
        </div>

        <h1 style={{
          color: "#fff",
          fontSize: isMobile ? "1.5rem" : "1.8rem",
          fontWeight: 700,
          margin: "0 0 12px 0",
          lineHeight: 1.2,
        }}>
          Your lab file<br />is ready!
        </h1>

        <p style={{
          color: "#888",
          fontSize: "0.95rem",
          margin: "0 0 40px 0",
          lineHeight: 1.6,
        }}>
          {isMobile
            ? "PDF and Word formats available for download."
            : "PDF and Word formats are available. Preview on the left before downloading."}
        </p>

        {/* Mobile — open in browser button */}
        {isMobile && (
          <a
            href={files.pdf_url}
            target="_blank"
            rel="noreferrer"
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(96,165,250,0.1)",
              border: "1px solid rgba(96,165,250,0.3)",
              color: "#60a5fa",
              borderRadius: 8,
              fontSize: "0.95rem",
              fontWeight: 600,
              textAlign: "center",
              textDecoration: "none",
              marginBottom: 12,
              display: "block",
              boxSizing: "border-box",
            }}
          >
            Open PDF in Browser
          </a>
        )}

        {/* Download buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <button
            className="btn-primary-lg"
            onClick={() => handleDownload(files.pdf_url)}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Download PDF
          </button>

          {files.docx_url && (
            <button
              className="btn-secondary-lg"
              onClick={() => handleDownload(files.docx_url)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              Download Word
            </button>
          )}
        </div>

        <div style={{
          width: "100%",
          height: "1px",
          background: "rgba(255,255,255,0.07)",
          margin: "28px 0",
        }} />

        <button
          onClick={onNew}
          className="btn-ghost-lg"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Start New File
        </button>
      </div>
    </div>
  );
}