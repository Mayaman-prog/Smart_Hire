import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { adminAPI } from "../../../services/api";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import "./AdminDashboard.css";

// Pagination size for tables
const PAGE_SIZE = 6;

const AdminDashboard = () => {
  const { logout } = useAuth(); // ✅ Get logout function
  const [activeTab, setActiveTab] = useState("overview");

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [togglingUserId, setTogglingUserId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);

  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [jobPage, setJobPage] = useState(1);

  const [companySearch, setCompanySearch] = useState("");
  const [companyPage, setCompanyPage] = useState(1);

  const [statsOverview, setStatsOverview] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);

      const [usersRes, jobsRes, compRes, statsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getJobs(),
        adminAPI.getCompanies(),
        adminAPI.getStatsOverview(),
      ]);

      setUsers(usersRes.data?.data || []);
      setJobs(jobsRes.data?.data || []);
      setCompanies(compRes.data?.data || []);
      setStatsOverview(statsRes.data?.data || null);
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleUser = async (id) => {
    try {
      setTogglingUserId(id);
      await adminAPI.toggleUser(id);
      await fetchData();
      toast.success("User status updated");
    } catch (err) {
      console.error("Toggle user error:", err);
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setTogglingUserId(null);
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return;

    try {
      setDeletingJobId(id);
      await adminAPI.deleteJob(id);
      await fetchData();
      toast.success("Job deleted");
    } catch (err) {
      console.error("Delete job error:", err);
      toast.error(err.response?.data?.message || "Failed to delete job");
    } finally {
      setDeletingJobId(null);
    }
  };

  const stats = useMemo(() => {
    const activeUsers = users.filter((u) => Number(u.is_active) === 1).length;
    const activeJobs = jobs.filter((j) => Number(j.is_active) === 1).length;

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers: users.length - activeUsers,
      totalJobs: jobs.length,
      activeJobs,
      inactiveJobs: jobs.length - activeJobs,
      totalCompanies: companies.length,
    };
  }, [users, jobs, companies]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !userSearch ||
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase());

      const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;

      const matchesStatus =
        userStatusFilter === "all" ||
        (userStatusFilter === "active" && Number(u.is_active) === 1) ||
        (userStatusFilter === "inactive" && Number(u.is_active) !== 1);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      const matchesSearch =
        !jobSearch ||
        j.title?.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.company_name?.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.location?.toLowerCase().includes(jobSearch.toLowerCase());

      const matchesStatus =
        jobStatusFilter === "all" ||
        (jobStatusFilter === "active" && Number(j.is_active) === 1) ||
        (jobStatusFilter === "inactive" && Number(j.is_active) !== 1);

      const matchesType =
        jobTypeFilter === "all" || j.job_type === jobTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [jobs, jobSearch, jobStatusFilter, jobTypeFilter]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      return (
        !companySearch ||
        c.name?.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.location?.toLowerCase().includes(companySearch.toLowerCase())
      );
    });
  }, [companies, companySearch]);

  const paginate = (items, page) => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  };

  const getTotalPages = (items) =>
    Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const paginatedUsers = paginate(filteredUsers, userPage);
  const paginatedJobs = paginate(filteredJobs, jobPage);
  const paginatedCompanies = paginate(filteredCompanies, companyPage);

  useEffect(
    () => setUserPage(1),
    [userSearch, userRoleFilter, userStatusFilter],
  );
  useEffect(() => setJobPage(1), [jobSearch, jobStatusFilter, jobTypeFilter]);
  useEffect(() => setCompanyPage(1), [companySearch]);

  const renderPagination = (currentPage, setPage, totalPages) => {
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-container">
          <main className="dashboard-main">
            <div className="admin-dashboard-loading">
              Loading admin dashboard...
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <div className="admin-info">
            <div className="admin-avatar">
              <span className="material-symbols-outlined">shield_person</span>
            </div>
            <h3>Admin Panel</h3>
            <p>System control center</p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Overview
            </button>

            <button
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              <span className="material-symbols-outlined">group</span>
              Users
            </button>

            <button
              className={activeTab === "jobs" ? "active" : ""}
              onClick={() => setActiveTab("jobs")}
            >
              <span className="material-symbols-outlined">work</span>
              Jobs
            </button>

            <button
              className={activeTab === "companies" ? "active" : ""}
              onClick={() => setActiveTab("companies")}
            >
              <span className="material-symbols-outlined">apartment</span>
              Companies
            </button>
          </nav>

          <div className="sidebar-footer">
            <button
              className="help-btn"
              onClick={() => toast.info("Help & Support coming soon")}
            >
              <span className="material-symbols-outlined">help</span>
              Help
            </button>
            <button className="logout-btn" onClick={logout}>
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
            <div className="copyright">SmartHire Admin</div>
            <div className="footer-links">
              <span>Users</span>
              <span>Jobs</span>
              <span>Companies</span>
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          {activeTab === "overview" && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1>Admin Dashboard</h1>
                  <p>
                    Monitor platform activity and manage the system efficiently.
                  </p>
                </div>
              </div>

              <div className="admin-card-grid">
                <div className="admin-stat-card">
                  <h3>Total Users</h3>
                  <p>{stats.totalUsers}</p>
                </div>

                <div className="admin-stat-card">
                  <h3>Active Users</h3>
                  <p>{stats.activeUsers}</p>
                </div>

                <div className="admin-stat-card">
                  <h3>Total Jobs</h3>
                  <p>{stats.totalJobs}</p>
                </div>

                <div className="admin-stat-card">
                  <h3>Active Jobs</h3>
                  <p>{stats.activeJobs}</p>
                </div>

                <div className="admin-stat-card">
                  <h3>Companies</h3>
                  <p>{stats.totalCompanies}</p>
                </div>

                <div className="admin-stat-card">
                  <h3>Inactive Users</h3>
                  <p>{stats.inactiveUsers}</p>
                </div>
              </div>

              <div className="admin-section">
                <div className="admin-section-header">
                  <h2>Growth Analytics</h2>
                  <span className="admin-count">Last 6 months</span>
                </div>

                {statsLoading ? (
                  <div className="empty-state">Loading charts...</div>
                ) : !statsOverview?.growth?.length ? (
                  <div className="empty-state">
                    No chart data available yet.
                  </div>
                ) : (
                  <div className="charts-grid">
                    <div className="chart-card">
                      <div className="chart-card-header">
                        <h3>User Growth</h3>
                        <p>New user accounts created per month</p>
                      </div>

                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                          <LineChart data={statsOverview.growth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="users"
                              stroke="#2563eb"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Users"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="chart-card">
                      <div className="chart-card-header">
                        <h3>Job Posting Growth</h3>
                        <p>New jobs posted per month</p>
                      </div>

                      <div className="chart-wrap">
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={statsOverview.growth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="jobs"
                              fill="#10b981"
                              radius={[8, 8, 0, 0]}
                              name="Jobs"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="overview-grid">
                <section className="admin-section overview-panel">
                  <div className="admin-section-header">
                    <h2>Recent Users</h2>
                  </div>

                  {users.length === 0 ? (
                    <div className="empty-state">No recent users.</div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.slice(0, 5).map((u) => (
                            <tr key={u.id}>
                              <td>{u.name}</td>
                              <td>{u.email}</td>
                              <td className="capitalize-text">
                                {(u.role || "").replace("_", " ")}
                              </td>
                              <td>
                                {u.created_at
                                  ? new Date(u.created_at).toLocaleDateString()
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="admin-section overview-panel">
                  <div className="admin-section-header">
                    <h2>Recent Jobs</h2>
                  </div>

                  {jobs.length === 0 ? (
                    <div className="empty-state">No jobs posted yet.</div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>Posted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobs.slice(0, 5).map((j) => (
                            <tr key={j.id}>
                              <td>{j.title}</td>
                              <td>{j.company_name || "—"}</td>
                              <td>
                                <span
                                  className={`status-badge ${
                                    Number(j.is_active) === 1
                                      ? "active"
                                      : "inactive"
                                  }`}
                                >
                                  {Number(j.is_active) === 1
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </td>
                              <td>
                                {j.created_at
                                  ? new Date(j.created_at).toLocaleDateString()
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {activeTab === "users" && (
            <section className="admin-section">
              <div className="admin-section-header">
                <h2>Users</h2>
                <span className="admin-count">
                  {filteredUsers.length} matched / {stats.totalUsers} total
                </span>
              </div>

              <div className="table-controls admin-filters">
                <input
                  type="text"
                  placeholder="Search by name or email"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">All roles</option>
                  <option value="job_seeker">Job Seeker</option>
                  <option value="employer">Employer</option>
                  <option value="admin">Admin</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="empty-state">No users found.</div>
              ) : (
                <>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map((u) => (
                          <tr key={u.id}>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td className="capitalize-text">
                              {(u.role || "").replace("_", " ")}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  Number(u.is_active) === 1
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {Number(u.is_active) === 1
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>
                            <td>
                              {u.created_at
                                ? new Date(u.created_at).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="actions">
                              <button
                                className={`admin-btn ${
                                  Number(u.is_active) === 1
                                    ? "admin-btn-danger"
                                    : "admin-btn-primary"
                                }`}
                                onClick={() => toggleUser(u.id)}
                                disabled={togglingUserId === u.id}
                              >
                                {togglingUserId === u.id
                                  ? "Updating..."
                                  : Number(u.is_active) === 1
                                    ? "Deactivate"
                                    : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {renderPagination(
                    userPage,
                    setUserPage,
                    getTotalPages(filteredUsers),
                  )}
                </>
              )}
            </section>
          )}

          {activeTab === "jobs" && (
            <section className="admin-section">
              <div className="admin-section-header">
                <h2>Jobs</h2>
                <span className="admin-count">
                  {filteredJobs.length} matched / {stats.totalJobs} total
                </span>
              </div>

              <div className="table-controls admin-filters">
                <input
                  type="text"
                  placeholder="Search title, company, or location"
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                />

                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                >
                  <option value="all">All job types</option>
                  <option value="full-time">Full‑time</option>
                  <option value="part-time">Part‑time</option>
                  <option value="remote">Remote</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="empty-state">No jobs found.</div>
              ) : (
                <>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Company</th>
                          <th>Location</th>
                          <th>Job Type</th>
                          <th>Status</th>
                          <th>Posted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedJobs.map((j) => (
                          <tr key={j.id}>
                            <td>{j.title}</td>
                            <td>{j.company_name || "—"}</td>
                            <td>{j.location || "—"}</td>
                            <td className="capitalize-text">
                              {j.job_type || "—"}
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  Number(j.is_active) === 1
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {Number(j.is_active) === 1
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>
                            <td>
                              {j.created_at
                                ? new Date(j.created_at).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="actions">
                              <button
                                className="admin-btn admin-btn-danger"
                                onClick={() => deleteJob(j.id)}
                                disabled={deletingJobId === j.id}
                              >
                                {deletingJobId === j.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {renderPagination(
                    jobPage,
                    setJobPage,
                    getTotalPages(filteredJobs),
                  )}
                </>
              )}
            </section>
          )}

          {activeTab === "companies" && (
            <section className="admin-section">
              <div className="admin-section-header">
                <h2>Companies</h2>
                <span className="admin-count">
                  {filteredCompanies.length} matched / {stats.totalCompanies}{" "}
                  total
                </span>
              </div>

              <div className="table-controls admin-filters">
                <input
                  type="text"
                  placeholder="Search company or location"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                />
              </div>

              {filteredCompanies.length === 0 ? (
                <div className="empty-state">No companies found.</div>
              ) : (
                <>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Location</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCompanies.map((c) => (
                          <tr key={c.id}>
                            <td>{c.name}</td>
                            <td>{c.location || "—"}</td>
                            <td>
                              {c.created_at
                                ? new Date(c.created_at).toLocaleDateString()
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {renderPagination(
                    companyPage,
                    setCompanyPage,
                    getTotalPages(filteredCompanies),
                  )}
                </>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
