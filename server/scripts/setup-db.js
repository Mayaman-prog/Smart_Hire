const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const setupDatabase = async () => {
    console.log('\nSetting up Smart Hire Database...\n');

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: parseInt(process.env.DB_PORT) || 3306,
        multipleStatements: true
    };

    console.log('Connection Details:');
    console.log(`Host: ${config.host}`);
    console.log(`Port: ${config.port}`);
    console.log(`User: ${config.user}\n`);

    let connection;

    try {
        connection = await mysql.createConnection(config);
        console.log('Connected to MySQL server\n');

        // Drop database if exists (clean slate)
        await connection.query('DROP DATABASE IF EXISTS smart_hire');
        console.log('Dropped existing database');

        // Create database
        await connection.query('CREATE DATABASE smart_hire');
        console.log('Created database');

        // Use database
        await connection.query('USE smart_hire');
        console.log('Using database\n');

        // Read and execute schema.sql
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Creating tables...');
        await connection.query(schema);
        console.log('Schema created successfully\n');

        // Read and execute seed.sql
        const seedPath = path.join(__dirname, '../database/seed.sql');
        const seed = fs.readFileSync(seedPath, 'utf8');
        
        console.log('Inserting seed data...');
        await connection.query(seed);
        console.log('Seed data inserted successfully\n');

        // Verify data
        const [companies] = await connection.query('SELECT COUNT(*) as count FROM companies');
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
        const [jobs] = await connection.query('SELECT COUNT(*) as count FROM jobs');
        const [applications] = await connection.query('SELECT COUNT(*) as count FROM applications');

        console.log('Database setup completed!');
        console.log(`Companies: ${companies[0].count}`);
        console.log(`Users: ${users[0].count}`);
        console.log(`Jobs: ${jobs[0].count}`);
        console.log(`Applications: ${applications[0].count}`);

    } catch (error) {
        console.error('Database setup failed:', error.message);
        console.error('Details:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
};

setupDatabase();