import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError(
        t("resume.invalidFileType", {
          defaultValue: "Only .pdf, .doc, .docx files are allowed.",
        }),
      );
      return false;
    }
    if (file.size > MAX_SIZE) {
      showError(
        t("resume.fileTooLarge", {
          defaultValue: "File size must be under 5 MB.",
        }),
      );
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
      showError(
        t("resume.selectFileFirst", {
          defaultValue: "Please select a file first.",
        }),
      );
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
          showSuccess(
            t("resume.uploadSuccess", {
              defaultValue: "Resume uploaded successfully.",
            }),
          );
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

      showSuccess(
        t("resume.uploadSuccess", {
          defaultValue: "Resume uploaded successfully.",
        }),
      );
      setFile(null);
      if (onUploadSuccess) onUploadSuccess(response.data.resumeUrl);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        t("resume.uploadFailed", { defaultValue: "Resume upload failed." });
      showError(msg);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        t("resume.confirmDelete", {
          defaultValue: "Are you sure you want to delete your resume?",
        }),
      )
    )
      return;

    try {
      await userAPI.delete("/users/resume");
      showSuccess(
        t("resume.deleteSuccess", {
          defaultValue: "Resume deleted successfully.",
        }),
      );
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        t("resume.deleteFailed", { defaultValue: "Resume delete failed." });
      showError(msg);
    }
  };

  const resetFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="resume-upload-container">
      <h3>{t("auto.your_resume", { defaultValue: "Your Resume" })}</h3>

      {/* Current resume display */}
      {currentResumeUrl ? (
        <div className="current-resume">
          <p>
            {t("resume.currentFile", { defaultValue: "Current file:" })}{" "}
            <a
              href={currentResumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {decodeURIComponent(currentResumeUrl.split("/").pop())}
            </a>
          </p>
          <button
            className="btn-delete"
            onClick={handleDelete}
            type="button"
            aria-label={t("auto.delete_uploaded_resume", {
              defaultValue: "Delete uploaded resume",
            })}
          >
            {t("auto.delete_resume", { defaultValue: "Delete Resume" })}
          </button>
        </div>
      ) : (
        <p className="no-resume">
          {t("auto.no_resume_uploaded_yet", {
            defaultValue: "No resume uploaded yet.",
          })}
        </p>
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
            : t("resume.dropzoneText", {
                defaultValue:
                  "Drag & drop your resume here, or click to browse",
              })}
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx"
          style={{ display: "none" }}
          aria-label={t("auto.upload_resume_file", {
            defaultValue: "Upload resume file",
          })}
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
            {uploading
              ? t("resume.uploadingProgress", {
                  defaultValue: "Uploading {{progress}}%",
                  progress,
                })
              : t("resume.uploadTitle", { defaultValue: "Upload Resume" })}
          </button>
          <button
            className="btn-reset"
            onClick={resetFile}
            disabled={uploading}
            type="button"
            aria-label={t("auto.cancel_resume_upload", {
              defaultValue: "Cancel resume upload",
            })}
          >
            {t("auto.cancel", { defaultValue: "Cancel" })}
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
};

export default ResumeUpload;
