const http = require("http");
const https = require("https");

const args = process.argv.slice(2);

const getArgValue = (name, defaultValue) => {
  const index = args.indexOf(name);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
};

const BASE_URL = getArgValue("--baseUrl", "http://localhost:5000/api");
const EMAIL = getArgValue("--email", "ramamit0315@gmail.com");
const PASSWORD = getArgValue("--password", "WrongPasswordForCsrfTest123!");

const cookieJar = {};

const printResult = (name, passed, details = "") => {
  const status = passed ? "PASS" : "FAIL";
  const symbol = passed ? "✅" : "❌";

  console.log(`${symbol} [${status}] ${name}`);

  if (details) {
    console.log(`   ${details}`);
  }
};

const saveCookies = (setCookieHeaders = []) => {
  const cookies = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : [setCookieHeaders];

  cookies.filter(Boolean).forEach((cookie) => {
    const cookiePair = cookie.split(";")[0];
    const [name, value] = cookiePair.split("=");

    if (name && value) {
      cookieJar[name.trim()] = value.trim();
    }
  });
};

const getCookieHeader = () => {
  return Object.entries(cookieJar)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
};

const request = ({ method = "GET", path = "", headers = {}, body = null }) => {
  return new Promise((resolve) => {
    const url = new URL(`${BASE_URL}${path}`);
    const isHttps = url.protocol === "https:";
    const client = isHttps ? https : http;

    const bodyString = body ? JSON.stringify(body) : null;

    const requestHeaders = {
      ...headers,
    };

    if (bodyString) {
      requestHeaders["Content-Type"] = "application/json";
      requestHeaders["Content-Length"] = Buffer.byteLength(bodyString);
    }

    const cookieHeader = getCookieHeader();

    if (cookieHeader) {
      requestHeaders.Cookie = cookieHeader;
    }

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method,
      headers: requestHeaders,
    };

    const req = client.request(options, (res) => {
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        saveCookies(res.headers["set-cookie"]);

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody,
        });
      });
    });

    req.on("error", (error) => {
      resolve({
        statusCode: 0,
        headers: {},
        body: error.message,
      });
    });

    if (bodyString) {
      req.write(bodyString);
    }

    req.end();
  });
};

const hasHeader = (headers, headerName) => {
  return Object.prototype.hasOwnProperty.call(
    headers,
    headerName.toLowerCase(),
  );
};

const runTests = async () => {
  console.log("");
  console.log("SmartHire CSRF and Security Headers Test");
  console.log(`Base URL: ${BASE_URL}`);
  console.log("");

  // Checks whether the backend API is running.
  const healthResponse = await request({
    method: "GET",
    path: "/health",
  });

  printResult(
    "Backend health route",
    healthResponse.statusCode === 200,
    `Expected 200, received ${healthResponse.statusCode}.`,
  );

  // Checks whether Helmet security headers are included in API responses.
  const requiredSecurityHeaders = [
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "cross-origin-resource-policy",
  ];

  const missingHeaders = requiredSecurityHeaders.filter(
    (header) => !hasHeader(healthResponse.headers, header),
  );

  printResult(
    "Helmet security headers",
    missingHeaders.length === 0,
    missingHeaders.length === 0
      ? "All required security headers are present."
      : `Missing headers: ${missingHeaders.join(", ")}`,
  );

  // Checks whether the global rate limiter is adding rate limit headers.
  const rateLimitHeadersPresent =
    hasHeader(healthResponse.headers, "ratelimit-limit") ||
    hasHeader(healthResponse.headers, "x-ratelimit-limit");

  printResult(
    "Rate limit headers",
    rateLimitHeadersPresent,
    "Rate limit headers confirm the global limiter is active.",
  );

  // Gets a CSRF token and stores the matching cookie in the local cookie jar.
  const csrfResponse = await request({
    method: "GET",
    path: "/csrf-token",
  });

  let csrfToken = "";

  try {
    csrfToken = JSON.parse(csrfResponse.body).csrfToken;
  } catch {
    csrfToken = "";
  }

  printResult(
    "CSRF token route",
    Boolean(csrfToken),
    csrfToken
      ? "Token received from /csrf-token."
      : "No CSRF token received.",
  );

  const loginBody = {
    email: EMAIL,
    password: PASSWORD,
  };

  // Clears cookies to prove unsafe requests fail without CSRF protection.
  Object.keys(cookieJar).forEach((key) => {
    delete cookieJar[key];
  });

  const blockedLoginResponse = await request({
    method: "POST",
    path: "/auth/login",
    body: loginBody,
  });

  const blockedByCsrf =
    blockedLoginResponse.statusCode === 403 &&
    blockedLoginResponse.body.toLowerCase().includes("csrf");

  printResult(
    "Unsafe request without CSRF token",
    blockedByCsrf,
    `Expected 403 CSRF error, received ${blockedLoginResponse.statusCode}.`,
  );

  // Requests a fresh token again so token and cookie match.
  const freshCsrfResponse = await request({
    method: "GET",
    path: "/csrf-token",
  });

  let freshCsrfToken = "";

  try {
    freshCsrfToken = JSON.parse(freshCsrfResponse.body).csrfToken;
  } catch {
    freshCsrfToken = "";
  }

  const allowedLoginResponse = await request({
    method: "POST",
    path: "/auth/login",
    headers: {
      "X-CSRF-Token": freshCsrfToken,
      "X-Requested-With": "XMLHttpRequest",
    },
    body: loginBody,
  });

  const csrfPassed =
    allowedLoginResponse.statusCode !== 403 ||
    !allowedLoginResponse.body.toLowerCase().includes("csrf");

  printResult(
    "Unsafe request with valid CSRF token",
    csrfPassed,
    `Received ${allowedLoginResponse.statusCode}. Invalid credentials still means CSRF passed.`,
  );

  console.log("");
  console.log("Test completed.");
};

runTests();