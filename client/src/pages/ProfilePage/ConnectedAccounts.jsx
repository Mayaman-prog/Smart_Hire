import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { userAPI } from "../../services/api";
import toast from "react-hot-toast";
import "./ProfilePage.css";

const ConnectedAccounts = () => {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLink = (provider) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      return toast.error(
        t("auto.login_required", { defaultValue: "Login required" }),
      );
    }

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const url = `${baseUrl}/auth/link/${provider}?token=${encodeURIComponent(token)}`;

    console.log("REDIRECT:", url);

    window.location.href = url;
  };

  const handleUnlink = async (provider) => {
    try {
      setIsLoading(true);

      const res = await userAPI.unlinkSocial(provider);

      toast.success(res.data.message || "Unlinked successfully");

      await refreshUser();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to unlink account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-card connected-accounts-card">
      <div className="card-header">
        <h2>
          {t("auto.connected_accounts", { defaultValue: "Connected Accounts" })}
        </h2>
      </div>
      <p
        className="card-content"
        style={{ paddingTop: 0, paddingBottom: "15px" }}
      >
        {t("auto.link_your_social_accounts_to_enable_additional_login_me", {
          defaultValue:
            "Link your social accounts to enable additional login methods.",
        })}
      </p>

      <div className="provider-list">
        {/* Google Row */}
        <div className="provider-row">
          <div className="provider-info">
            <span className="provider-icon google-icon">G</span>
            <div>
              <p className="provider-name">Google</p>
              {user?.google_id ? (
                <span className="status-badge linked">
                  {t("auto.linked", { defaultValue: "Linked" })}
                </span>
              ) : (
                <span className="status-badge unlinked">
                  {t("auto.not_linked", { defaultValue: "Not linked" })}
                </span>
              )}
            </div>
          </div>
          {user?.google_id ? (
            <button
              className="btn-outline-danger"
              onClick={() => handleUnlink("google")}
              disabled={isLoading}
            >
              {t("auto.unlink", { defaultValue: "Unlink" })}
            </button>
          ) : (
            <button
              className="btn-outline-primary"
              onClick={() => handleLink("google")}
              disabled={isLoading}
            >
              {t("auto.link_account", { defaultValue: "Link Account" })}
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
                <span className="status-badge linked">
                  {t("auto.linked", { defaultValue: "Linked" })}
                </span>
              ) : (
                <span className="status-badge unlinked">
                  {t("auto.not_linked", { defaultValue: "Not linked" })}
                </span>
              )}
            </div>
          </div>
          {user?.linkedin_id ? (
            <button
              className="btn-outline-danger"
              onClick={() => handleUnlink("linkedin")}
              disabled={isLoading}
            >
              {t("auto.unlink", { defaultValue: "Unlink" })}
            </button>
          ) : (
            <button
              className="btn-outline-primary"
              onClick={() => handleLink("linkedin")}
              disabled={isLoading}
            >
              {t("auto.link_account", { defaultValue: "Link Account" })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectedAccounts;
