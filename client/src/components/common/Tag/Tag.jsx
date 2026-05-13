import React from "react";
import "./Tag.css";

const Tag = ({ type, children, removable = false, onRemove }) => {
  const getTagClass = () => {
    switch (type) {
      case "full-time":
        return "tag-full-time";
      case "part-time":
        return "tag-part-time";
      case "remote":
        return "tag-remote";
      case "contract":
        return "tag-contract";
      case "internship":
        return "tag-internship";
      case "featured":
        return "tag-featured";
      default:
        return "tag-default";
    }
  };

  const displayText = children || type?.replace("-", " ") || "Tag";

  return (
    <span className={`tag ${getTagClass()}`}>
      {displayText}
      {removable && (
        <button
          className="tag-remove-btn"
          onClick={onRemove}
          type="button"
          aria-label={`Remove ${displayText} tag`}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </span>
  );
};

export default Tag;
