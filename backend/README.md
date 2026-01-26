# Legal ERP & CRM - Backend API (Node.js)

This directory contains the core file structure and logic for the Node.js Backend API using Express and MySQL.

## Prerequisites

- **Node.js**: Ensure Node.js is installed.
- **MySQL**: Ensure you have a MySQL server running.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   - Create a `.env` file in the root of `backend` (already created).
   - Update the database credentials in `.env` if necessary:
     ```
     PORT=8000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=legal_erp_db
     JWT_SECRET=your_jwt_secret
     ```

3. **Create Database**:
   - Log in to your MySQL server and create the database:
     ```sql
     CREATE DATABASE legal_erp_db;
     ```

4. **Run the Server**:
   - For development (with hot reload):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```
   
   The server will start on port 8000.
   Sequelize will automatically sync the models and create tables (`users`, `clients`, `matters`) upon the first run.

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login

### Test
- `GET /api/test/all` - Public access
- `GET /api/test/user` - User access
- `GET /api/test/admin` - Admin access

## Technology Stack
- **Node.js**
- **Express**
- **MySQL** (with **Sequelize** ORM)
- **JWT** (JSON Web Tokens) for Authentication
