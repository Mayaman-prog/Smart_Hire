import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

// Mock data generators
const generateMockUsers = () => {
  const saved = localStorage.getItem("mock_admin_users");
  if (saved) return JSON.parse(saved);
  return [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "job_seeker",
      is_active: true,
      created_at: "2025-04-01",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "employer",
      is_active: true,
      created_at: "2025-04-02",
    },
    {
      id: 3,
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      is_active: true,
      created_at: "2025-03-15",
    },
    {
      id: 4,
      name: "Bob Wilson",
      email: "bob@example.com",
      role: "job_seeker",
      is_active: false,
      created_at: "2025-04-05",
    },
    {
      id: 5,
      name: "Alice Brown",
      email: "alice@example.com",
      role: "employer",
      is_active: true,
      created_at: "2025-04-07",
    },
  ];
};

const generateMockCompanies = () => {
  const saved = localStorage.getItem("mock_admin_companies");
  if (saved) return JSON.parse(saved);
  return [
    {
      id: 1,
      name: "Tech Corp",
      email: "contact@techcorp.com",
      is_verified: true,
      jobs_count: 5,
      created_at: "2025-03-01",
    },
    {
      id: 2,
      name: "Design Studio",
      email: "hello@designstudio.com",
      is_verified: false,
      jobs_count: 2,
      created_at: "2025-03-15",
    },
    {
      id: 3,
      name: "Data Systems",
      email: "info@datasys.com",
      is_verified: false,
      jobs_count: 0,
      created_at: "2025-04-01",
    },
    {
      id: 4,
      name: "Marketing Pro",
      email: "support@marketingpro.com",
      is_verified: true,
      jobs_count: 3,
      created_at: "2025-04-05",
    },
  ];
};

