# PythonChatBot

## Setup Instructions

### Prerequisites
*   Python 3.10+
*   Node.js (v18+)
*   Database (e.g. Microsoft SQL Server) or any other compatible with the connection string in `.env`.

### 1. Backend Setup (Server)

1.  Open a terminal in the main project directory `PythonChatBot/`.
2.  Run the setup script:
    ```bash
    setup.bat
    ```
    This script will create a virtual environment (`venv`) and install the required packages.

3.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```

4.  Configure the `.env` file (create it if it doesn't exist):
    ```ini
    DATABASE_URL=your_database_url (e.g. mssql+pyodbc://user:password@server/db_name?driver=ODBC+Driver+17+for+SQL+Server)
    SECRET_KEY=your_very_secret_key
    ```

5.  Run database migrations (Alembic):
    ```bash
    # Ensure the virtual environment is active (e.g., ..\venv\Scripts\activate)
    alembic upgrade head
    ```

6.  Start the server:
    ```bash
    python main.py
    ```
    The server will start at: `http://127.0.0.1:8000`.

### 2. Frontend Setup (Client)

1.  Open a **new** terminal.
2.  Navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```

4.  Run the application:
    ```bash
    npm run dev
    ```
    The client will be available at (usually): `http://localhost:5173`.
