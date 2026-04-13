import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { Section } from "../components/Section.jsx";
import { Card } from "../components/Card.jsx";
import { Loading } from "../components/Loading.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";

const groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export function BloodBankPage() {
  const [city, setCity] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", phone: "", city: "", bloodGroup: "O+", lastDonationDate: "" });
  const [msg, setMsg] = useState("");

  const searchParams = useMemo(() => ({ city: city || undefined, bloodGroup: bloodGroup || undefined }), [city, bloodGroup]);

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/api/blood/donors", { params: searchParams });
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
  }, [searchParams]);

  async function registerDonor(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await api.post("/api/blood/donors", {
        ...form,
        lastDonationDate: form.lastDonationDate || undefined,
      });
      setMsg("Registered as donor. Thank you!");
      setForm({ name: "", phone: "", city: "", bloodGroup: "O+", lastDonationDate: "" });
      const { data } = await api.get("/api/blood/donors", { params: searchParams });
      setItems(data);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2.message);
    }
  }

  return (
    <div className="hh-page">
      <Section title="Blood Bank" subtitle="Search donors by blood group and city">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <Card
            title="Search donors"
            subtitle="Use filters below"
            actions={
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input" placeholder="City (e.g. Delhi)" value={city} onChange={(e) => setCity(e.target.value)} />
                <select className="input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                  <option value="">All</option>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            }
          >
            {loading ? <Loading label="Searching donors..." /> : null}
            {error ? <ErrorBox message={error} /> : null}
            <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 10, marginTop: 12 }}>
              {items.map((d) => (
                <div key={d._id} className="pill" style={{ justifyContent: "space-between" }}>
                  <span>
                    <b>{d.name}</b> <span className="muted">({d.city})</span>
                  </span>
                  <span className="pill">{d.bloodGroup}</span>
                </div>
              ))}
              {!items.length && !loading ? <div className="muted">No donors found. Try different filters.</div> : null}
            </div>
          </Card>

          <Card title="Register as donor" subtitle="Help others by donating">
            {msg ? (
              <div className="pill" style={{ borderColor: "rgba(16,185,129,0.35)" }}>
                <b>Success</b> <span className="muted">{msg}</span>
              </div>
            ) : null}
            {error ? <ErrorBox message={error} /> : null}
            <form onSubmit={registerDonor} className="grid" style={{ marginTop: 12 }}>
              <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
              <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} required />
              <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))} required />
              <select className="input" value={form.bloodGroup} onChange={(e) => setForm((s) => ({ ...s, bloodGroup: e.target.value }))}>
                {groups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <input className="input" type="date" value={form.lastDonationDate} onChange={(e) => setForm((s) => ({ ...s, lastDonationDate: e.target.value }))} />
              <button className="btn success" type="submit">
                Register
              </button>
            </form>
          </Card>
        </div>
      </Section>
    </div>
  );
}

