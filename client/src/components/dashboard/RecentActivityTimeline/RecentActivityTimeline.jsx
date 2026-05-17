import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import {
  applicationAPI,
  savedJobsAPI,
  notificationAPI,
} from "../../../services/api";
import "./RecentActivityTimeline.css";

const DEFAULT_LIMIT = 10;

/*
  This helper safely extracts array data from an API response.
  It supports different backend response styles such as:
  response.data
  response.data.data
*/
const getResponseData = (result) => {
  if (result.status !== "fulfilled") return [];

  const responseData = result.value?.data?.data || result.value?.data || [];

  return Array.isArray(responseData) ? responseData : [];
};

/*
  This helper converts a date value into a valid Date object.
  If the date is missing or invalid, it returns a very old date.
  This prevents sorting errors.
*/
const getTimestamp = (value) => {
  const date = value ? new Date(value) : null;

  return date && !Number.isNaN(date.getTime()) ? date : new Date(0);
};

/*
  This helper gets the job id from different possible response structures.
  Some APIs return job.id, while others return job_id directly.
*/
const getJobId = (item) => item?.job?.id || item?.job_id || item?.id;

/*
  This function converts application data into one timeline activity item.
*/
const normaliseApplicationActivity = (application) => {
  const jobId = getJobId(application);

  return {
    id: `application-${application.application_id || application.id || jobId}`,
    type: "application",
    icon: "send",
    timestamp: application.applied_at || application.created_at,
    link: jobId ? `/jobs/${jobId}` : "/dashboard/seeker/applied-jobs",
    jobTitle:
      application.job?.title ||
      application.job_title ||
      application.title ||
      "this job",
    companyName: application.job?.company_name || application.company_name,
    status: application.status,
  };
};

/*
  This function converts saved job data into one timeline activity item.
*/
const normaliseSavedJobActivity = (savedJob) => {
  const jobId = savedJob.job_id || savedJob.id;

  return {
    id: `saved-job-${savedJob.saved_id || savedJob.id || jobId}`,
    type: "savedJob",
    icon: "bookmark",
    timestamp: savedJob.saved_at || savedJob.created_at,
    link: jobId ? `/jobs/${jobId}` : "/dashboard/seeker/saved-jobs",
    jobTitle: savedJob.title || savedJob.job_title || "this job",
    companyName: savedJob.company_name,
  };
};

/*
  This function converts notification or alert data into one timeline activity item.
*/
const normaliseAlertActivity = (notification) => ({
  id: `alert-${notification.id}`,
  type: "alert",
  icon:
    notification.type === "job_alert"
      ? "notifications_active"
      : "notifications",
  timestamp: notification.created_at,
  link: notification.link || "/dashboard/seeker",
  title: notification.title,
  description: notification.message,
  unread: notification.is_read === 0 || notification.is_read === false,
});

/*
  This function combines applications, saved jobs, and alerts into one list.
  It then sorts the items from newest to oldest and limits the result to 10 items.
*/
const buildActivityItems = ({
  applications,
  savedJobs,
  notifications,
  limit,
}) => {
  const activityItems = [
    ...applications.map(normaliseApplicationActivity),
    ...savedJobs.map(normaliseSavedJobActivity),
    ...notifications.map(normaliseAlertActivity),
  ];

  return activityItems
    .filter((item) => item.timestamp)
    .sort((a, b) => getTimestamp(b.timestamp) - getTimestamp(a.timestamp))
    .slice(0, limit);
};

