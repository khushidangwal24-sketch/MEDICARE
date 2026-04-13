import "./card.css";

export function Card({ title, subtitle, meta = [], actions, children }) {
  return (
    <article className="card hh-card">
      <header className="hh-card-head">
        <div>
          <h3 className="hh-card-title">{title}</h3>
          {subtitle ? <p className="hh-card-sub muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="hh-card-actions">{actions}</div> : null}
      </header>
      {meta?.length ? (
        <div className="hh-card-meta">
          {meta.map((m) => (
            <span key={m} className="pill">
              {m}
            </span>
          ))}
        </div>
      ) : null}
      <div className="hh-card-body">{children}</div>
    </article>
  );
}