const generateMockJobs = () => {
  const saved = localStorage.getItem("mock_admin_jobs");
  if (saved) return JSON.parse(saved);
  return [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company_name: "Tech Corp",
      is_featured: true,
      is_active: true,
      created_at: "2025-04-01",
    },
    {
      id: 2,
      title: "UX Designer",
      company_name: "Design Studio",
      is_featured: false,
      is_active: true,
      created_at: "2025-04-02",
    },
    {
      id: 3,
      title: "Data Engineer",
      company_name: "Data Systems",
      is_featured: false,
      is_active: true,
      created_at: "2025-04-03",
    },
    {
      id: 4,
      title: "Marketing Specialist",
      company_name: "Marketing Pro",
      is_featured: true,
      is_active: false,
      created_at: "2025-04-04",
    },
    {
      id: 5,
      title: "Backend Engineer",
      company_name: "Tech Corp",
      is_featured: false,
      is_active: true,
      created_at: "2025-04-05",
    },
  ];
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & search states
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [companySearch, setCompanySearch] = useState("");
  const [companyPage, setCompanyPage] = useState(1);
  const [jobSearch, setJobSearch] = useState("");
  const [jobPage, setJobPage] = useState(1);
  const itemsPerPage = 5;

  // Load mock data
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      setTimeout(() => {
        setUsers(generateMockUsers());
        setCompanies(generateMockCompanies());
        setJobs(generateMockJobs());
        setLoading(false);
      }, 500);
    };
    loadData();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (users.length)
      localStorage.setItem("mock_admin_users", JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    if (companies.length)
      localStorage.setItem("mock_admin_companies", JSON.stringify(companies));
  }, [companies]);
  useEffect(() => {
    if (jobs.length)
      localStorage.setItem("mock_admin_jobs", JSON.stringify(jobs));
  }, [jobs]);

  // Stats
  const stats = {
    systemHealth: "99.9%",
    revenue: "42.8k",
    totalUsers: users.length,
    totalCompanies: companies.length,
    totalJobs: jobs.length,
    pendingVerifications: companies.filter((c) => !c.is_verified).length,
  };

  // User actions
  const handleBanUser = (userId) => {
    if (window.confirm("Are you sure you want to ban this user?")) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: false } : u)),
      );
      toast.success("User banned");
    }
  };
  const handleUnbanUser = (userId) => {
    if (window.confirm("Are you sure you want to unban this user?")) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: true } : u)),
      );
      toast.success("User unbanned");
    }
  };
  const handleDeleteUser = (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted");
    }
  };

  // Company actions
  const handleVerifyCompany = (companyId) => {
    if (window.confirm("Verify this company?")) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, is_verified: true } : c)),
      );
      toast.success("Company verified");
    }
  };
  const handleDeleteCompany = (companyId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this company? This will also delete all its jobs and applications.",
      )
    ) {
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      toast.success("Company deleted");
    }
  };

  // Job actions
  const handleFeatureJob = (jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, is_featured: true } : j)),
    );
    toast.success("Job featured");
  };
  const handleUnfeatureJob = (jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, is_featured: false } : j)),
    );
    toast.success("Job unfeatured");
  };
  const handleDeleteJob = (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      toast.success("Job deleted");
    }
  };

  // Filtering and pagination helpers
  const filterUsers = () => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()),
    );
  };
  const paginateUsers = (items) => {
    const start = (userPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };
  const filterCompanies = () => {
    return companies.filter((c) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase()),
    );
  };
  const paginateCompanies = (items) => {
    const start = (companyPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };
  const filterJobs = () => {
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        j.company_name.toLowerCase().includes(jobSearch.toLowerCase()),
    );
  };
  const paginateJobs = (items) => {
    const start = (jobPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const filteredUsers = filterUsers();
  const filteredCompanies = filterCompanies();
  const filteredJobs = filterJobs();
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const totalCompanyPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const totalJobPages = Math.ceil(filteredJobs.length / itemsPerPage);

  if (loading) {
    return <div className="admin-dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="admin-info">
            <div className="admin-avatar">
              <span className="material-symbols-outlined">
                admin_panel_settings
              </span>
            </div>
            <h3>Admin Console</h3>
            <p>{user?.email || "admin@smarthire.com"}</p>
          </div>
          <nav className="sidebar-nav">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              <span className="material-symbols-outlined">dashboard</span>{" "}
              Overview
            </button>
            <button
              className={activeTab === "users" ? "active" : ""}
              onClick={() => setActiveTab("users")}
            >
              <span className="material-symbols-outlined">people</span> User
              Management
            </button>
            <button
              className={activeTab === "companies" ? "active" : ""}
              onClick={() => setActiveTab("companies")}
            >
              <span className="material-symbols-outlined">business</span>{" "}
              Company Verifications
            </button>
            <button
              className={activeTab === "jobs" ? "active" : ""}
              onClick={() => setActiveTab("jobs")}
            >
              <span className="material-symbols-outlined">work</span> Job
              Moderation
            </button>
            <button
              className={activeTab === "settings" ? "active" : ""}
              onClick={() => setActiveTab("settings")}
            >
              <span className="material-symbols-outlined">settings</span>{" "}
              Settings
            </button>
          </nav>
          <div className="sidebar-footer">
            <p className="copyright">
              © 2024 SmartHire
              <br />
              System Intelligence
            </p>
            <div className="footer-links">
              <span>System Logs</span>
              <span>Compliance</span>
              <span>API</span>
              <span>Data Privacy</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <h1>System Overview</h1>
              <p>Real-time performance and ecosystem activity metrics.</p>

              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{stats.systemHealth}</span>
                  <span className="stat-label">System Health</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">${stats.revenue}k</span>
                  <span className="stat-label">Monthly Recurring Revenue</span>
                </div>
              </div>

              <div className="ecosystem-section">
                <h2>Ecosystem Growth</h2>
                <div className="chart-container">
                  <div className="chart-controls">
                    <button>Daily</button>
                    <button>Weekly</button>
                    <button className="active">Monthly</button>
                  </div>
                  <div className="bar-chart">
                    <div className="bar-item">
                      <div className="bar-label">Week 1</div>
                      <div
                        className="bar user-reg"
                        style={{ height: "60px" }}
                      ></div>
                      <div
                        className="bar job-post"
                        style={{ height: "40px" }}
                      ></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">Week 2</div>
                      <div
                        className="bar user-reg"
                        style={{ height: "75px" }}
                      ></div>
                      <div
                        className="bar job-post"
                        style={{ height: "55px" }}
                      ></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">Week 3</div>
                      <div
                        className="bar user-reg"
                        style={{ height: "50px" }}
                      ></div>
                      <div
                        className="bar job-post"
                        style={{ height: "35px" }}
                      ></div>
                    </div>
                    <div className="bar-item">
                      <div className="bar-label">Week 4</div>
                      <div
                        className="bar user-reg"
                        style={{ height: "80px" }}
                      ></div>
                      <div
                        className="bar job-post"
                        style={{ height: "65px" }}
                      ></div>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <span className="legend-user"></span> User Registrations
                    </span>
                    <span>
                      <span className="legend-job"></span> Job Postings
                    </span>
                  </div>
                </div>
              </div>

              <div className="action-required">
                <div className="action-card">
                  <h3>ACTION REQUIRED</h3>
                  <p>
                    <strong>{stats.pendingVerifications}</strong> Companies are
                    waiting for system verification.
                  </p>
                </div>
                <div className="system-health-metrics">
                  <h3>SYSTEM HEALTH</h3>
                  <div className="metric-row">
                    <span>Main Server Cluster</span>
                    <span>18% Load</span>
                  </div>
                  <div className="metric-row">
                    <span>API Gateway Latency</span>
                    <span>42ms</span>
                  </div>
                </div>
              </div>

              <div className="critical-events">
                <h2>Critical System Events</h2>
                <p>Real-time monitoring of sensitive platform activities</p>
                <div className="events-list">
                  <div className="event-item">
                    <div className="event-icon success">
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                    </div>
                    <div className="event-details">
                      <strong>New Enterprise Registration</strong>
                      <p>TechNova Solutions registered as a Tier 3 Employer.</p>
                    </div>
                    <span className="event-time">Just now</span>
                    <span className="event-status success">SUCCESS</span>
                  </div>
                  <div className="event-item">
                    <div className="event-icon moderate">
                      <span className="material-symbols-outlined">warning</span>
                    </div>
                    <div className="event-details">
                      <strong>Flagged Job Posting</strong>
                      <p>
                        System AI flagged "Remote Python Dev" at Apex Inc for
                        suspicious links.
                      </p>
                    </div>
                    <span className="event-time">12 mins ago</span>
                    <span className="event-status moderate">MODERATE</span>
                  </div>
                  <div className="event-item">
                    <div className="event-icon pending">
                      <span className="material-symbols-outlined">pending</span>
                    </div>
                    <div className="event-details">
                      <strong>Verification Request</strong>
                      <p>
                        Starlight Creative submitted legal documents for company
                        vetting.
                      </p>
                    </div>
                    <span className="event-time">24 mins ago</span>
                    <span className="event-status pending">PENDING</span>
                  </div>
                  <div className="event-item">
                    <div className="event-icon review">
                      <span className="material-symbols-outlined">
                        security
                      </span>
                    </div>
                    <div className="event-details">
                      <strong>Abnormal Login Pattern</strong>
                      <p>
                        Detected multiple login attempts from restricted IP in
                        Admin Panel.
                      </p>
                    </div>
                    <span className="event-time">1 hour ago</span>
                    <span className="event-status review">REVIEW</span>
                  </div>
                </div>
                <button className="view-audit">View Audit Log</button>
              </div>

              <div className="report-section">
                <button className="download-reports">Download Reports</button>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="users-tab">
              <h2>User Management</h2>
              <div className="table-controls">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                />
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateUsers(filteredUsers).map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          <span
                            className={`status-badge ${u.is_active ? "active" : "banned"}`}
                          >
                            {u.is_active ? "Active" : "Banned"}
                          </span>
                        </td>
                        <td>{u.created_at}</td>
                        <td className="actions">
                          {u.is_active ? (
                            <button
                              className="ban"
                              onClick={() => handleBanUser(u.id)}
                            >
                              Ban
                            </button>
                          ) : (
                            <button
                              className="unban"
                              onClick={() => handleUnbanUser(u.id)}
                            >
                              Unban
                            </button>
                          )}
                          <button
                            className="delete"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalUserPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={userPage === 1}
                    onClick={() => setUserPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {userPage} of {totalUserPages}
                  </span>
                  <button
                    disabled={userPage === totalUserPages}
                    onClick={() => setUserPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "companies" && (
            <div className="companies-tab">
              <h2>Company Verifications</h2>
              <div className="table-controls">
                <input
                  type="text"
                  placeholder="Search by company name..."
                  value={companySearch}
                  onChange={(e) => {
                    setCompanySearch(e.target.value);
                    setCompanyPage(1);
                  }}
                />
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Verified</th>
                      <th>Jobs</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateCompanies(filteredCompanies).map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.name}</td>
                        <td>{c.email}</td>
                        <td>
                          <span
                            className={`status-badge ${c.is_verified ? "verified" : "pending"}`}
                          >
                            {c.is_verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                        <td>{c.jobs_count}</td>
                        <td>{c.created_at}</td>
                        <td className="actions">
                          {!c.is_verified && (
                            <button
                              className="verify"
                              onClick={() => handleVerifyCompany(c.id)}
                            >
                              Verify
                            </button>
                          )}
                          <button
                            className="delete"
                            onClick={() => handleDeleteCompany(c.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalCompanyPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={companyPage === 1}
                    onClick={() => setCompanyPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {companyPage} of {totalCompanyPages}
                  </span>
                  <button
                    disabled={companyPage === totalCompanyPages}
                    onClick={() => setCompanyPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="jobs-tab">
              <h2>Job Moderation</h2>
              <div className="table-controls">
                <input
                  type="text"
                  placeholder="Search by title or company..."
                  value={jobSearch}
                  onChange={(e) => {
                    setJobSearch(e.target.value);
                    setJobPage(1);
                  }}
                />
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Featured</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginateJobs(filteredJobs).map((j) => (
                      <tr key={j.id}>
                        <td>{j.id}</td>
                        <td>{j.title}</td>
                        <td>{j.company_name}</td>
                        <td>
                          <span
                            className={`status-badge ${j.is_featured ? "featured" : "normal"}`}
                          >
                            {j.is_featured ? "Featured" : "Normal"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${j.is_active ? "active" : "closed"}`}
                          >
                            {j.is_active ? "Active" : "Closed"}
                          </span>
                        </td>
                        <td>{j.created_at}</td>
                        <td className="actions">
                          {j.is_featured ? (
                            <button
                              className="unfeature"
                              onClick={() => handleUnfeatureJob(j.id)}
                            >
                              Unfeature
                            </button>
                          ) : (
                            <button
                              className="feature"
                              onClick={() => handleFeatureJob(j.id)}
                            >
                              Feature
                            </button>
                          )}
                          <button
                            className="delete"
                            onClick={() => handleDeleteJob(j.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalJobPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={jobPage === 1}
                    onClick={() => setJobPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {jobPage} of {totalJobPages}
                  </span>
                  <button
                    disabled={jobPage === totalJobPages}
                    onClick={() => setJobPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-tab">
              <h2>System Settings</h2>
              <p>
                Admin settings and preferences will appear here (coming soon).
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
