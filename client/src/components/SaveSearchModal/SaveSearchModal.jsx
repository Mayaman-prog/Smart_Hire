import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { jobAPI } from "../../services/api";
import Button from "../common/Button/Button";
import Input from "../common/Input/Input";
import "./SaveSearchModal.css";

// This component is a popup (modal) that lets users save their job searches
export default function SaveSearchModal({ isOpen, onClose, queryParams }) {
  // Keep track of what the user types as the search name
  const [name, setName] = useState("");

  // Keep track of how often user wants job alerts (Daily or Weekly)
  const [frequency, setFrequency] = useState("Daily");

  // When the modal opens, set a default name for the search based on today's date
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().slice(0, 10);
      setName(`Search on ${today}`);
      setFrequency("Daily");
    }
  }, [isOpen]);

  // When the user submits the form to save the search
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to send to the server
    const payload = {
      name: name.trim(),
      keyword: queryParams.keyword || "",
      location: queryParams.location || "",
      job_type: queryParams.job_type || "",
      salary_min: queryParams.salary_min
        ? Number(queryParams.salary_min)
        : undefined,
      salary_max: queryParams.salary_max
        ? Number(queryParams.salary_max)
        : undefined,
      alert_frequency: frequency.toLowerCase(),
    };

    try {
      // Send the search data to the server
      await jobAPI.post("/api/saved-searches", payload);
      toast.success("Search saved!");
      onClose();
    } catch (err) {
      // If something went wrong, show error message
      const message = err.response?.data?.message || "Could not save search.";
      toast.error(message);
    }
  };

  // Only show the modal if isOpen is true
  if (!isOpen) return null;

  // Show the modal popup
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Save This Search</h3>
        <form onSubmit={handleSubmit}>
          <Input
            label="Search Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="form-group">
            <label htmlFor="frequency">Alert Frequency</label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
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
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
