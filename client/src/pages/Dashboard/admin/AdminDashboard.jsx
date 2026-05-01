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
  PieChart,
  Pie,
  Cell,
} from "recharts"; // Added PieChart, Pie, Cell
import "./AdminDashboard.css";

// Colors for the Pie Chart
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const PAGE_SIZE = 6;

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Table Data
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chart Data
  const [kpiData, setKpiData] = useState([]);
  const [timelineData, setTimelineData] = useState({
    users: [],
    jobs: [],
    dates: [],
  });
  const [jobTypeData, setJobTypeData] = useState({ labels: [], values: [] });
  const [chartLoading, setChartLoading] = useState(true);

  // UI States
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

  // -------------------------------------------------------------
  // 1. Fetch Data (Living on the live endpoints)
  // -------------------------------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      setChartLoading(true);

      // Fetch table data
      const [usersRes, jobsRes, compRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getJobs(),
        adminAPI.getCompanies(),
      ]);

      setUsers(usersRes.data?.data || []);
      setJobs(jobsRes.data?.data || []);
      setCompanies(compRes.data?.data || []);

      // Fetch chart data
      const [kpiRes, timelineRes, popularRes] = await Promise.all([
        adminAPI.getKPI(),
        adminAPI.getTimeline(30),
        adminAPI.getPopular("job_types"),
      ]);

      // KPI Cards
      if (kpiRes.data?.data?.kpi) {
        setKpiData(kpiRes.data.data.kpi);
      }

      // Line/Bar Charts
      if (timelineRes.data?.data) {
        const { dates, users: uCount, jobs: jCount } = timelineRes.data.data;
        setTimelineData({
          dates: dates || [],
          users: uCount || [],
          jobs: jCount || [],
        });
      }

      // Pie Chart
      if (popularRes.data?.data?.jobTypes) {
        const jobTypes = popularRes.data.data.jobTypes;
        setJobTypeData({
          labels: jobTypes.map((item) => item.name),
          values: jobTypes.map((item) => item.count),
        });
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------------------------------------------------
  // 2. Table Actions
  // -------------------------------------------------------------
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

  // -------------------------------------------------------------
  // 3. Table Filters & Pagination
  // -------------------------------------------------------------
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
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
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
      <div className="admin-dashboard-loading">Loading admin dashboard...</div>
    );
  }

  // -------------------------------------------------------------
  // 4. Render
  // -------------------------------------------------------------
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
            {["overview", "users", "jobs", "companies"].map((tab) => {
              // Map tab names to correct Material Symbols icons
              const iconMap = {
                overview: "dashboard",
                users: "group",
                jobs: "work",
                companies: "apartment",
              };

              return (
                <button
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  <span className="material-symbols-outlined">
                    {iconMap[tab]}
                  </span>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={logout}>
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
            <div className="copyright">SmartHire Admin</div>
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

              {/* KPI CARDS - LIVE DATA */}
              <div className="kpi-grid">
                {kpiData.length > 0 ? (
                  kpiData.map((item, idx) => (
                    <div className="admin-stat-card" key={idx}>
                      <h3>{item.label}</h3>
                      <p>{item.value}</p>
                      <div
                        className={`kpi-change ${parseFloat(item.change) >= 0 ? "positive" : "negative"}`}
                      >
                        {parseFloat(item.change) >= 0 ? "+" : ""}
                        {item.change}% vs last week
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No KPI data available</div>
                )}
              </div>

              {/* CHARTS SECTION - LIVE DATA */}
              <div className="admin-section">
                <div className="admin-section-header">
                  <h2>Growth Analytics</h2>
                  <span className="admin-count">Last 30 days</span>
                </div>

                {chartLoading ? (
                  <div className="empty-state">Loading charts...</div>
                ) : (
                  <div className="charts-grid">
                    {/* LINE CHART */}
                    <div className="chart-card">
                      <div className="chart-card-header">
                        <h3>User Growth</h3>
                        <p>New users per day</p>
                      </div>
                      <div className="chart-wrap">
                        {timelineData.dates.length > 0 ? (
                          <ResponsiveContainer width="100%" height={280}>
                            <LineChart
                              data={timelineData.dates.map((date, i) => ({
                                date,
                                users: timelineData.users[i] || 0,
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="users"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                name="New Users"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="empty-chart">
                            No user data available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BAR CHART */}
                    <div className="chart-card">
                      <div className="chart-card-header">
                        <h3>Jobs Posted per Day</h3>
                        <p>New jobs per day</p>
                      </div>
                      <div className="chart-wrap">
                        {timelineData.dates.length > 0 ? (
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                              data={timelineData.dates.map((date, i) => ({
                                date,
                                jobs: timelineData.jobs[i] || 0,
                              }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                              <YAxis allowDecimals={false} />
                              <Tooltip />
                              <Legend />
                              <Bar
                                dataKey="jobs"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                name="Jobs"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="empty-chart">
                            No job data available
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PIE CHART (NEW - SPANS FULL WIDTH) */}
                    <div className="chart-card pie-card">
                      <div className="chart-card-header">
                        <h3>Job Type Distribution</h3>
                        <p>Active jobs by type</p>
                      </div>
                      <div className="chart-wrap">
                        {jobTypeData.values.length > 0 ? (
                          <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                              <Pie
                                data={jobTypeData.labels.map((label, i) => ({
                                  name: label,
                                  value: jobTypeData.values[i] || 0,
                                }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                  `${name} (${(percent * 100).toFixed(0)}%)`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {jobTypeData.labels.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="empty-chart">
                            No job type data available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* TABLES - KEEP UNCHANGED */}
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
                                  className={`status-badge ${Number(j.is_active) === 1 ? "active" : "inactive"}`}
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

          {/* ... Existing User/Jobs tabs (unchanged) ... */}
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
                                className={`status-badge ${Number(u.is_active) === 1 ? "active" : "inactive"}`}
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
                                className={`admin-btn ${Number(u.is_active) === 1 ? "admin-btn-danger" : "admin-btn-primary"}`}
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

          {/* ... Active Jobs Tab (unchanged) ... */}
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
                                className={`status-badge ${Number(j.is_active) === 1 ? "active" : "inactive"}`}
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

          {/* ... Companies Tab (unchanged) ... */}
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
