export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Swingalyze</h1>
      <p style={{ marginTop: 8 }}>Clean Next.js scaffold. Go try the compare tool.</p>
      <a href="/compare" style={{ display: "inline-block", marginTop: 12, padding: "8px 12px", border: "1px solid #000", borderRadius: 6 }}>
        Open Compare
      </a>
    </main>
  );
}
