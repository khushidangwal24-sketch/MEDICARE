export function Loading({ label = "Loading..." }) {
  return (
    <div className="pill" style={{ width: "fit-content" }}>
      <span
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: "linear-gradient(135deg, var(--primary2), var(--primary))",
          boxShadow: "0 6px 18px rgba(11,108,242,0.18)",
        }}
      />
      <span className="muted">{label}</span>
    </div>
  );
}

