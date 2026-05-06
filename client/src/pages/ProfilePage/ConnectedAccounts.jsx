import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { userAPI } from "../../services/api";
import toast from "react-hot-toast";
import "./ProfilePage.css";

const ConnectedAccounts = () => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLink = (provider) => {
    if (provider === "linkedin") {
      toast.error("LinkedIn integration is currently under maintenance.");
      return;
    }
    // Hard redirect to backend to initiate OAuth flow without logging out
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.assign(`${baseUrl}/auth/link/${provider}`);
  };

  const handleUnlink = async (provider) => {
    const confirm = window.confirm(
      `Are you sure you want to unlink your ${provider} account? You will no longer be able to log in with it.`,
    );
    if (!confirm) return;

    setIsLoading(true);
    try {
      await userAPI.unlinkSocial(provider);

      if (refreshUser) await refreshUser(); // Fetch updated user data into context
      toast.success(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} unlinked successfully.`,
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to unlink account. Ensure you have a password set before removing social logins.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-card connected-accounts-card">
      <div className="card-header">
        <h2>Connected Accounts</h2>
      </div>
      <p
        className="card-content"
        style={{ paddingTop: 0, paddingBottom: "15px" }}
      >
        Link your social accounts to enable additional login methods.
      </p>

      <div className="provider-list">
        {/* Google Row */}
        <div className="provider-row">
          <div className="provider-info">
            <span className="provider-icon google-icon">G</span>
            <div>
              <p className="provider-name">Google</p>
              {user?.google_id ? (
                <span className="status-badge linked">Linked</span>
              ) : (
                <span className="status-badge unlinked">Not linked</span>
              )}
            </div>
          </div>
          {user?.google_id ? (
            <button
              className="btn-outline-danger"
              onClick={() => handleUnlink("google")}
              disabled={isLoading}
            >
              Unlink
            </button>
          ) : (
            <button
              className="btn-outline-primary"
              onClick={() => handleLink("google")}
              disabled={isLoading}
            >
              Link Account
            </button>
          )}
        </div>

        {/* LinkedIn Row */}
        <div className="provider-row">
          <div className="provider-info">
            <span className="provider-icon linkedin-icon">in</span>
            <div>
              <p className="provider-name">LinkedIn</p>
              {user?.linkedin_id ? (
                <span className="status-badge linked">Linked</span>
              ) : (
                <span className="status-badge unlinked">Not linked</span>
              )}
            </div>
          </div>
          {user?.linkedin_id ? (
            <button
              className="btn-outline-danger"
              onClick={() => handleUnlink("linkedin")}
              disabled={isLoading}
            >
              Unlink
            </button>
          ) : (
            <button
              className="btn-outline-primary"
              onClick={() => handleLink("linkedin")}
              disabled={isLoading}
            >
              Link Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectedAccounts;
