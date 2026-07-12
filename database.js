// database.js
// A simple file-based "database" using a JSON file (results.json).
// No native compilation, no installs beyond plain npm packages —
// this avoids the Windows build-tools issues that native modules
// like better-sqlite3 can run into.

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'results.json');

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { students: [], subjects: [], nextStudentId: 1, nextSubjectId: 1 };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { loadData, saveData };
