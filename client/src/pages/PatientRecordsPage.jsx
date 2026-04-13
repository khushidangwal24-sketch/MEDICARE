import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../state/auth.jsx";
import { Section } from "../components/Section.jsx";
import { Card } from "../components/Card.jsx";
import { Loading } from "../components/Loading.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";

function csvToArray(value) {
  return value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function PatientRecordsPage() {
  const { isAuthed } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [historyBusy, setHistoryBusy] = useState(false);
  const [labBusy, setLabBusy] = useState(false);
  const [message, setMessage] = useState("");

  const [profileForm, setProfileForm] = useState({
    bloodGroup: "",
    allergies: "",
    chronicConditions: "",
    medications: "",
  });
  const [labForm, setLabForm] = useState({
    testName: "",
    resultSummary: "",
    testDate: "",
    labName: "",
    reportUrl: "",
  });
  const [historyForm, setHistoryForm] = useState({
    diagnosis: "",
    diagnosedOn: "",
    notes: "",
    treatmentStatus: "ongoing",
  });

  async function loadRecords() {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/api/users/me/records");
      setRecords(data);
      setProfileForm({
        bloodGroup: data?.medicalProfile?.bloodGroup || "",
        allergies: (data?.medicalProfile?.allergies || []).join(", "),
        chronicConditions: (data?.medicalProfile?.chronicConditions || []).join(", "),
        medications: (data?.medicalProfile?.medications || []).join(", "),
      });
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthed) return;
    loadRecords();
  }, [isAuthed]);

  const previousVisits = useMemo(() => records?.previousVisits || [], [records]);
  const medicalHistory = useMemo(() => records?.medicalHistory || [], [records]);
  const problemsFaced = useMemo(() => records?.problemsFaced || [], [records]);
  const pathlabRecords = useMemo(() => records?.pathlabRecords || [], [records]);
  const suggestedTests = useMemo(() => records?.recommendedLabTests || [], [records]);

  async function saveMedicalProfile(e) {
    e.preventDefault();
    setSaveBusy(true);
    setMessage("");
    setError("");
    try {
      await api.put("/api/users/me/medical-profile", {
        bloodGroup: profileForm.bloodGroup,
        allergies: csvToArray(profileForm.allergies),
        chronicConditions: csvToArray(profileForm.chronicConditions),
        medications: csvToArray(profileForm.medications),
      });
      setMessage("Medical profile updated.");
      await loadRecords();
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setSaveBusy(false);
    }
  }

  async function addPathlabRecord(e) {
    e.preventDefault();
    setLabBusy(true);
    setMessage("");
    setError("");
    try {
      await api.post("/api/users/me/pathlabs", labForm);
      setLabForm({ testName: "", resultSummary: "", testDate: "", labName: "", reportUrl: "" });
      setMessage("Pathlab record added.");
      await loadRecords();
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLabBusy(false);
    }
  }

  async function addMedicalHistory(e) {
    e.preventDefault();
    setHistoryBusy(true);
    setMessage("");
    setError("");
    try {
      await api.post("/api/users/me/medical-history", historyForm);
      setHistoryForm({ diagnosis: "", diagnosedOn: "", notes: "", treatmentStatus: "ongoing" });
      setMessage("Medical history entry added.");
      await loadRecords();
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setHistoryBusy(false);
    }
  }

  if (!isAuthed) {
    return (
      <div className="hh-page">
        <Section
          title="Patient Records"
          subtitle="Sign in to access medical history and pathlab reports in one place"
        >
          <Card title="Sign in required" subtitle="Your records are protected and available after login">
            <div className="grid" style={{ gap: 10 }}>
              <div className="muted">
                After sign in, you can save medical history, add pathlab reports, and review previous visits.
              </div>
              <button className="btn primary" type="button" onClick={() => nav("/book")}>
                Sign in to continue
              </button>
            </div>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="hh-page">
      <Section
        title="Patient Records"
        subtitle="Medical history, previous visits, problems faced, and pathlab records"
      >
        {loading ? <Loading label="Loading patient records..." /> : null}
        {error ? <ErrorBox message={error} /> : null}
        {message ? <div className="pill">{message}</div> : null}

        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 12 }}
        >
          <Card title="Medical Profile" subtitle="Update your baseline health details">
            <form className="grid" onSubmit={saveMedicalProfile}>
              <input
                className="input"
                placeholder="Blood group (e.g. O+)"
                value={profileForm.bloodGroup}
                onChange={(e) => setProfileForm((s) => ({ ...s, bloodGroup: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Allergies (comma separated)"
                value={profileForm.allergies}
                onChange={(e) => setProfileForm((s) => ({ ...s, allergies: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Chronic conditions (comma separated)"
                value={profileForm.chronicConditions}
                onChange={(e) => setProfileForm((s) => ({ ...s, chronicConditions: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Current medications (comma separated)"
                value={profileForm.medications}
                onChange={(e) => setProfileForm((s) => ({ ...s, medications: e.target.value }))}
              />
              <button className="btn primary" type="submit" disabled={saveBusy}>
                {saveBusy ? "Saving..." : "Save medical profile"}
              </button>
            </form>
          </Card>

          <Card title="Previous Visits" subtitle="All appointments you booked before">
            <div className="grid" style={{ gap: 8 }}>
              {previousVisits.map((v) => (
                <div className="pill" key={v.id} style={{ display: "grid", gap: 4 }}>
                  <b>{v.doctorName}</b>
                  <span className="muted">
                    {v.hospitalName} • {String(v.appointmentDate).slice(0, 10)} • {v.slot}
                  </span>
                  <span className="muted">Issue: {v.reason || "N/A"}</span>
                </div>
              ))}
              {!previousVisits.length ? <div className="muted">No previous visits yet.</div> : null}
            </div>
          </Card>

          <Card title="Problems Faced" subtitle="Issues from your past consultations">
            <div className="grid" style={{ gap: 8 }}>
              {problemsFaced.map((p) => (
                <span key={p} className="pill">
                  {p}
                </span>
              ))}
              {!problemsFaced.length ? <div className="muted">No problems recorded yet.</div> : null}
            </div>
          </Card>

          <Card title="Medical History" subtitle="Maintain diagnosis timeline and treatment status">
            <form className="grid" onSubmit={addMedicalHistory}>
              <input
                className="input"
                placeholder="Diagnosis / condition"
                value={historyForm.diagnosis}
                onChange={(e) => setHistoryForm((s) => ({ ...s, diagnosis: e.target.value }))}
                required
              />
              <input
                className="input"
                type="date"
                value={historyForm.diagnosedOn}
                onChange={(e) => setHistoryForm((s) => ({ ...s, diagnosedOn: e.target.value }))}
              />
              <textarea
                className="input"
                placeholder="Doctor notes, symptoms, treatment notes"
                value={historyForm.notes}
                onChange={(e) => setHistoryForm((s) => ({ ...s, notes: e.target.value }))}
                rows={3}
              />
              <select
                className="input"
                value={historyForm.treatmentStatus}
                onChange={(e) => setHistoryForm((s) => ({ ...s, treatmentStatus: e.target.value }))}
              >
                <option value="ongoing">Ongoing treatment</option>
                <option value="monitoring">Monitoring</option>
                <option value="resolved">Resolved</option>
              </select>
              <button className="btn primary" type="submit" disabled={historyBusy}>
                {historyBusy ? "Saving..." : "Add medical history"}
              </button>
            </form>

            <div className="grid" style={{ gap: 8, marginTop: 10 }}>
              {medicalHistory.map((item) => (
                <div key={item.id} className="pill" style={{ display: "grid", gap: 4 }}>
                  <b>{item.diagnosis}</b>
                  <span className="muted">
                    Diagnosed: {item.diagnosedOn || "N/A"} • Status: {item.treatmentStatus || "ongoing"}
                  </span>
                  <span className="muted">{item.notes || "No additional notes."}</span>
                </div>
              ))}
              {!medicalHistory.length ? <div className="muted">No medical history added yet.</div> : null}
            </div>
          </Card>

          <Card title="Pathlabs Records" subtitle="Upload and track your test results">
            <form className="grid" onSubmit={addPathlabRecord}>
              <input
                className="input"
                placeholder="Test name"
                value={labForm.testName}
                onChange={(e) => setLabForm((s) => ({ ...s, testName: e.target.value }))}
                required
              />
              <input
                className="input"
                placeholder="Result summary"
                value={labForm.resultSummary}
                onChange={(e) => setLabForm((s) => ({ ...s, resultSummary: e.target.value }))}
                required
              />
              <input
                className="input"
                type="date"
                value={labForm.testDate}
                onChange={(e) => setLabForm((s) => ({ ...s, testDate: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Lab name"
                value={labForm.labName}
                onChange={(e) => setLabForm((s) => ({ ...s, labName: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Report URL (optional)"
                value={labForm.reportUrl}
                onChange={(e) => setLabForm((s) => ({ ...s, reportUrl: e.target.value }))}
              />
              <button className="btn success" type="submit" disabled={labBusy}>
                {labBusy ? "Saving..." : "Add pathlab record"}
              </button>
            </form>

            <div className="grid" style={{ gap: 8, marginTop: 10 }}>
              {pathlabRecords.map((r) => (
                <div key={r.id} className="pill" style={{ display: "grid", gap: 4 }}>
                  <b>{r.testName}</b>
                  <span className="muted">
                    {r.labName} • {r.testDate}
                  </span>
                  <span className="muted">{r.resultSummary}</span>
                  {r.reportUrl ? (
                    <a href={r.reportUrl} target="_blank" rel="noreferrer">
                      Open report
                    </a>
                  ) : null}
                </div>
              ))}
              {!pathlabRecords.length ? <div className="muted">No pathlab records yet.</div> : null}
            </div>
          </Card>
        </div>

        <Section title="Suggested Lab Tests" subtitle="Recommended tests from our pathlabs section">
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", marginTop: 6 }}>
            {suggestedTests.map((t) => (
              <Card key={t._id} title={t.name} subtitle={t.description} meta={[`₹${t.price}`, t.turnaroundTime]} />
            ))}
          </div>
        </Section>
      </Section>
    </div>
  );
}
