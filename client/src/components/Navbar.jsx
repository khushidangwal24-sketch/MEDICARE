import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth.jsx";
import "./navbar.css";

export function Navbar() {
  const { isAuthed, user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="hh-nav">
      <div className="container hh-nav-inner">
        <button className="hh-brand" onClick={() => nav("/")}>
          <span className="hh-dot" />
          <span>Health Hub</span>
        </button>

        <nav className="hh-links">
          <NavLink to="/hospitals">Hospitals</NavLink>
          <NavLink to="/doctors">Doctors</NavLink>
          <NavLink to="/labs">Lab Tests</NavLink>
          <NavLink to="/blood-bank">Blood Bank</NavLink>
          <NavLink to="/pharmacy">Pharmacy</NavLink>
          <NavLink to="/telemedicine">Telemedicine</NavLink>
          <NavLink to="/records">Records</NavLink>
        </nav>

        <div className="hh-right">
          {isAuthed ? (
            <>
              <span className="hh-user pill">
                <span className="hh-avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</span>
                <span className="hh-user-name">{user?.name || "User"}</span>
              </span>
              <button className="btn" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn primary" onClick={() => nav("/book")}>
              Sign in / Book
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

