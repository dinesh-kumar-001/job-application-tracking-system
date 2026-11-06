import { useCallback, useEffect, useState } from "react";
import api, { getErrorMessage } from "../services/api";

const STATUSES = ["Applied", "Shortlisted", "Interview", "Rejected"];

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, Applied: 0, Shortlisted: 0, Interview: 0, Rejected: 0 });
  const [search, setSearch] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ search, jobRole, status, page, limit: 10 });
      const [applicationResponse, statsResponse] = await Promise.all([
        api.get(`/applications?${params.toString()}`),
        api.get("/applications/statistics")
      ]);
      setApplications(applicationResponse.data.applications);
      setPagination(applicationResponse.data.pagination);
      setStats(statsResponse.data.statistics);

      const allRolesResponse = await api.get("/applications?limit=50");
      setRoles([...new Set(allRolesResponse.data.applications.map((item) => item.jobRole))].sort());
    } catch (err) {
      setError(getErrorMessage(err));
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        window.location.href = "/admin/login";
      }
    } finally {
      setLoading(false);
    }
  }, [search, jobRole, status, page]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function updateStatus(id, newStatus) {
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function deleteApplication(id) {
    if (!window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) return;
    try {
      await api.delete(`/applications/${id}`);
      if (applications.length === 1 && page > 1) setPage(page - 1);
      else await loadDashboard();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function resetFilters() {
    setSearch("");
    setJobRole("");
    setStatus("");
    setPage(1);
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-title">
        <div><p className="eyebrow">ADMIN WORKSPACE</p><h1>Applications dashboard</h1><p className="muted">Review candidates and manage recruitment progress.</p></div>
        <button className="outline-button" onClick={loadDashboard}>↻ Refresh</button>
      </div>

      <section className="stats-grid">
        {[
          ["Total applications", stats.total, "total"],
          ["Applied", stats.Applied, "Applied"],
          ["Shortlisted", stats.Shortlisted, "Shortlisted"],
          ["Interview", stats.Interview, "Interview"],
          ["Rejected", stats.Rejected, "Rejected"]
        ].map(([label, value, key]) => (
          <article className="stat-card" key={key}><p>{label}</p><strong>{value}</strong></article>
        ))}
      </section>

      <section className="table-card">
        <div className="table-heading"><div><h2>Candidate applications</h2><p className="muted">{pagination.total} result(s) found</p></div></div>
        <div className="filters">
          <input aria-label="Search candidate" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name or email..." />
          <select aria-label="Filter by role" value={jobRole} onChange={(e) => { setJobRole(e.target.value); setPage(1); }}>
            <option value="">All job roles</option>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {STATUSES.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="outline-button" onClick={resetFilters}>Clear</button>
        </div>

        {error && <div className="alert error">{error}</div>}
        {loading ? <p className="empty-state">Loading applications...</p> : applications.length === 0 ? <p className="empty-state">No applications found for these filters.</p> : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Candidate</th><th>Contact</th><th>Job role</th><th>Skills</th><th>Applied date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item._id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.email}<br /><span className="muted">{item.phone}</span></td>
                    <td>{item.jobRole}</td>
                    <td><div className="skill-list">{item.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td><select className={`status-select status-${item.status.toLowerCase()}`} value={item.status} onChange={(e) => updateStatus(item._id, e.target.value)} aria-label={`Status for ${item.name}`}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
                    <td><button className="delete-button" onClick={() => deleteApplication(item._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span className="muted">Page {page} of {Math.max(pagination.totalPages, 1)}</span>
          <div><button className="outline-button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button><button className="outline-button" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button></div>
        </div>
      </section>
    </main>
  );
}
