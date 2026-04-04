# Smart_Hire - Smart Job Portal System
Project Overview

SmartHire is a modern full-stack job portal web application that connects job seekers, employers, and administrators in a single platform.

Roles:
Job Seekers – Search and apply for jobs
Employers – Post and manage job listings
Admin – Monitor and manage the system

The system is designed to be:

Scalable
SEO-friendly
Production-ready

Tech Stack
    Client
    React (Vite)
    Tailwind CSS
    Axios

Server
    Node.js
    Express.js
    JWT Authentication
Database
    MySQL

Prerequisites

Make sure you have the following installed:

Node.js (v18 or higher)
MySQL (v8 or higher)
Git
Project Structure
SmartHire/
│
├── client/     # React (Vite) app
├── server/     # Node.js + Express API
├── README.md
└── .gitignore

Setup Instructions

Follow these steps to run the project locally in under 15 minutes:

1. Clone the Repository
    git clone https://github.com/Mayaman-prog/Smart_Hire.git
    cd smarthire
2. Client Setup
    cd client
    npm install
    npm run dev

Client will run on:

http://localhost:5173

3. Server Setup

Open a new terminal:

cd server
npm install
npm run dev

Server will run on:

http://localhost:5000

4. Database Setup (MySQL)
    Open MySQL
    Create a database:
    CREATE DATABASE smarthire;

Environment Variables

Create a .env file inside the server folder.

.env
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smarthire

# JWT
JWT_SECRET=c/h6cJrSVDF3p0ZSTu56NdgphRT8L4Gb6EGPKdUy/fg=

# Client URL
CLIENT_URL=http://localhost:5173
Running the Full Project
Start server:
cd server
npm run dev
Start client:
cd client
npm run dev
Testing Instructions

To verify everything works on a fresh machine:

Clone the repo
Install dependencies (client + server)
Set up .env file
Start server
Start client
Open browser at:
http://localhost:5173

You should see the SmartHire application running.

Contributing
    Create a new branch:
    git switch -c branch-name
    Commit your changes:
    git commit -m "add new feature"
    Push to repository:
    git push origin branch-name

License

This project is for educational purposes.

Future Improvements
Add Docker support
Deploy to cloud (Vercel + Render)
Add notifications system
Implement advanced search filters

Goal

Make onboarding so easy that any developer can run the project in under 15 minutes without help.
