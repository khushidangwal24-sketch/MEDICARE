import "./section.css";

export function Section({ title, subtitle, right, children }) {
  return (
    <section className="hh-section">
      <div className="container">
        <div className="hh-section-head">
          <div>
            <h2 className="hh-section-title">{title}</h2>
            {subtitle ? <p className="hh-section-sub muted">{subtitle}</p> : null}
          </div>
          {right ? <div className="hh-section-right">{right}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

