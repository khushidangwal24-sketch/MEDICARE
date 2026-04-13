import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { Section } from "../components/Section.jsx";
import { Card } from "../components/Card.jsx";
import { Loading } from "../components/Loading.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";

export function PharmacyPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const categories = useMemo(() => ["Fever & Pain", "Allergy", "Digestive"], []);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/api/pharmacy", {
          params: { q: q || undefined, category: category || undefined },
        });
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
  }, [q, category]);

  return (
    <div className="hh-page">
      <Section
        title="Pharmacy"
        subtitle="Browse medicines (MVP listing)"
        right={
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Search medicines" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        }
      >
        {loading ? <Loading label="Loading medicines..." /> : null}
        {error ? <ErrorBox message={error} /> : null}

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 14 }}>
          {items.map((m) => (
            <Card
              key={m._id}
              title={m.name}
              subtitle={`${m.brand || "Generic"} • ${m.category || "—"}`}
              meta={[m.inStock ? "In stock" : "Out of stock", `₹${m.price}`]}
              actions={<button className="btn primary" type="button">Add</button>}
            >
              <div className="muted">MVP listing (cart/checkout can be added later).</div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

