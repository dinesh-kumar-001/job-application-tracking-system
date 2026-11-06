import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = Boolean(localStorage.getItem("adminToken"));

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  }

  return (
    <header className="navbar">
      <Link className="brand" to="/">Career<span>Track</span></Link>
      <nav>
        <Link to="/">Apply for a job</Link>
        {loggedIn
          ? <><Link to="/admin/dashboard">Dashboard</Link><button className="nav-button" onClick={logout}>Logout</button></>
          : <Link to="/admin/login">Admin</Link>}
      </nav>
    </header>
  );
}