const RecentActivityTimeline = ({ limit = DEFAULT_LIMIT, className = "" }) => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  /*
    This formatter displays the activity date and time based on the active language.
  */
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language || "en", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [i18n.language],
  );

  useEffect(() => {
    let isMounted = true;

    /*
      The activity timeline is only shown to authenticated job seekers.
      This prevents employers and admins from seeing job seeker activity logic.
    */
    if (!isAuthenticated || !user || user.role !== "job_seeker") {
      setActivities([]);
      setLoading(false);
      setError(false);

      return () => {
        isMounted = false;
      };
    }

    /*
      This function fetches all activity-related data in parallel.
      Promise.allSettled is used so that one failed request does not break the whole panel.
    */
    const fetchRecentActivity = async () => {
      setLoading(true);
      setError(false);

      const results = await Promise.allSettled([
        applicationAPI.getMyApplications(),
        savedJobsAPI.getSavedJobs(),
        notificationAPI.getNotifications(),
      ]);

      if (!isMounted) return;

      const allRequestsFailed = results.every(
        (result) => result.status === "rejected",
      );

      /*
        If all requests fail, the component shows an error message.
        If only one request fails, the component still displays available activity.
      */
      if (allRequestsFailed) {
        console.error(
          "Recent activity error:",
          results.map((result) => result.reason),
        );

        setActivities([]);
        setError(true);
        setLoading(false);
        return;
      }

      const [applicationsResult, savedJobsResult, notificationsResult] =
        results;

      setActivities(
        buildActivityItems({
          applications: getResponseData(applicationsResult),
          savedJobs: getResponseData(savedJobsResult),
          notifications: getResponseData(notificationsResult),
          limit,
        }),
      );

      setLoading(false);
    };

    fetchRecentActivity();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, limit, user]);

  /*
    This helper formats activity dates safely for display.
  */
  const formatDate = (value) => {
    const date = getTimestamp(value);

    return date.getTime() === 0 ? "" : formatter.format(date);
  };

  /*
    This helper returns translated title, label, and description text
    depending on the activity type.
  */
  const getActivityCopy = (activity) => {
    if (activity.type === "application") {
      return {
        label: t("activityTimeline.applicationLabel", {
          defaultValue: "Application",
        }),
        title: t("activityTimeline.applicationTitle", {
          defaultValue: "Applied for {{jobTitle}}",
          jobTitle: activity.jobTitle,
        }),
        description: activity.companyName
          ? t("activityTimeline.applicationDescriptionWithCompany", {
              defaultValue: "Application submitted to {{companyName}}",
              companyName: activity.companyName,
            })
          : t("activityTimeline.applicationDescription", {
              defaultValue: "Application submitted",
            }),
      };
    }

    if (activity.type === "savedJob") {
      return {
        label: t("activityTimeline.savedJobLabel", {
          defaultValue: "Saved job",
        }),
        title: t("activityTimeline.savedJobTitle", {
          defaultValue: "Saved {{jobTitle}}",
          jobTitle: activity.jobTitle,
        }),
        description: activity.companyName
          ? t("activityTimeline.savedJobDescriptionWithCompany", {
              defaultValue: "Saved from {{companyName}}",
              companyName: activity.companyName,
            })
          : t("activityTimeline.savedJobDescription", {
              defaultValue: "Job saved for later review",
            }),
      };
    }

    return {
      label: t("activityTimeline.alertLabel", {
        defaultValue: "Alert",
      }),
      title:
        activity.title ||
        t("activityTimeline.alertTitle", {
          defaultValue: "New job alert",
        }),
      description:
        activity.description ||
        t("activityTimeline.alertDescription", {
          defaultValue: "You received a new alert",
        }),
    };
  };

  /*
    Nothing is rendered for users who should not see the job seeker timeline.
  */
  if (!isAuthenticated || !user || user.role !== "job_seeker") {
    return null;
  }

  return (
    <section
      className={`recent-activity-timeline ${className}`.trim()}
      aria-labelledby="recent-activity-heading"
    >
      <div className="recent-activity-header">
        <div>
          <h2 id="recent-activity-heading" className="section-title">
            {t("activityTimeline.title", {
              defaultValue: "Recent Activity",
            })}
          </h2>

          <p className="recent-activity-subtitle">
            {t("activityTimeline.subtitle", {
              defaultValue:
                "Your latest applications, saved jobs, and alerts in one place.",
            })}
          </p>
        </div>
      </div>

      {loading ? (
        <div
          className="recent-activity-status"
          role="status"
          aria-live="polite"
        >
          {t("activityTimeline.loading", {
            defaultValue: "Loading recent activity...",
          })}
        </div>
      ) : error ? (
        <div className="recent-activity-status" role="alert">
          {t("activityTimeline.error", {
            defaultValue: "Could not load recent activity right now.",
          })}
        </div>
      ) : activities.length > 0 ? (
        <ol
          className="recent-activity-list"
          aria-label={t("activityTimeline.listLabel", {
            defaultValue: "Recent activity sorted from newest to oldest",
          })}
        >
          {activities.map((activity) => {
            const copy = getActivityCopy(activity);
            const activityTime = formatDate(activity.timestamp);

            return (
              <li key={activity.id} className="recent-activity-item">
                <span className="recent-activity-icon" aria-hidden="true">
                  <span className="material-symbols-outlined">
                    {activity.icon}
                  </span>
                </span>

                <div className="recent-activity-content">
                  <div className="recent-activity-meta-row">
                    <span className="recent-activity-label">{copy.label}</span>

                    {activity.unread && (
                      <span className="recent-activity-unread">
                        {t("activityTimeline.newBadge", {
                          defaultValue: "New",
                        })}
                      </span>
                    )}
                  </div>

                  <Link
                    to={activity.link}
                    className="recent-activity-link"
                    aria-label={t("activityTimeline.openActivity", {
                      defaultValue: "Open activity: {{title}}",
                      title: copy.title,
                    })}
                  >
                    {copy.title}
                  </Link>

                  <p className="recent-activity-description">
                    {copy.description}
                  </p>

                  {activityTime && (
                    <time
                      className="recent-activity-time"
                      dateTime={getTimestamp(activity.timestamp).toISOString()}
                    >
                      {activityTime}
                    </time>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="recent-activity-status recent-activity-empty">
          {t("activityTimeline.empty", {
            defaultValue:
              "No recent activity yet. Apply, save jobs, or create alerts to see updates here.",
          })}
        </div>
      )}
    </section>
  );
};

export default RecentActivityTimeline;
