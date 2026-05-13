import React, { useState, useRef } from "react";
import { userAPI } from "../../../services/api";
import { showSuccess, showError } from "../Toast/Toast";
import "./ResumeUpload.css";

// Allowed file types and max size for resume uploads
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Temporary flag to use mock API responses during development
const USE_MOCK = true;

// Component for uploading and managing user's resume
const ResumeUpload = ({
  currentResumeUrl,
  onUploadSuccess,
  onDeleteSuccess,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError("Only .pdf, .doc, .docx files are allowed.");
      return false;
    }
    if (file.size > MAX_SIZE) {
      showError("File size must be under 5 MB.", "error");
      return false;
    }
    return true;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showError("Please select a file first.", "error");
      return;
    }

    if (USE_MOCK) {
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 200);

      // Simulate success after ~2 seconds
      setTimeout(() => {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          const mockResponse = {
            data: { resumeUrl: "/uploads/resumes/sample-resume.pdf" },
          };
          showSuccess("Resume uploaded successfully!");
          setFile(null);
          if (onUploadSuccess) onUploadSuccess(mockResponse.data.resumeUrl);
          setUploading(false);
          setProgress(0);
        }, 300);
      }, 2000);
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    setProgress(0);
    try {
      const response = await userAPI.post("/users/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setProgress(percent);
        },
      });

      showSuccess("Resume uploaded successfully!");
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(response.data.resumeUrl);
    } catch (error) {
      const msg = error.response?.data?.message || "Upload failed.";
      showToast(msg, "error");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your resume?")) return;

    try {
      await userAPI.delete("/users/resume");
      showSuccess("Resume deleted successfully.");
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || "Delete failed.";
      showError(msg, "error");
    }
  };

  const resetFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="resume-upload-container">
      <h3>Your Resume</h3>

      {/* Current resume display */}
      {currentResumeUrl ? (
        <div className="current-resume">
          <p>
            Current file:{" "}
            <a
              href={currentResumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {decodeURIComponent(currentResumeUrl.split("/").pop())}
            </a>
          </p>
          <button className="btn-delete" onClick={handleDelete} type="button" aria-label="Delete uploaded resume">
            Delete Resume
          </button>
        </div>
      ) : (
        <p className="no-resume">No resume uploaded yet.</p>
      )}

      {/* Dropzone */}
      <div
        className={`dropzone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <p className="dropzone-text">
          {file
            ? file.name
            : "Drag & drop your resume here, or click to browse"}
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          aria-label="Upload resume file"
        />
      </div>

      {/* File actions */}
      {file && (
        <div className="file-actions">
          <button
            className="btn-upload"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? `Uploading ${progress}%` : "Upload Resume"}
          </button>
          <button
            className="btn-reset"
            onClick={resetFile}
            disabled={uploading}
            type="button"
            aria-label="Cancel resume upload"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Progress bar */}
      {uploading && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            <span className="progress-text">{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
