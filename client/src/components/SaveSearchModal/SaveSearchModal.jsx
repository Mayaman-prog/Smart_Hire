import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { savedSearchAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import Button from "../common/Button/Button";
import Input from "../common/Input/Input";
import "./SaveSearchModal.css";

export default function SaveSearchModal({
  isOpen,
  onClose,
  queryParams,
  initialData = null,
  mode = "create",
  onSubmit,
  onSaveSuccess,
}) {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const modalRef = useFocusTrap(isOpen, onClose);

  // Load initial data for edit mode
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setName(initialData.name || "");
        setFrequency(
          initialData.alert_frequency
            ? initialData.alert_frequency.charAt(0).toUpperCase() +
                initialData.alert_frequency.slice(1)
            : "Daily",
        );
        setKeyword(initialData.keyword || "");
        setLocation(initialData.location || "");
        setJobType(initialData.job_type || "");
        setSalaryMin(
          initialData.salary_min !== null ? String(initialData.salary_min) : "",
        );
        setSalaryMax(
          initialData.salary_max !== null ? String(initialData.salary_max) : "",
        );
      } else {
        // Create mode: default name based on date
        const today = new Date().toISOString().slice(0, 10);
        setName(`Search on ${today}`);
        setFrequency("Daily");
        // Populate from queryParams if provided
        if (queryParams) {
          setKeyword(queryParams.keyword?.trim() || "");
          setLocation(queryParams.location?.trim() || "");
          setJobType(queryParams.job_type?.trim() || "");
          setSalaryMin(
            queryParams.salary_min ? String(queryParams.salary_min) : "",
          );
          setSalaryMax(
            queryParams.salary_max ? String(queryParams.salary_max) : "",
          );
        }
      }
    }
  }, [isOpen, mode, initialData, queryParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in.");
      return;
    }

    const payload = {
      name: name.trim() || "Untitled Search",
      keyword: keyword.trim() || null,
      location: location.trim() || null,
      job_type: jobType.trim() || null,
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      alert_frequency: frequency.toLowerCase(),
    };

    try {
      if (mode === "edit" && onSubmit) {
        await onSubmit(payload);
      } else {
        await savedSearchAPI.createSavedSearch(payload);
        toast.success("Search saved!");
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save search.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-search-modal-title"
        tabIndex="-1"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="save-search-modal-title">
          {mode === "edit" ? "Edit Saved Search" : "Save This Search"}
        </h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Search Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Additional fields for edit mode - show all criteria */}
          {mode === "edit" && (
            <>
              <div className="form-group">
                <label htmlFor="saved-search-keyword">Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="form-input"
                  id="saved-search-keyword"
                />
              </div>
              <div className="form-group">
                <label htmlFor="saved-search-location">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                  id="saved-search-location"
                />
              </div>
              <div className="form-group">
                <label htmlFor="saved-search-job-type">Job Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="form-select"
                  id="saved-search-job-type"
                >
                  <option value="">All</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="remote">Remote</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div className="form-group salary-group">
                <span className="form-label">Salary Range</span>
                <div className="salary-inputs">
                  <div>
                    <label htmlFor="salary-min" className="sr-only">
                      Minimum salary
                    </label>

                    <input
                      id="salary-min"
                      type="number"
                      placeholder="Min"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <span>to</span>

                  <div>
                    <label htmlFor="salary-max" className="sr-only">
                      Maximum salary
                    </label>

                    <input
                      id="salary-max"
                      type="number"
                      placeholder="Max"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="frequency">Alert Frequency</label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="form-select"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {mode === "edit" ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
