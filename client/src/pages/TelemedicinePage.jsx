import { useState } from "react";
import { Section } from "../components/Section.jsx";
import { Card } from "../components/Card.jsx";

export function TelemedicinePage() {
  const [messages, setMessages] = useState([
    { from: "doctor", text: "Hi! This is a demo telemedicine chat UI." },
    { from: "user", text: "Great — can I share symptoms here?" },
  ]);
  const [draft, setDraft] = useState("");

  function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "user", text: draft.trim() }]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [...m, { from: "doctor", text: "Demo reply. Add Socket.io/WebRTC later." }]);
    }, 400);
  }

  return (
    <div className="hh-page">
      <Section title="Telemedicine" subtitle="Placeholder UI for chat/video (scalable later)">
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <Card title="Video panel (placeholder)" subtitle="Integrate WebRTC/Agora/Jitsi later">
            <div
              className="card"
              style={{
                padding: 16,
                borderRadius: 18,
                border: "1px dashed rgba(11,108,242,0.35)",
                background: "rgba(255,255,255,0.75)",
                minHeight: 220,
                display: "grid",
                placeItems: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <b>Video area</b>
                <div className="muted" style={{ marginTop: 8 }}>
                  This MVP shows UI only. Real video can be added later.
                </div>
              </div>
            </div>
          </Card>

          <Card title="Chat (placeholder)" subtitle="Add real-time later">
            <div
              className="card"
              style={{
                padding: 12,
                borderRadius: 18,
                border: "1px solid var(--line)",
                background: "rgba(255,255,255,0.75)",
                height: 220,
                overflow: "auto",
                display: "grid",
                gap: 8,
              }}
            >
              {messages.map((m, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    className="pill"
                    style={{
                      maxWidth: "80%",
                      borderColor: m.from === "user" ? "rgba(11,108,242,0.25)" : "rgba(16,185,129,0.25)",
                      background: m.from === "user" ? "rgba(11,108,242,0.08)" : "rgba(16,185,129,0.08)",
                    }}
                  >
                    <span>{m.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <input className="input" placeholder="Type a message..." value={draft} onChange={(e) => setDraft(e.target.value)} />
              <button className="btn primary" type="submit">
                Send
              </button>
            </form>
          </Card>
        </div>
      </Section>
    </div>
  );
}

