import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Section } from "../components/Section.jsx";
import { Card } from "../components/Card.jsx";
import "./page.css";

const services = [
  { title: "Hospitals", desc: "Search by city & specialty", to: "/hospitals", tag: "Nearby care" },
  { title: "Doctors", desc: "View profiles & availability", to: "/doctors", tag: "Book slots" },
  { title: "Lab Tests", desc: "Browse tests & pricing", to: "/labs", tag: "Fast reports" },
  { title: "Patient Records", desc: "Medical history + pathlab reports", to: "/records", tag: "Personal health file" },
  { title: "Blood Bank", desc: "Find donors by blood group", to: "/blood-bank", tag: "Urgent help" },
  { title: "Pharmacy", desc: "Medicines & essentials", to: "/pharmacy", tag: "Home delivery" },
  { title: "Telemedicine", desc: "Video/chat placeholder UI", to: "/telemedicine", tag: "Online consult" },
];

export function HomePage() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const featured = useMemo(() => services, []);

  function onSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    nav(`/hospitals?${params.toString()}`);
  }

  return (
    <div className="hh-page">
      <div className="container">
        <div className="hh-hero">
          <h1>Your one-stop healthcare hub</h1>
          <p>
            Search hospitals, discover doctors, book appointments, explore lab tests, find blood donors,
            and browse pharmacy items—built as an MVP you can expand.
          </p>

          <form className="hh-search" onSubmit={onSearch}>
            <input
              className="input"
              placeholder="Search hospitals, specialties (e.g. Cardiology, Apollo)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <input
              className="input"
              placeholder="City (e.g. Delhi)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button className="btn primary" type="submit">
              Search
            </button>
          </form>

          <div className="hh-kpis">
            <div className="hh-kpi">
              <b>Hospitals</b>
              <span className="muted">Filters + search</span>
            </div>
            <div className="hh-kpi">
              <b>Doctors</b>
              <span className="muted">Availability slots</span>
            </div>
            <div className="hh-kpi">
              <b>Bookings</b>
              <span className="muted">JWT auth (basic)</span>
            </div>
          </div>
        </div>
      </div>

      <Section title="Featured services" subtitle="Explore the MVP modules">
        <div className="container grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {featured.map((s) => (
            <Card
              key={s.title}
              title={s.title}
              subtitle={s.desc}
              meta={[s.tag]}
              actions={
                <button className="btn success" onClick={() => nav(s.to)}>
                  Open
                </button>
              }
            >
              <div className="muted">Click to view listings and try search/filter flows.</div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

