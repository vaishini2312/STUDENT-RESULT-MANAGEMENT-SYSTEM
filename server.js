// server.js
// Backend API for the Student Result Management System.
// Run with: npm install
// Then: npm start
// Server runs at http://localhost:5000
// Data is stored in backend/results.json

const express = require('express');
const cors = require('cors');
const { loadData, saveData } = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ---------- Helpers ----------

function computeResult(subjects) {
  const total = subjects.reduce(
    (sum, s) => sum + Number(s.marks_obtained),
    0
  );

  const maxTotal = subjects.reduce(
    (sum, s) => sum + Number(s.max_marks),
    0
  );

  const percentage =
    maxTotal > 0 ? (total / maxTotal) * 100 : 0;

  let grade = 'F';

  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else if (percentage >= 33) grade = 'E';

  const status = percentage >= 33 ? 'PASS' : 'FAIL';

  return {
    total,
    maxTotal,
    percentage: Number(percentage.toFixed(2)),
    grade,
    status
  };
}

function withResult(data, student) {
  const subjects = data.subjects.filter(
    (s) => s.student_id === student.id
  );

  return {
    ...student,
    subjects,
    result: computeResult(subjects)
  };
}

// ---------- Health Check ----------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok'
  });
});

// ---------- CREATE STUDENT ----------

app.post('/api/students', (req, res) => {
  const {
    roll_no,
    name,
    class: className,
    subjects
  } = req.body;

  // Required field validation
  if (!roll_no || !name || !className) {
    return res.status(400).json({
      error: 'Roll number, name and class are required'
    });
  }

  // Subject marks validation
  if (Array.isArray(subjects)) {
    for (const s of subjects) {
      const marks = Number(s.marks_obtained);
      const maxMarks = Number(s.max_marks) || 100;

      if (
        !Number.isFinite(marks) ||
        marks < 0 ||
        marks > maxMarks
      ) {
        return res.status(400).json({
          error: `Marks must be between 0 and ${maxMarks}`
        });
      }
    }
  }

  const data = loadData();

  // Duplicate roll number validation
  if (
    data.students.some(
      (s) => s.roll_no.toLowerCase() === roll_no.toLowerCase()
    )
  ) {
    return res.status(409).json({
      error: 'A student with that roll number already exists'
    });
  }

  // Create student
  const student = {
    id: data.nextStudentId++,
    roll_no,
    name,
    class: className,
    created_at: new Date().toISOString()
  };

  data.students.push(student);

  // Add subjects
  if (Array.isArray(subjects)) {
    for (const s of subjects) {
      data.subjects.push({
        id: data.nextSubjectId++,
        student_id: student.id,
        subject_name: s.subject_name,
        marks_obtained: Number(s.marks_obtained),
        max_marks: Number(s.max_marks) || 100
      });
    }
  }

  saveData(data);

  res.status(201).json(
    withResult(data, student)
  );
});

// ---------- READ ALL STUDENTS ----------

app.get('/api/students', (req, res) => {
  const data = loadData();

  const sorted = [...data.students].sort(
    (a, b) => b.id - a.id
  );

  res.json(
    sorted.map((student) =>
      withResult(data, student)
    )
  );
});

// ---------- READ ONE STUDENT ----------

app.get('/api/students/:id', (req, res) => {
  const data = loadData();

  const student = data.students.find(
    (s) => s.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({
      error: 'Student not found'
    });
  }

  res.json(
    withResult(data, student)
  );
});

// ---------- UPDATE STUDENT ----------

app.put('/api/students/:id', (req, res) => {
  const {
    name,
    class: className
  } = req.body;

  const data = loadData();

  const student = data.students.find(
    (s) => s.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({
      error: 'Student not found'
    });
  }

  // Validate update fields
  if (
    name !== undefined &&
    String(name).trim() === ''
  ) {
    return res.status(400).json({
      error: 'Name cannot be empty'
    });
  }

  if (
    className !== undefined &&
    String(className).trim() === ''
  ) {
    return res.status(400).json({
      error: 'Class cannot be empty'
    });
  }

  // Update student
  if (name !== undefined) {
    student.name = String(name).trim();
  }

  if (className !== undefined) {
    student.class = String(className).trim();
  }

  saveData(data);

  res.json(
    withResult(data, student)
  );
});

// ---------- DELETE STUDENT ----------

app.delete('/api/students/:id', (req, res) => {
  const data = loadData();

  const studentId = Number(req.params.id);

  const index = data.students.findIndex(
    (s) => s.id === studentId
  );

  if (index === -1) {
    return res.status(404).json({
      error: 'Student not found'
    });
  }

  // Delete student
  data.students.splice(index, 1);

  // Delete student's subjects
  data.subjects = data.subjects.filter(
    (s) => s.student_id !== studentId
  );

  saveData(data);

  res.json({
    message: 'Student deleted successfully'
  });
});

// ---------- ADD SUBJECT ----------

app.post('/api/students/:id/subjects', (req, res) => {
  const {
    subject_name,
    marks_obtained,
    max_marks
  } = req.body;

  const data = loadData();

  const student = data.students.find(
    (s) => s.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({
      error: 'Student not found'
    });
  }

  // Required validation
  if (
    !subject_name ||
    marks_obtained === undefined
  ) {
    return res.status(400).json({
      error: 'Subject name and marks obtained are required'
    });
  }

  const marks = Number(marks_obtained);
  const maxMarks = Number(max_marks) || 100;

  // Marks validation
  if (
    !Number.isFinite(marks) ||
    marks < 0 ||
    marks > maxMarks
  ) {
    return res.status(400).json({
      error: `Marks must be between 0 and ${maxMarks}`
    });
  }

  data.subjects.push({
    id: data.nextSubjectId++,
    student_id: student.id,
    subject_name,
    marks_obtained: marks,
    max_marks: maxMarks
  });

  saveData(data);

  res.status(201).json(
    withResult(data, student)
  );
});

// ---------- DELETE SUBJECT ----------

app.delete('/api/subjects/:subjectId', (req, res) => {
  const data = loadData();

  const subjectId = Number(req.params.subjectId);

  const index = data.subjects.findIndex(
    (s) => s.id === subjectId
  );

  if (index === -1) {
    return res.status(404).json({
      error: 'Subject entry not found'
    });
  }

  const studentId =
    data.subjects[index].student_id;

  data.subjects.splice(index, 1);

  saveData(data);

  const student = data.students.find(
    (s) => s.id === studentId
  );

  res.json(
    withResult(data, student)
  );
});

// ---------- SEARCH STUDENTS ----------

app.get('/api/search', (req, res) => {
  const q = String(
    req.query.q || ''
  ).toLowerCase();

  const data = loadData();

  const matches = data.students.filter(
    (student) =>
      student.name.toLowerCase().includes(q) ||
      student.roll_no.toLowerCase().includes(q) ||
      student.class.toLowerCase().includes(q)
  );

  res.json(
    matches.map((student) =>
      withResult(data, student)
    )
  );
});

// ---------- START SERVER ----------

app.listen(PORT, () => {
  console.log(
    `Student Result API running at http://localhost:${PORT}`
  );
});
