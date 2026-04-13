import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { Section } from "../components/Section.jsx";
import { Card } from "../components/Card.jsx";
import { Loading } from "../components/Loading.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";

function slotsLabel(availability = []) {
  if (!availability?.length) return "No slots published";
  const first = availability[0];
  const slots = first?.slots?.slice(0, 3)?.join(", ");
  return slots ? `${first.day}: ${slots}${first.slots.length > 3 ? "…" : ""}` : "Slots available";
}

export function DoctorsPage() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const specialty = params.get("specialty") || "";
  const hospitalId = params.get("hospitalId") || "";
  const q = params.get("q") || "";

  const specialties = useMemo(
    () => ["Cardiology", "Orthopedics", "Pediatrics", "Dermatology", "ENT", "Neurology", "Diabetology", "General Medicine"],
    []
  );

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/api/doctors", {
          params: { specialty: specialty || undefined, hospitalId: hospitalId || undefined, q: q || undefined },
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
  }, [specialty, hospitalId, q]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }

  return (
    <div className="hh-page">
      <Section
        title="Doctors"
        subtitle="Browse profiles, fees, and availability"
        right={
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <select className="input" value={specialty} onChange={(e) => update("specialty", e.target.value)}>
              <option value="">All specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Hospital ID (optional)" value={hospitalId} onChange={(e) => update("hospitalId", e.target.value)} />
            <input className="input" placeholder="Search doctor name" value={q} onChange={(e) => update("q", e.target.value)} />
          </div>
        }
      >
        {loading ? <Loading label="Loading doctors..." /> : null}
        {error ? <ErrorBox message={error} /> : null}

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", marginTop: 14 }}>
          {items.map((d) => (
            <Card
              key={d._id}
              title={d.name}
              subtitle={`${d.specialty} • ${(d.hospitalId?.name || "Independent")}`}
              meta={[
                `₹${d.fee || 0}`,
                `${d.experienceYears || 0} yrs`,
                d.isTelemedicineAvailable ? "Telemedicine" : "In-person",
              ]}
              actions={
                <button
                  className="btn primary"
                  onClick={() =>
                    nav(`/book?doctorId=${d._id}&hospitalId=${d.hospitalId?._id || ""}`)
                  }
                >
                  Book
                </button>
              }
            >
              <div className="muted">{slotsLabel(d.availability)}</div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

