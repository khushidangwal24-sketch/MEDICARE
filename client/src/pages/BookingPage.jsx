import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { Section } from "../components/Section.jsx";
import { Card } from "../components/Card.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";
import { Loading } from "../components/Loading.jsx";
import { useAuth } from "../state/auth.jsx";

function isoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function BookingPage() {
  const nav = useNavigate();
  const { isAuthed, login, register } = useAuth();
  const [params] = useSearchParams();

  const presetDoctorId = params.get("doctorId") || "";
  const presetHospitalId = params.get("hospitalId") || "";

  const [tab, setTab] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "demo@healthhub.com", password: "password123" });
  const [authErr, setAuthErr] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorId, setDoctorId] = useState(presetDoctorId);
  const [hospitalId, setHospitalId] = useState(presetHospitalId);
  const [appointmentDate, setAppointmentDate] = useState(isoToday());
  const [slot, setSlot] = useState("10:00");
  const [mode, setMode] = useState("in_person");
  const [patientName, setPatientName] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        setLoadingDoctors(true);
        const { data } = await api.get("/api/doctors");
        if (alive) setDoctors(data);
      } finally {
        if (alive) setLoadingDoctors(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, []);

  const selectedDoctor = useMemo(() => doctors.find((d) => d._id === doctorId), [doctors, doctorId]);
  const availableSlots = useMemo(() => {
    const a = selectedDoctor?.availability || [];
    const slots = a.flatMap((x) => x.slots || []);
    return slots.length ? slots : ["10:00", "10:30", "11:00", "16:00", "16:30"];
  }, [selectedDoctor]);

  useEffect(() => {
    if (!slot && availableSlots.length) setSlot(availableSlots[0]);
  }, [availableSlots, slot]);

  async function submitAuth(e) {
    e.preventDefault();
    setAuthErr("");
    setAuthBusy(true);
    try {
      if (tab === "login") await login({ email: authForm.email, password: authForm.password });
      else await register({ name: authForm.name, email: authForm.email, password: authForm.password });
      nav("/records");
    } catch (e2) {
      setAuthErr(e2?.response?.data?.message || e2.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function book(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setMessage("");
    try {
      const { data } = await api.post("/api/bookings", {
        doctorId,
        hospitalId: hospitalId || undefined,
        patientName,
        reason,
        appointmentDate: new Date(`${appointmentDate}T00:00:00.000Z`).toISOString(),
        slot,
        mode,
      });
      setMessage(`Booked! Appointment ID: ${data._id}`);
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="hh-page">
      <Section title="Book an appointment" subtitle="Demo auth + booking flow">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <Card title="Sign in" subtitle="Use demo user or create new">
            {isAuthed ? (
              <div className="pill">
                <b>Signed in</b>
                <span className="muted">You can book now.</span>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button className={`btn ${tab === "login" ? "primary" : ""}`} onClick={() => setTab("login")} type="button">
                    Login
                  </button>
                  <button className={`btn ${tab === "register" ? "primary" : ""}`} onClick={() => setTab("register")} type="button">
                    Register
                  </button>
                </div>

                {authErr ? <ErrorBox message={authErr} /> : null}
                <form onSubmit={submitAuth} className="grid" style={{ marginTop: 10 }}>
                  {tab === "register" ? (
                    <input className="input" placeholder="Name" value={authForm.name} onChange={(e) => setAuthForm((s) => ({ ...s, name: e.target.value }))} />
                  ) : null}
                  <input className="input" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm((s) => ({ ...s, email: e.target.value }))} />
                  <input className="input" type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm((s) => ({ ...s, password: e.target.value }))} />
                  <button className="btn primary" disabled={authBusy} type="submit">
                    {authBusy ? "Please wait..." : tab === "login" ? "Login" : "Create account"}
                  </button>
                  <div className="muted" style={{ fontSize: 13 }}>
                    Demo: <b>demo@healthhub.com</b> / <b>password123</b> (after you run server seed)
                  </div>
                </form>
              </>
            )}
          </Card>

          <Card title="Appointment details" subtitle="Select doctor, date, slot">
            {loadingDoctors ? <Loading label="Loading doctors..." /> : null}
            {err ? <ErrorBox message={err} /> : null}
            {message ? (
              <div className="card" style={{ padding: 12, borderRadius: 14, border: "1px solid rgba(16,185,129,0.35)", background: "rgba(255,255,255,0.85)" }}>
                <b>Success</b>
                <div className="muted" style={{ marginTop: 6 }}>
                  {message}
                </div>
              </div>
            ) : null}

            <form onSubmit={book} className="grid" style={{ marginTop: 12 }}>
              <select className="input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
                <option value="" disabled>
                  Select doctor
                </option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} — {d.specialty}
                  </option>
                ))}
              </select>

              <input className="input" placeholder="Hospital ID (optional)" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} />

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input className="input" type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required />
                <select className="input" value={slot} onChange={(e) => setSlot(e.target.value)} required>
                  {availableSlots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <select className="input" value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="in_person">In person</option>
                <option value="telemedicine">Telemedicine</option>
              </select>

              <input className="input" placeholder="Patient name" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
              <input className="input" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />

              <button className="btn success" disabled={!isAuthed || busy} type="submit">
                {!isAuthed ? "Sign in to book" : busy ? "Booking..." : "Book appointment"}
              </button>
              {selectedDoctor ? (
                <div className="muted" style={{ fontSize: 13 }}>
                  Selected: <b>{selectedDoctor.name}</b> • Fee: <b>₹{selectedDoctor.fee}</b>
                </div>
              ) : null}
            </form>
          </Card>
        </div>
      </Section>
    </div>
  );
}

