export function ErrorBox({ title = "Something went wrong", message }) {
  return (
    <div
      className="card"
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid rgba(220, 38, 38, 0.25)",
        background: "rgba(255,255,255,0.85)",
      }}
    >
      <b>{title}</b>
      <div className="muted" style={{ marginTop: 6 }}>
        {message || "Please try again."}
      </div>
    </div>
  );
}

