// server.js
// Backend API for the Student Result Management System.
// Run with: npm install   then   npm start
// Server runs at http://localhost:5000
// Data is stored in backend/results.json (created automatically).

const express = require('express');
const cors = require('cors');
const { loadData, saveData } = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ---------- Helpers ----------

function computeResult(subjects) {
  const total = subjects.reduce((sum, s) => sum + s.marks_obtained, 0);
  const maxTotal = subjects.reduce((sum, s) => sum + s.max_marks, 0);
  const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else if (percentage >= 33) grade = 'E';

  const status = percentage >= 33 ? 'PASS' : 'FAIL';

  return { total, maxTotal, percentage: Number(percentage.toFixed(2)), grade, status };
}

function withResult(data, student) {
  const subjects = data.subjects.filter((s) => s.student_id === student.id);
  return { ...student, subjects, result: computeResult(subjects) };
}

// ---------- Routes ----------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create a student (with optional subjects array)
app.post('/api/students', (req, res) => {
  const { roll_no, name, class: className, subjects } = req.body;

  if (!roll_no || !name || !className) {
    return res.status(400).json({ error: 'roll_no, name and class are required' });
  }

  const data = loadData();

  if (data.students.some((s) => s.roll_no === roll_no)) {
    return res.status(409).json({ error: 'A student with that roll_no already exists' });
  }

  const student = {
    id: data.nextStudentId++,
    roll_no,
    name,
    class: className,
    created_at: new Date().toISOString(),
  };
  data.students.push(student);

  if (Array.isArray(subjects)) {
    for (const s of subjects) {
      data.subjects.push({
        id: data.nextSubjectId++,
        student_id: student.id,
        subject_name: s.subject_name,
        marks_obtained: s.marks_obtained,
        max_marks: s.max_marks || 100,
      });
    }
  }

  saveData(data);
  res.status(201).json(withResult(data, student));
});

// Get all students
app.get('/api/students', (req, res) => {
  const data = loadData();
  const sorted = [...data.students].sort((a, b) => b.id - a.id);
  res.json(sorted.map((s) => withResult(data, s)));
});

// Get one student
app.get('/api/students/:id', (req, res) => {
  const data = loadData();
  const student = data.students.find((s) => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(withResult(data, student));
});

// Update student basic info
app.put('/api/students/:id', (req, res) => {
  const { name, class: className } = req.body;
  const data = loadData();
  const student = data.students.find((s) => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found' });

  if (name) student.name = name;
  if (className) student.class = className;

  saveData(data);
  res.json(withResult(data, student));
});

// Delete a student (and their subjects)
app.delete('/api/students/:id', (req, res) => {
  const data = loadData();
  const idx = data.students.findIndex((s) => s.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });

  data.students.splice(idx, 1);
  data.subjects = data.subjects.filter((s) => s.student_id !== Number(req.params.id));

  saveData(data);
  res.json({ message: 'Student deleted' });
});

// Add a subject/marks entry to a student
app.post('/api/students/:id/subjects', (req, res) => {
  const { subject_name, marks_obtained, max_marks } = req.body;
  const data = loadData();
  const student = data.students.find((s) => s.id === Number(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found' });

  if (!subject_name || marks_obtained === undefined) {
    return res.status(400).json({ error: 'subject_name and marks_obtained are required' });
  }

  data.subjects.push({
    id: data.nextSubjectId++,
    student_id: student.id,
    subject_name,
    marks_obtained,
    max_marks: max_marks || 100,
  });

  saveData(data);
  res.status(201).json(withResult(data, student));
});

// Delete a single subject entry
app.delete('/api/subjects/:subjectId', (req, res) => {
  const data = loadData();
  const idx = data.subjects.findIndex((s) => s.id === Number(req.params.subjectId));
  if (idx === -1) return res.status(404).json({ error: 'Subject entry not found' });

  const studentId = data.subjects[idx].student_id;
  data.subjects.splice(idx, 1);
  saveData(data);

  const student = data.students.find((s) => s.id === studentId);
  res.json(withResult(data, student));
});

// Search students by name / roll_no / class
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const data = loadData();
  const matches = data.students.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.roll_no.toLowerCase().includes(q) ||
      s.class.toLowerCase().includes(q)
  );
  res.json(matches.map((s) => withResult(data, s)));
});

app.listen(PORT, () => {
  console.log(`Student Result API running at http://localhost:${PORT}`);
});
