const redis = require("../config/redis");
const { logAction } = require("../middleware/auditLogger");

const LOGIN_FAILURE_LIMIT = Number(process.env.LOGIN_FAILURE_LIMIT || 10);
const LOGIN_FAILURE_WINDOW_SECONDS = Number(
  process.env.LOGIN_FAILURE_WINDOW_SECONDS || 15 * 60,
);
const LOGIN_LOCK_SECONDS = Number(process.env.LOGIN_LOCK_SECONDS || 30 * 60);

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const getFailureKey = (email) => {
  return `smart_hire:login_failures:${normalizeEmail(email)}`;
};

const getLockKey = (email) => {
  return `smart_hire:login_lock:${normalizeEmail(email)}`;
};

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
};

const safeParseJson = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

const buildAuditDetails = (req, details = {}) => {
  return {
    ...details,
    ip_address: getClientIp(req),
    user_agent: req.get("user-agent") || null,
    method: req.method,
    path: req.originalUrl,
  };
};

const formatLockDuration = (seconds) => {
  const minutes = Math.ceil(seconds / 60);

  if (minutes <= 1) {
    return "1 minute";
  }

  return `${minutes} minutes`;
};

// Checks whether the submitted email is currently locked.
const getLoginLockState = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return {
      locked: false,
      secondsRemaining: 0,
      metadata: null,
    };
  }

  const lockKey = getLockKey(normalizedEmail);
  const ttl = await redis.ttl(lockKey);

  if (ttl > 0) {
    const metadata = safeParseJson(await redis.get(lockKey));

    return {
      locked: true,
      secondsRemaining: ttl,
      metadata,
    };
  }

  // Repair a lock key if Redis has it without an expiry.
  if (ttl === -1) {
    await redis.expire(lockKey, LOGIN_LOCK_SECONDS);

    return {
      locked: true,
      secondsRemaining: LOGIN_LOCK_SECONDS,
      metadata: safeParseJson(await redis.get(lockKey)),
    };
  }

  return {
    locked: false,
    secondsRemaining: 0,
    metadata: null,
  };
};

// Records one failed login attempt and creates a 30 minute lock after 10 failures inside 15 minutes.
const recordFailedLoginAttempt = async ({
  email,
  userId = null,
  req,
  reason = "invalid_credentials",
}) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return {
      locked: false,
      attempts: 0,
      attemptsRemaining: LOGIN_FAILURE_LIMIT,
      secondsRemaining: 0,
    };
  }

  const existingLock = await getLoginLockState(normalizedEmail);

  if (existingLock.locked) {
    return {
      locked: true,
      attempts: LOGIN_FAILURE_LIMIT,
      attemptsRemaining: 0,
      secondsRemaining: existingLock.secondsRemaining,
    };
  }

  const failureKey = getFailureKey(normalizedEmail);
  const lockKey = getLockKey(normalizedEmail);

  const attempts = await redis.incr(failureKey);

  // The first failed attempt starts the 15 minute tracking window.
  if (attempts === 1) {
    await redis.expire(failureKey, LOGIN_FAILURE_WINDOW_SECONDS);
  }

  let failureTtl = await redis.ttl(failureKey);

  if (failureTtl < 0) {
    await redis.expire(failureKey, LOGIN_FAILURE_WINDOW_SECONDS);
    failureTtl = LOGIN_FAILURE_WINDOW_SECONDS;
  }

  if (attempts >= LOGIN_FAILURE_LIMIT) {
    const lockMetadata = {
      email: normalizedEmail,
      userId,
      reason,
      attempts,
      lockedAt: new Date().toISOString(),
      lockSeconds: LOGIN_LOCK_SECONDS,
      failureWindowSeconds: LOGIN_FAILURE_WINDOW_SECONDS,
      ipAddress: getClientIp(req),
      userAgent: req.get("user-agent") || null,
    };

    const multi = redis.multi();
    multi.set(lockKey, JSON.stringify(lockMetadata), "EX", LOGIN_LOCK_SECONDS);
    multi.del(failureKey);
    await multi.exec();

    logAction(
      userId,
      "LOGIN_LOCKOUT",
      buildAuditDetails(req, {
        email: normalizedEmail,
        reason,
        failed_attempts: attempts,
        lock_seconds: LOGIN_LOCK_SECONDS,
        failure_window_seconds: LOGIN_FAILURE_WINDOW_SECONDS,
      }),
    );

    return {
      locked: true,
      attempts,
      attemptsRemaining: 0,
      secondsRemaining: LOGIN_LOCK_SECONDS,
    };
  }

  return {
    locked: false,
    attempts,
    attemptsRemaining: Math.max(LOGIN_FAILURE_LIMIT - attempts, 0),
    secondsRemaining: failureTtl,
  };
};

// Successful login clears failed attempt counters for the email.
const clearLoginFailureState = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return;
  }

  await redis.del(getFailureKey(normalizedEmail));
};

module.exports = {
  getLoginLockState,
  recordFailedLoginAttempt,
  clearLoginFailureState,
  formatLockDuration,
};
