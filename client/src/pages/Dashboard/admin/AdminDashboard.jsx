import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { adminAPI } from "../../../services/api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
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
} from "recharts";
import "./AdminDashboard.css";

// Colors for the Pie Chart
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const PAGE_SIZE = 6;

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Table States
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW REPORT STATES
  const [reports, setReports] = useState([]);
  const [reportStats, setReportStats] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportPage, setReportPage] = useState(1);
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [reportReasonFilter, setReportReasonFilter] = useState("all");
  const [reportSearchTerm, setReportSearchTerm] = useState("");

  // MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionNotes, setActionNotes] = useState("");
  const [processingReportId, setProcessingReportId] = useState(null);

  // Chart Data
  const [kpiData, setKpiData] = useState([]);
  const [timelineData, setTimelineData] = useState({
    users: [],
    jobs: [],
    dates: [],
  });
  const [jobTypeData, setJobTypeData] = useState({ labels: [], values: [] });
  const [chartLoading, setChartLoading] = useState(true);

  // Date range for charts (preset or custom)
  const [dateRange, setDateRange] = useState(30);
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [datePickerMode, setDatePickerMode] = useState("preset"); // 'preset' or 'custom'
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const refreshIntervalRef = useRef(null);

  // UI States
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);

  // Job filters
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [jobPage, setJobPage] = useState(1);

  // Company filters
  const [companySearch, setCompanySearch] = useState("");
  const [companyPage, setCompanyPage] = useState(1);

  // Fetch Data (Living on the live endpoints)
  const fetchData = useCallback(async (daysParam = null) => {
    try {
      setLoading(true);
      setChartLoading(true);

      const days = daysParam !== null ? daysParam : dateRange;

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
        adminAPI.getTimeline(days),
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

      // Update last refresh timestamp
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, []);

  // Auto-refresh charts every 5 minutes if enabled
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(
        () => {
          fetchData();
        },
        5 * 60 * 1000,
      ); // Refresh every 5 minutes
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, fetchData]);

  // Handle date range changes for charts
  const handleDataRangeChange = (value) => {
    if (value === "custom") {
      setDatePickerMode("custom");
      // Don't fetch immediately, wait for user to select dates
      if (customDateRange.start && customDateRange.end) {
        const start = new Date(customDateRange.start);
        const end = new Date(customDateRange.end);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (diffDays > 0) {
          setDateRange(diffDays);
          fetchData(diffDays);
        }
      }
    } else {
      setDatePickerMode("preset");
      const days = parseInt(value, 10);
      setDateRange(days);
      fetchData(days);
    }
  };

  // Handle custom date changes
  const handleCustomDateChange = (type, value) => {
    setCustomDateRange((prev) => ({ ...prev, [type]: value }));
    if (customDateRange.start && customDateRange.end) {
      const start = new Date(customDateRange.start);
      const end = new Date(customDateRange.end);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setDateRange(diffDays);
        fetchData(diffDays);
      }
    }
  };

  const downloadCSV = (data, headers, filename = "export.csv") => {
    if (!data || data.length === 0) {
      toast.error(
        t("auto.no_data_to_export", { defaultValue: "No data to export" }),
      );
      return;
    }

    // Build CSV content
    const csvRows = [];
    // Add headers
    csvRows.push(headers.join(","));
    // Add data rows
    data.forEach((row) => {
      const values = headers.map((header) => {
        const val = row[header] !== undefined ? row[header] : "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvString], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(
      t("admin.downloadedFile", {
        defaultValue: "Downloaded {{filename}}",
        filename,
      }),
    );
  };

  // Export user growth timeline data as CSV
  const exportUsersCSV = () => {
    const data = timelineData.dates.map((date, i) => ({
      date: date,
      users: timelineData.users[i] || 0,
    }));
    downloadCSV(data, ["date", "users"], "user_growth.csv");
  };

  // Export job growth timeline data as CSV
  const exportJobTypesCSV = () => {
    const data = jobTypeData.labels.map((label, i) => ({
      type: label,
      count: jobTypeData.values[i] || 0,
    }));
    downloadCSV(data, ["type", "count"], "job_types_distribution.csv");
  };

  // Export jobs growth timeline data as CSV
  const exportJobsCSV = () => {
    const data = timelineData.dates.map((date, i) => ({
      date: date,
      jobs: timelineData.jobs[i] || 0,
    }));
    downloadCSV(data, ["date", "jobs"], "jobs_growth.csv");
  };

  // Export users table data as CSV
  const exportUsersTableCSV = () => {
    const data = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: Number(u.is_active) === 1 ? "Active" : "Inactive",
      joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : "",
    }));
    downloadCSV(
      data,
      ["id", "name", "email", "role", "status", "joined"],
      "users.csv",
    );
  };

  // Export jobs table data as CSV
  const exportJobsTableCSV = () => {
    const data = jobs.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company_name || "",
      location: j.location || "",
      type: j.job_type || "",
      status: Number(j.is_active) === 1 ? "Active" : "Inactive",
      posted: j.created_at ? new Date(j.created_at).toLocaleDateString() : "",
    }));
    downloadCSV(
      data,
      ["id", "title", "company", "location", "type", "status", "posted"],
      "jobs.csv",
    );
  };

  // Export companies table data as CSV
  const exportCompaniesTableCSV = () => {
    const data = companies.map((c) => ({
      id: c.id,
      name: c.name,
      location: c.location || "",
      jobs: c.jobs_count || 0,
      created: c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
    }));
    downloadCSV(
      data,
      ["id", "name", "location", "jobs", "created"],
      "companies.csv",
    );
  };

  const exportReportsTableCSV = () => {
    const data = reports.map((r) => ({
      id: r.id,
      job_title: r.job_title,
      reporter: r.reporter_name || "",
      reason: r.reason,
      status: r.status,
      created: r.created_at ? new Date(r.created_at).toLocaleDateString() : "",
    }));
    downloadCSV(
      data,
      ["id", "job_title", "reporter", "reason", "status", "created"],
      "reports.csv",
    );
  };

  // Fetch reports separately since it has its own filters and pagination
  const fetchReportsData = async () => {
    try {
      setReportLoading(true);
      // Build filters
      const params = {};
      if (reportStatusFilter !== "all") params.status = reportStatusFilter;
      if (reportReasonFilter !== "all") params.reason = reportReasonFilter;
      params.page = reportPage;

      const [reportsRes, statsRes] = await Promise.all([
        adminAPI.getReports(params),
        adminAPI.getReportStats(),
      ]);

      setReports(reportsRes.data?.data || []);
      setReportStats(statsRes.data?.data || null);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      toast.error(
        t("auto.failed_to_load_reports", {
          defaultValue: "Failed to load reports",
        }),
      );
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange, fetchData]);

  // Refetch reports when filters or page changes
  useEffect(() => {
    if (activeTab === "reports") {
      fetchReportsData();
    }
  }, [activeTab, reportPage, reportStatusFilter, reportReasonFilter]);

  //  Table Actions
  const toggleUser = async (id) => {
    try {
      setTogglingUserId(id);
      await adminAPI.toggleUser(id);
      await fetchData();
      toast.success(
        t("auto.user_status_updated", { defaultValue: "User status updated" }),
      );
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
      toast.success(t("auto.job_deleted", { defaultValue: "Job deleted" }));
    } catch (err) {
      console.error("Delete job error:", err);
      toast.error(err.response?.data?.message || "Failed to delete job");
    } finally {
      setDeletingJobId(null);
    }
  };

  // Open Report Resolution Modal
  const openReportModal = (report, action) => {
    console.log("🔍 openReportModal called with:", { report, action });
    if (!report || !action) {
      toast.error(
        t("auto.missing_report_data", { defaultValue: "Missing report data" }),
      );
      return;
    }

    setSelectedReport(report);
    setActionType(action);
    setActionNotes("");
    setIsModalOpen(true);
  };

  // Close Report Resolution Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedReport(null);
      setActionType(null);
      setActionNotes("");
      setProcessingReportId(null);
    }, 300);
  };

  // Confirm Report Resolution
  const confirmReportAction = async () => {
    if (!selectedReport) {
      toast.error(
        t("auto.report_data_is_missing_please_try_again", {
          defaultValue: "Report data is missing. Please try again.",
        }),
      );
      return;
    }
    if (!actionType) {
      toast.error(
        t("auto.action_type_is_missing_please_try_again", {
          defaultValue: "Action type is missing. Please try again.",
        }),
      );
      return;
    }

    try {
      setProcessingReportId(selectedReport.id);
      await adminAPI.updateReportStatus(selectedReport.id, {
        status: actionType,
        resolutionNote: actionNotes.trim(),
      });
      toast.success(
        `Report ${actionType} successfully. Reporter will be notified.`,
      );
      closeModal();
      fetchReportsData();
    } catch (err) {
      console.error("Resolve report error:", err);
      toast.error(err.response?.data?.message || "Failed to resolve report");
    } finally {
      setProcessingReportId(null);
    }
  };

  // Table Filters & Pagination
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
    if (!items || !Array.isArray(items)) {
      return [];
    }
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  };

  const getTotalPages = (items) => {
    if (!items || !Array.isArray(items)) {
      return 1;
    }
    return Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  };

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
          aria-label={t("auto.go_to_previous_page", {
            defaultValue: "Go to previous page",
          })}
        >
          {t("auto.previous", { defaultValue: "Previous" })}
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          aria-label={t("auto.go_to_next_page", {
            defaultValue: "Go to next page",
          })}
        >
          {t("auto.next", { defaultValue: "Next" })}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading" role="status" aria-live="polite">
        {t("auto.loading_admin_dashboard", {
          defaultValue: "Loading admin dashboard...",
        })}
      </div>
    );
  }

  // Render
  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <div className="admin-info">
            <div className="admin-avatar">
              <span className="material-symbols-outlined" aria-hidden="true">
                shield_person
              </span>
            </div>
            <h3>{t("auto.admin_panel", { defaultValue: "Admin Panel" })}</h3>
            <p>
              {t("auto.system_control_center", {
                defaultValue: "System control center",
              })}
            </p>
          </div>

          <nav className="sidebar-nav">
            {["overview", "users", "jobs", "companies", "reports"].map(
              (tab) => {
                // Map tab names to correct Material Symbols icons
                const iconMap = {
                  overview: "dashboard",
                  users: "group",
                  jobs: "work",
                  companies: "apartment",
                  reports: "flag",
                };

                return (
                  <button
                    key={tab}
                    className={activeTab === tab ? "active" : ""}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                    aria-label={`Open ${tab} section`}
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      {iconMap[tab]}
                    </span>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              },
            )}
          </nav>

          <div className="sidebar-footer">
            <button
              className="logout-btn"
              onClick={logout}
              type="button"
              aria-label={t("auto.logout_from_admin_dashboard", {
                defaultValue: "Logout from admin dashboard",
              })}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                logout
              </span>
              {t("auto.logout", { defaultValue: "Logout" })}
            </button>
            <div className="copyright">
              {t("auto.smarthire_admin", { defaultValue: "SmartHire Admin" })}
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          {activeTab === "overview" && (
            <>
              <div className="admin-page-header">
                <div>
                  <h1>
                    {t("auto.admin_dashboard", {
                      defaultValue: "Admin Dashboard",
                    })}
                  </h1>
                  <p>
                    {t(
                      "auto.monitor_platform_activity_and_manage_the_system_efficie",
                      {
                        defaultValue:
                          "Monitor platform activity and manage the system efficiently.",
                      },
                    )}
                  </p>
                </div>
              </div>

              <div className="dashboard-controls">
                <div className="controls-left">
                  {/* Date Range Picker */}
                  <div className="date-range-group">
                    <label htmlFor="date-range-select" className="sr-only">
                      {t("auto.select_analytics_date_range", {
                        defaultValue: "Select analytics date range",
                      })}
                    </label>
                    <select
                      id="date-range-select"
                      value={
                        datePickerMode === "custom"
                          ? "custom"
                          : String(dateRange)
                      }
                      onChange={(e) => handleDataRangeChange(e.target.value)}
                    >
                      <option value="7">
                        {t("auto.last_7_days", { defaultValue: "Last 7 Days" })}
                      </option>
                      <option value="30">
                        {t("auto.last_30_days", {
                          defaultValue: "Last 30 Days",
                        })}
                      </option>
                      <option value="90">
                        {t("auto.last_90_days", {
                          defaultValue: "Last 90 Days",
                        })}
                      </option>
                      <option value="custom">
                        {t("auto.custom", { defaultValue: "Custom..." })}
                      </option>
                    </select>
                    {datePickerMode === "custom" && (
                      <div className="custom-date-inputs">
                        <>
                          <label
                            htmlFor="custom-start-date"
                            className="sr-only"
                          >
                            {t("auto.start_date", {
                              defaultValue: "Start date",
                            })}
                          </label>

                          <input
                            id="custom-start-date"
                            type="date"
                            value={customDateRange.start}
                            onChange={(e) =>
                              handleCustomDateChange("start", e.target.value)
                            }
                          />
                        </>
                        <span aria-hidden="true">to</span>
                        <>
                          <label htmlFor="custom-end-date" className="sr-only">
                            {t("auto.end_date", { defaultValue: "End date" })}
                          </label>

                          <input
                            id="custom-end-date"
                            type="date"
                            value={customDateRange.end}
                            onChange={(e) =>
                              handleCustomDateChange("end", e.target.value)
                            }
                          />
                        </>
                      </div>
                    )}
                  </div>

                  {/* Auto-Refresh Toggle */}
                  <div className="auto-refresh-group">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        aria-label={t("auto.enable_auto_refresh", {
                          defaultValue: "Enable auto refresh",
                        })}
                        checked={autoRefresh}
                        onChange={() => setAutoRefresh(!autoRefresh)}
                      />
                      <span className="slider" aria-hidden="true"></span>
                    </label>
                    <span>
                      {t("auto.auto_refresh_5_min", {
                        defaultValue: "Auto-refresh (5 min)",
                      })}
                    </span>
                    {lastRefresh && (
                      <span className="last-refresh">
                        Last: {lastRefresh.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* KPI CARDS - LIVE DATA */}
              <div className="admin-card-grid">
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
                  <div className="empty-state">
                    {t("auto.no_kpi_data_available", {
                      defaultValue: "No KPI data available",
                    })}
                  </div>
                )}
              </div>

              {/* CHARTS SECTION - LIVE DATA */}
              <div className="admin-section">
                <div className="admin-section-header">
                  <h2>
                    {t("auto.growth_analytics", {
                      defaultValue: "Growth Analytics",
                    })}
                  </h2>
                  <span className="admin-count">
                    {t("auto.last_30_days_255749", {
                      defaultValue: "Last 30 days",
                    })}
                  </span>
                </div>

                {chartLoading ? (
                  <div className="empty-state">
                    {t("auto.loading_charts", {
                      defaultValue: "Loading charts...",
                    })}
                  </div>
                ) : (
                  <div className="charts-grid">
                    {/* LINE CHART */}
                    <div className="chart-card">
                      <div className="chart-card-header">
                        <h3>
                          {t("auto.user_growth", {
                            defaultValue: "User Growth",
                          })}
                        </h3>
                        <p>
                          {t("auto.new_users_per_day", {
                            defaultValue: "New users per day",
                          })}
                        </p>
                        <button
                          className="export-btn"
                          onClick={exportUsersCSV}
                          type="button"
                          aria-label={t("auto.download_users_csv", {
                            defaultValue: "Download users CSV",
                          })}
                        >
                          <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                          >
                            download
                          </span>{" "}
                          CSV
                        </button>
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
                            {t("auto.no_user_data_available", {
                              defaultValue: "No user data available",
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BAR CHART */}
                    <div className="chart-card">
                      <div className="chart-card-header">
                        <h3>
                          {t("auto.jobs_posted_per_day", {
                            defaultValue: "Jobs Posted per Day",
                          })}
                        </h3>
                        <p>
                          {t("auto.new_jobs_per_day", {
                            defaultValue: "New jobs per day",
                          })}
                        </p>
                        <button
                          className="export-btn"
                          onClick={exportJobsCSV}
                          type="button"
                          aria-label={t("auto.download_jobs_csv", {
                            defaultValue: "Download jobs CSV",
                          })}
                        >
                          <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                          >
                            download
                          </span>{" "}
                          CSV
                        </button>
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
                            {t("auto.no_job_data_available", {
                              defaultValue: "No job data available",
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PIE CHART (NEW - SPANS FULL WIDTH) */}
                    <div className="chart-card pie-card">
                      <div className="chart-card-header">
                        <h3>
                          {t("auto.job_type_distribution", {
                            defaultValue: "Job Type Distribution",
                          })}
                        </h3>
                        <p>
                          {t("auto.active_jobs_by_type", {
                            defaultValue: "Active jobs by type",
                          })}
                        </p>
                        <button
                          className="export-btn"
                          onClick={exportJobTypesCSV}
                          type="button"
                          aria-label={t(
                            "auto.download_job_type_analytics_csv",
                            { defaultValue: "Download job type analytics CSV" },
                          )}
                        >
                          <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                          >
                            download
                          </span>{" "}
                          CSV
                        </button>
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
                            {t("auto.no_job_type_data_available", {
                              defaultValue: "No job type data available",
                            })}
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
                    <h2>
                      {t("auto.recent_users", { defaultValue: "Recent Users" })}
                    </h2>
                    <button
                      className="export-btn"
                      onClick={exportUsersTableCSV}
                      type="button"
                      aria-label={t("auto.download_users_csv", {
                        defaultValue: "Download users CSV",
                      })}
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        download
                      </span>{" "}
                      CSV
                    </button>
                  </div>
                  {users.length === 0 ? (
                    <div className="empty-state">
                      {t("auto.no_recent_users", {
                        defaultValue: "No recent users.",
                      })}
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>{t("auto.name", { defaultValue: "Name" })}</th>
                            <th>
                              {t("auto.email", { defaultValue: "Email" })}
                            </th>
                            <th>{t("auto.role", { defaultValue: "Role" })}</th>
                            <th>
                              {t("auto.joined", { defaultValue: "Joined" })}
                            </th>
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
                    <h2>
                      {t("auto.recent_jobs", { defaultValue: "Recent Jobs" })}
                    </h2>
                    <button
                      className="export-btn"
                      onClick={exportJobsTableCSV}
                      type="button"
                      aria-label={t("auto.download_jobs_csv", {
                        defaultValue: "Download jobs CSV",
                      })}
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        download
                      </span>{" "}
                      CSV
                    </button>
                  </div>
                  {jobs.length === 0 ? (
                    <div className="empty-state">
                      {t("auto.no_jobs_posted_yet", {
                        defaultValue: "No jobs posted yet.",
                      })}
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>
                              {t("auto.title", { defaultValue: "Title" })}
                            </th>
                            <th>
                              {t("auto.company", { defaultValue: "Company" })}
                            </th>
                            <th>
                              {t("auto.status", { defaultValue: "Status" })}
                            </th>
                            <th>
                              {t("auto.posted", { defaultValue: "Posted" })}
                            </th>
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

          {/* Existing User/Jobs tabs */}
          {activeTab === "users" && (
            <section className="admin-section">
              <div className="admin-section-header">
                <h2>{t("auto.users", { defaultValue: "Users" })}</h2>
                <span className="admin-count">
                  {filteredUsers.length} matched / {stats.totalUsers} total
                </span>
              </div>
              <div className="table-controls admin-filters">
                <label htmlFor="user-search" className="sr-only">
                  {t("auto.search_users_by_name_or_email", {
                    defaultValue: "Search users by name or email",
                  })}
                </label>
                <input
                  type="text"
                  id="user-search"
                  placeholder={t("auto.search_by_name_or_email", {
                    defaultValue: "Search by name or email",
                  })}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <label htmlFor="user-role-filter" className="sr-only">
                  {t("auto.filter_users_by_role", {
                    defaultValue: "Filter users by role",
                  })}
                </label>
                <select
                  id="user-role-filter"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">
                    {t("auto.all_roles", { defaultValue: "All roles" })}
                  </option>
                  <option value="job_seeker">
                    {t("auto.job_seeker", { defaultValue: "Job Seeker" })}
                  </option>
                  <option value="employer">
                    {t("auto.employer", { defaultValue: "Employer" })}
                  </option>
                  <option value="admin">
                    {t("auto.admin", { defaultValue: "Admin" })}
                  </option>
                </select>
                <label htmlFor="user-status-filter" className="sr-only">
                  {t("auto.filter_users_by_status", {
                    defaultValue: "Filter users by status",
                  })}
                </label>
                <select
                  id="user-status-filter"
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                >
                  <option value="all">
                    {t("auto.all_statuses", { defaultValue: "All statuses" })}
                  </option>
                  <option value="active">
                    {t("auto.active", { defaultValue: "Active" })}
                  </option>
                  <option value="inactive">
                    {t("auto.inactive", { defaultValue: "Inactive" })}
                  </option>
                </select>
              </div>
              {filteredUsers.length === 0 ? (
                <div className="empty-state">
                  {t("auto.no_users_found", {
                    defaultValue: "No users found.",
                  })}
                </div>
              ) : (
                <>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{t("auto.name", { defaultValue: "Name" })}</th>
                          <th>{t("auto.email", { defaultValue: "Email" })}</th>
                          <th>{t("auto.role", { defaultValue: "Role" })}</th>
                          <th>
                            {t("auto.status", { defaultValue: "Status" })}
                          </th>
                          <th>
                            {t("auto.created", { defaultValue: "Created" })}
                          </th>
                          <th>
                            {t("auto.actions", { defaultValue: "Actions" })}
                          </th>
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
                                className={`admin-btn`}
                                type="button"
                                aria-label={
                                  Number(u.is_active) === 1
                                    ? `Deactivate ${u.name}`
                                    : `Activate ${u.name}`
                                }
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
                <h2>{t("auto.jobs", { defaultValue: "Jobs" })}</h2>
                <span className="admin-count">
                  {filteredJobs.length} matched / {stats.totalJobs} total
                </span>
              </div>
              <div className="table-controls admin-filters">
                <label htmlFor="job-search" className="sr-only">
                  {t("auto.search_jobs", { defaultValue: "Search jobs" })}
                </label>
                <input
                  type="text"
                  id="job-search"
                  placeholder={t("auto.search_title_company_or_location", {
                    defaultValue: "Search title, company, or location",
                  })}
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                />
                <label htmlFor="job-status-filter" className="sr-only">
                  {t("auto.filter_jobs_by_status", {
                    defaultValue: "Filter jobs by status",
                  })}
                </label>
                <select
                  id="job-status-filter"
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                >
                  <option value="all">
                    {t("auto.all_statuses", { defaultValue: "All statuses" })}
                  </option>
                  <option value="active">
                    {t("auto.active", { defaultValue: "Active" })}
                  </option>
                  <option value="inactive">
                    {t("auto.inactive", { defaultValue: "Inactive" })}
                  </option>
                </select>
                <label htmlFor="job-type-filter" className="sr-only">
                  {t("auto.filter_jobs_by_type", {
                    defaultValue: "Filter jobs by type",
                  })}
                </label>
                <select
                  id="job-type-filter"
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                >
                  <option value="all">
                    {t("auto.all_job_types", { defaultValue: "All job types" })}
                  </option>
                  <option value="full-time">
                    {t("auto.full_time_ef04db", {
                      defaultValue: "Full\u2011time",
                    })}
                  </option>
                  <option value="part-time">
                    {t("auto.part_time_fc0764", {
                      defaultValue: "Part\u2011time",
                    })}
                  </option>
                  <option value="remote">
                    {t("auto.remote", { defaultValue: "Remote" })}
                  </option>
                  <option value="contract">
                    {t("auto.contract", { defaultValue: "Contract" })}
                  </option>
                  <option value="internship">
                    {t("auto.internship", { defaultValue: "Internship" })}
                  </option>
                </select>
              </div>
              {filteredJobs.length === 0 ? (
                <div className="empty-state">
                  {t("auto.no_jobs_found", { defaultValue: "No jobs found." })}
                </div>
              ) : (
                <>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{t("auto.title", { defaultValue: "Title" })}</th>
                          <th>
                            {t("auto.company", { defaultValue: "Company" })}
                          </th>
                          <th>
                            {t("auto.location", { defaultValue: "Location" })}
                          </th>
                          <th>
                            {t("auto.job_type", { defaultValue: "Job Type" })}
                          </th>
                          <th>
                            {t("auto.status", { defaultValue: "Status" })}
                          </th>
                          <th>
                            {t("auto.posted", { defaultValue: "Posted" })}
                          </th>
                          <th>
                            {t("auto.actions", { defaultValue: "Actions" })}
                          </th>
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
                                type="button"
                                aria-label={`Delete ${j.title}`}
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
                <h2>{t("auto.companies", { defaultValue: "Companies" })}</h2>
                <button
                  className="export-btn"
                  onClick={exportCompaniesTableCSV}
                  type="button"
                  aria-label={t("auto.download_companies_csv", {
                    defaultValue: "Download companies CSV",
                  })}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    download
                  </span>{" "}
                  CSV
                </button>
                <span className="admin-count">
                  {filteredCompanies.length} matched / {stats.totalCompanies}{" "}
                  total
                </span>
              </div>
              <div className="table-controls admin-filters">
                <label htmlFor="company-search" className="sr-only">
                  {t("auto.search_companies", {
                    defaultValue: "Search companies",
                  })}
                </label>
                <input
                  type="text"
                  id="company-search"
                  placeholder={t("auto.search_company_or_location", {
                    defaultValue: "Search company or location",
                  })}
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                />
              </div>
              {filteredCompanies.length === 0 ? (
                <div className="empty-state">
                  {t("auto.no_companies_found_47524e", {
                    defaultValue: "No companies found.",
                  })}
                </div>
              ) : (
                <>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{t("auto.name", { defaultValue: "Name" })}</th>
                          <th>
                            {t("auto.location", { defaultValue: "Location" })}
                          </th>
                          <th>
                            {t("auto.created", { defaultValue: "Created" })}
                          </th>
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

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <section className="admin-section">
              <div className="admin-section-header">
                <h2>
                  {t("auto.reports_queue", { defaultValue: "Reports Queue" })}
                </h2>
                <button
                  className="export-btn"
                  onClick={exportReportsTableCSV}
                  type="button"
                  aria-label={t("auto.download_reports_csv", {
                    defaultValue: "Download reports CSV",
                  })}
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    download
                  </span>{" "}
                  CSV
                </button>
                <span className="admin-count">
                  {reportStats ? (
                    <>
                      {t("auto.pending", { defaultValue: "Pending:" })}
                      <strong>{reportStats.pending}</strong> | Total:{" "}
                      <strong>{reportStats.total}</strong>
                    </>
                  ) : (
                    "Loading stats..."
                  )}
                </span>
              </div>

              {/* Filters */}
              <div className="table-controls admin-filters">
                <div
                  className="filter-group"
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    flex: 1,
                  }}
                >
                  <label htmlFor="report-status-filter" className="sr-only">
                    {t("auto.filter_reports_by_status", {
                      defaultValue: "Filter reports by status",
                    })}
                  </label>
                  <select
                    id="report-status-filter"
                    value={reportStatusFilter}
                    onChange={(e) => {
                      setReportStatusFilter(e.target.value);
                      setReportPage(1);
                    }}
                  >
                    <option value="all">
                      {t("auto.all_status", { defaultValue: "All Status" })}
                    </option>
                    <option value="pending">
                      {t("auto.pending_2d13df", { defaultValue: "Pending" })}
                    </option>
                    <option value="approved">
                      {t("auto.approved", { defaultValue: "Approved" })}
                    </option>
                    <option value="removed">
                      {t("auto.removed", { defaultValue: "Removed" })}
                    </option>
                    <option value="dismissed">
                      {t("auto.dismissed", { defaultValue: "Dismissed" })}
                    </option>
                  </select>

                  <label htmlFor="report-reason-filter" className="sr-only">
                    {t("auto.filter_reports_by_reason", {
                      defaultValue: "Filter reports by reason",
                    })}
                  </label>
                  <select
                    id="report-reason-filter"
                    value={reportReasonFilter}
                    onChange={(e) => {
                      setReportReasonFilter(e.target.value);
                      setReportPage(1);
                    }}
                  >
                    <option value="all">
                      {t("auto.all_reasons", { defaultValue: "All Reasons" })}
                    </option>
                    <option value="spam">
                      {t("auto.spam", { defaultValue: "Spam" })}
                    </option>
                    <option value="fraud">
                      {t("auto.fraud", { defaultValue: "Fraud" })}
                    </option>
                    <option value="inappropriate">
                      {t("auto.inappropriate", {
                        defaultValue: "Inappropriate",
                      })}
                    </option>
                    <option value="duplicate">
                      {t("auto.duplicate", { defaultValue: "Duplicate" })}
                    </option>
                    <option value="other">
                      {t("auto.other", { defaultValue: "Other" })}
                    </option>
                  </select>
                </div>
                <span className="admin-count">
                  {reports.length} reports loaded
                </span>
              </div>

              {/* Reports Table */}
              {reportLoading ? (
                <div className="empty-state">
                  {t("auto.loading_reports", {
                    defaultValue: "Loading reports...",
                  })}
                </div>
              ) : reports.length === 0 ? (
                <div className="empty-state">
                  {t("auto.no_reports_found_matching_your_criteria", {
                    defaultValue: "No reports found matching your criteria.",
                  })}
                </div>
              ) : (
                <>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{t("auto.id", { defaultValue: "ID" })}</th>
                          <th>
                            {t("auto.job_title", { defaultValue: "Job Title" })}
                          </th>
                          <th>
                            {t("auto.reporter", { defaultValue: "Reporter" })}
                          </th>
                          <th>
                            {t("auto.reason", { defaultValue: "Reason" })}
                          </th>
                          <th>
                            {t("auto.status", { defaultValue: "Status" })}
                          </th>
                          <th>
                            {t("auto.actions", { defaultValue: "Actions" })}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {!reports ||
                        !Array.isArray(reports) ||
                        reports.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              style={{
                                textAlign: "center",
                                color: "var(--gray-color)",
                              }}
                            >
                              {t(
                                "auto.no_reports_found_matching_your_criteria",
                                {
                                  defaultValue:
                                    "No reports found matching your criteria.",
                                },
                              )}
                            </td>
                          </tr>
                        ) : (
                          reports.map((report) => (
                            <tr key={report.id}>
                              <td>#{report.id}</td>
                              <td>
                                <strong>{report.job_title}</strong>
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--gray-color)",
                                  }}
                                >
                                  ID: {report.job_id}
                                </div>
                              </td>
                              <td>{report.reporter_name || "Unknown"}</td>
                              <td>
                                <span className="status-badge active">
                                  {(report.reason || "Other").toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`status-badge ${report.status === "pending" ? "inactive" : "active"}`}
                                >
                                  {report.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="actions">
                                {report.status === "pending" && (
                                  <>
                                    <button
                                      className="table-action-btn approve"
                                      type="button"
                                      aria-label={`Approve report for ${report.job_title}`}
                                      onClick={() =>
                                        openReportModal(report, "approved")
                                      }
                                      disabled={
                                        processingReportId === report.id
                                      }
                                    >
                                      <span
                                        className="material-symbols-outlined"
                                        aria-hidden="true"
                                        style={{ fontSize: "16px" }}
                                      >
                                        check_circle
                                      </span>
                                      {t("auto.approve", {
                                        defaultValue: "Approve",
                                      })}
                                    </button>
                                    <button
                                      className="table-action-btn dismiss"
                                      type="button"
                                      aria-label={`Dismiss report for ${report.job_title}`}
                                      onClick={() =>
                                        openReportModal(report, "dismissed")
                                      }
                                      disabled={
                                        processingReportId === report.id
                                      }
                                    >
                                      <span
                                        className="material-symbols-outlined"
                                        aria-hidden="true"
                                        style={{ fontSize: "16px" }}
                                      >
                                        block
                                      </span>
                                      {t("auto.dismiss", {
                                        defaultValue: "Dismiss",
                                      })}
                                    </button>
                                    <button
                                      className="table-action-btn remove"
                                      type="button"
                                      aria-label={`Remove reported job ${report.job_title}`}
                                      onClick={() =>
                                        openReportModal(report, "removed")
                                      }
                                      disabled={
                                        processingReportId === report.id
                                      }
                                    >
                                      <span
                                        className="material-symbols-outlined"
                                        aria-hidden="true"
                                        style={{ fontSize: "16px" }}
                                      >
                                        delete
                                      </span>
                                      {t("auto.remove_job", {
                                        defaultValue: "Remove Job",
                                      })}
                                    </button>
                                  </>
                                )}
                                {report.status !== "pending" && (
                                  <span
                                    style={{
                                      fontSize: "0.85rem",
                                      color: "var(--gray-color)",
                                    }}
                                  >
                                    {t("auto.resolved", {
                                      defaultValue: "Resolved",
                                    })}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {renderPagination(
                    reportPage,
                    setReportPage,
                    reportStats ? Math.ceil(reportStats.total / PAGE_SIZE) : 1,
                  )}
                </>
              )}
            </section>
          )}
        </main>
      </div>

      {/* RESOLUTION MODAL - Only render when data is ready */}
      {isModalOpen && selectedReport && actionType && (
        <div
          className="modal-overlay active"
          aria-hidden="true"
          onClick={closeModal}
        >
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resolve-report-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="resolve-report-title">
              {t("auto.resolve_report", { defaultValue: "Resolve Report" })}
            </h3>
            <p style={{ marginBottom: "16px" }}>
              <strong>{t("auto.action", { defaultValue: "Action:" })}</strong>{" "}
              <span className="capitalize-text">{actionType}</span>
              <br />
              <strong>{t("auto.job", { defaultValue: "Job:" })}</strong>{" "}
              {selectedReport?.job_title}
            </p>
            <div className="form-group">
              <label htmlFor="notes">
                {t("auto.resolution_notes_optional", {
                  defaultValue: "Resolution Notes (Optional)",
                })}
              </label>
              <textarea
                id="notes"
                rows="3"
                placeholder={t("auto.add_internal_notes_for_this_resolution", {
                  defaultValue: "Add internal notes for this resolution...",
                })}
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "20px",
              }}
            >
              <button
                className="admin-btn admin-btn-neutral"
                type="button"
                onClick={closeModal}
              >
                {t("auto.cancel", { defaultValue: "Cancel" })}
              </button>
              <button
                className={`admin-btn ${actionType === "removed" ? "admin-btn-danger" : "admin-btn-primary"}`}
                type="button"
                onClick={confirmReportAction}
                disabled={processingReportId === selectedReport?.id}
              >
                {processingReportId === selectedReport?.id
                  ? "Processing..."
                  : `Confirm ${actionType}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
