const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const setupDatabase = async () => {
  console.log("\nSetting up Smart Hire Database...\n");

  const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    port: parseInt(process.env.DB_PORT) || 3306,
    multipleStatements: true,
  };

  console.log("Connection Details:");
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}\n`);

  let connection;

  try {
    connection = await mysql.createConnection(config);
    console.log("Connected to MySQL server\n");

    await connection.query("DROP DATABASE IF EXISTS smart_hire");
    await connection.query("CREATE DATABASE smart_hire");
    await connection.query("USE smart_hire");
    console.log("Database ready\n");

    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("Creating tables...");
    await connection.query(schema);
    console.log("Schema created successfully\n");

    const seedPath = path.join(__dirname, "../database/seed.sql");
    const seed = fs.readFileSync(seedPath, "utf8");

    console.log("Inserting seed data...");
    await connection.query(seed);
    console.log("Seed data inserted successfully\n");

    const [tables] = await connection.query("SHOW TABLES");

    console.log("Database setup completed!");
    console.log(`Total Tables: ${tables.length}`);

    const counts = {};
    const tablesList = [
      "companies",
      "job_categories",
      "job_types",
      "locations",
      "skills",
      "users",
      "jobs",
      "job_seeker_skills",
      "applications",
      "resumes",
      "saved_jobs",
      "notifications",
      "shortlisted_candidates",
      "job_required_skills",
      "activity_logs",
      "audit_logs",
      "contact_messages",
    ];

    for (const table of tablesList) {
      try {
        const [result] = await connection.query(
          `SELECT COUNT(*) as count FROM ${table}`,
        );
        counts[table] = result[0].count;
      } catch (err) {
        counts[table] = 0;
      }
    }

    console.log(`Companies: ${counts.companies || 0}`);
    console.log(`Job Categories: ${counts.job_categories || 0}`);
    console.log(`Job Types: ${counts.job_types || 0}`);
    console.log(`Locations: ${counts.locations || 0}`);
    console.log(`Skills: ${counts.skills || 0}`);
    console.log(`Users: ${counts.users || 0}`);
    console.log(`Jobs: ${counts.jobs || 0}`);
    console.log(`Job Seeker Skills: ${counts.job_seeker_skills || 0}`);
    console.log(`Applications: ${counts.applications || 0}`);
    console.log(`Resumes: ${counts.resumes || 0}`);
    console.log(`Saved Jobs: ${counts.saved_jobs || 0}`);
    console.log(`Notifications: ${counts.notifications || 0}`);
    console.log(`Shortlisted: ${counts.shortlisted_candidates || 0}`);
    console.log(`Job Required Skills: ${counts.job_required_skills || 0}`);
    console.log(`Activity Logs: ${counts.activity_logs || 0}`);
    console.log(`Audit Logs: ${counts.audit_logs || 0}`);
    console.log(`Contact Messages: ${counts.contact_messages || 0}`);
  } catch (error) {
    console.error("Database setup failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

setupDatabase();
