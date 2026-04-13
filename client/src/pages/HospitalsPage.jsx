import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { Section } from "../components/Section.jsx";
import { Card } from "../components/Card.jsx";
import { Loading } from "../components/Loading.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";

export function HospitalsPage() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const city = params.get("city") || "";
  const specialty = params.get("specialty") || "";
  const q = params.get("q") || "";

  const specialties = useMemo(
    () => ["Cardiology", "Orthopedics", "Pediatrics", "Dermatology", "ENT", "Neurology", "Diabetology"],
    []
  );

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/api/hospitals", { params: { city: city || undefined, specialty: specialty || undefined, q: q || undefined } });
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
  }, [city, specialty, q]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="hh-page">
      <Section
        title="Hospitals"
        subtitle="Filter by city, specialty, and search"
        right={
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <input className="input" placeholder="City (e.g. Delhi)" value={city} onChange={(e) => update("city", e.target.value)} />
            <select className="input" value={specialty} onChange={(e) => update("specialty", e.target.value)}>
              <option value="">All specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Search (e.g. Apollo)" value={q} onChange={(e) => update("q", e.target.value)} />
          </div>
        }
      >
        {loading ? <Loading label="Loading hospitals..." /> : null}
        {error ? <ErrorBox message={error} /> : null}

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 14 }}>
          {items.map((h) => (
            <Card
              key={h._id}
              title={h.name}
              subtitle={`${h.location?.address || ""}`}
              meta={[h.location?.city || "—", `⭐ ${Number(h.rating || 0).toFixed(1)}`].filter(Boolean)}
              actions={
                <a className="btn primary" href={`/doctors?hospitalId=${h._id}`}>
                  View doctors
                </a>
              }
            >
              <div className="muted" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(h.specialties || []).slice(0, 4).map((s) => (
                  <span key={s} className="pill">
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

