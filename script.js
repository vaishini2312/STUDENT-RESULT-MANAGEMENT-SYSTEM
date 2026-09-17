const API_BASE = 'http://localhost:5000/api';

const studentsBody = document.getElementById('studentsBody');
const studentForm = document.getElementById('studentForm');
const subjectsContainer = document.getElementById('subjectsContainer');

// ---------- Add subject row ----------
document.getElementById('addSubjectBtn').addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'subject-row';
  row.innerHTML = `
    <input type="text" class="subjectName" placeholder="Subject" required />
    <input type="number" class="marksObtained" placeholder="Marks Obtained" min="0" max="100" required />
    <input type="number" class="maxMarks" placeholder="Max Marks" value="100" />
  `;
  subjectsContainer.appendChild(row);
});

// ---------- Submit new student ----------
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const subjectRows = document.querySelectorAll('.subject-row');
  const subjects = Array.from(subjectRows).map((row) => ({
    subject_name: row.querySelector('.subjectName').value,
    marks_obtained: parseFloat(row.querySelector('.marksObtained').value),
    max_marks: parseFloat(row.querySelector('.maxMarks').value) || 100,
  }));

  const payload = {
    roll_no: document.getElementById('rollNo').value,
    name: document.getElementById('studentName').value,
    class: document.getElementById('studentClass').value,
    subjects,
  };

  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(err.error || 'Failed to save student');
    return;
  }

  studentForm.reset();
  // Reset subject rows to just one
  subjectsContainer.innerHTML = `
    <div class="subject-row">
      <input type="text" class="subjectName" placeholder="Subject" required />
      <input type="number" class="marksObtained" placeholder="Marks Obtained" required />
      <input type="number" class="maxMarks" placeholder="Max Marks" value="100" />
    </div>
  `;

  loadStudents();
});

// ---------- Load / render students ----------
async function loadStudents() {
  const res = await fetch(`${API_BASE}/students`);
  const students = await res.json();
  renderStudents(students);
}

function renderStudents(students) {
  studentsBody.innerHTML = '';
  students.forEach((s) => {
    const subjectsText = s.subjects
      .map((sub) => `${sub.subject_name}: ${sub.marks_obtained}/${sub.max_marks}`)
      .join(', ');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${s.roll_no}</td>
      <td>${s.name}</td>
      <td>${s.class}</td>
      <td>${subjectsText || '-'}</td>
      <td>${s.result.total}/${s.result.maxTotal}</td>
      <td>${s.result.percentage}%</td>
      <td>${s.result.grade}</td>
      <td class="${s.result.status === 'PASS' ? 'status-pass' : 'status-fail'}">${s.result.status}</td>
      <td>
  <button class="edit-btn" data-id="${s.id}">Edit</button>
  <button class="delete-btn" data-id="${s.id}">Delete</button>
</td>
    `;
    studentsBody.appendChild(tr);
  });
document.querySelectorAll('.edit-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const id = btn.dataset.id;

    const student = await fetch(`${API_BASE}/students/${id}`).then(res => res.json());

    const newName = prompt('Enter new student name:', student.name);
    if (newName === null) return;

    const newClass = prompt('Enter new class:', student.class);
    if (newClass === null) return;

    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        class: newClass
      })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Update failed');
      return;
    }

    alert('Student updated successfully!');
    loadStudents();
  });
});
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this student?')) return;
      await fetch(`${API_BASE}/students/${btn.dataset.id}`, { method: 'DELETE' });
      loadStudents();
    });
  });
}

// ---------- Search ----------
document.getElementById('searchBtn').addEventListener('click', async () => {
  const q = document.getElementById('searchInput').value;
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
  const students = await res.json();
  renderStudents(students);
});

document.getElementById('clearSearchBtn').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  loadStudents();
});

// ---------- Init ----------
loadStudents();
