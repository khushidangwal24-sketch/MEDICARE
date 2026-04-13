import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Section } from "../components/Section.jsx";
import { Card } from "../components/Card.jsx";
import { Loading } from "../components/Loading.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";

export function LabsPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/api/labs", { params: { q: q || undefined } });
        if (alive) setItems(data);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [q]);

  return (
    <div className="hh-page">
      <Section
        title="Lab tests"
        subtitle="Basic structure (expand to lab partners, booking, reports)"
        right={<input className="input" placeholder="Search tests" value={q} onChange={(e) => setQ(e.target.value)} />}
      >
        {loading ? <Loading label="Loading tests..." /> : null}
        {error ? <ErrorBox message={error} /> : null}

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 14 }}>
          {items.map((t) => (
            <Card
              key={t._id}
              title={t.name}
              subtitle={t.description}
              meta={[`₹${t.price}`, t.fastingRequired ? "Fasting required" : "No fasting", t.turnaroundTime || "—"]}
              actions={<button className="btn primary" type="button">Select</button>}
            >
              <div className="muted">MVP listing (add lab test booking later).</div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

