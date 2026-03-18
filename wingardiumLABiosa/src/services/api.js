const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function generateExperiments(payload) {
  const res = await fetch(`${BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { experiments: [...] }
}

// export async function generateAndDownloadPDF(payload) {
//   const res = await fetch(`${BASE_URL}/api/generate-pdf`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
//   if (!res.ok) throw new Error(await res.text());

//   const blob = await res.blob();
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "practical_file.pdf";
//   a.click();
//   URL.revokeObjectURL(url);
// }

export async function generatePDF(payload) {
  const res = await fetch(`${BASE_URL}/api/generate-pdf`, {  // ✅ FIX THIS
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  console.log("Response status:", res.status); // 👈 debug

  if (!res.ok) {
    const text = await res.text();
    console.error("Backend error:", text);
    throw new Error("Failed");
  }

  const data = await res.json();
  console.log("DATA:", data); // 👈 debug

  return data;
}