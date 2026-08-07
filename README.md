# Student Result Management System

A full-stack project: HTML/CSS/JS frontend + Node.js/Express backend + SQLite database.

## Folder structure
```
student-result-system/
  backend/
    server.js       -> Express API
    database.js      -> SQLite setup (creates results.db automatically)
    package.json
  frontend/
    index.html
    style.css
    script.js
```

## How to run

### 1. Start the backend
```
cd backend
npm install
npm start
```
This starts the API at `http://localhost:5000`. On first run it automatically
creates a `results.db` SQLite file in the `backend` folder — no manual database
setup, no MySQL/Postgres install needed.

### 2. Open the frontend
Just open `frontend/index.html` in your browser (or use the VS Code "Live Server"
extension). The frontend calls the backend at `http://localhost:5000/api`.

Keep the backend terminal running while you use the frontend.

## API endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/students | Create a student (optionally with subjects) |
| GET | /api/students | List all students with computed results |
| GET | /api/students/:id | Get one student |
| PUT | /api/students/:id | Update student name/class |
| DELETE | /api/students/:id | Delete a student |
| POST | /api/students/:id/subjects | Add a subject/marks entry |
| DELETE | /api/subjects/:subjectId | Delete a subject entry |
| GET | /api/search?q= | Search by name / roll no / class |

## Notes
- Grades: A+ (90+), A (80+), B (70+), C (60+), D (50+), E (33+), F (below 33).
- Switching to MySQL/PostgreSQL later only requires changing `database.js` and
  the SQL calls in `server.js` — the API shape stays the same.

## Prototype Video

Watch the prototype video here:

https://drive.google.com/file/d/13mcjs1ULp-KWp8YUhblK539LM_jIFgZY/view?usp=drivesdk 
