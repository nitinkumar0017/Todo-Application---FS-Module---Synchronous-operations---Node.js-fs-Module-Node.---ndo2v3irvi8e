
const fs = require('fs');
const DB = __dirname + '/db.txt';
// robustly split consecutive JSON objects separated by newlines
const parseAll = (text) => {
  const todos = [];
  if (!text || text.trim() === '') return todos;
  let depth = 0;
  let start = -1;
  let inString = false;
  let prev = '';
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (ch === '"' && prev !== '\\') inString = false;
    } else {
      if (ch === '"') {
        inString = true;
      } else if (ch === '{') {
        if (depth === 0) start = i;
        depth += 1;
      } else if (ch === '}') {
        depth -= 1;
        if (depth === 0 && start !== -1) {
          const slice = text.slice(start, i + 1);
          try { todos.push(JSON.parse(slice)); } catch (_) {}
          start = -1;
        }
      }
    }
    prev = ch;
  }
  return todos;
};
const dumpAll = (arr) => (arr.length ? arr.map((o) => JSON.stringify(o, null, 2)).join('\n') + '\n' : '');
const getTodosSync = () => {
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, '', 'utf-8');
  return fs.readFileSync(DB, 'utf-8');
};
const getTodoSync = (id) => {
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, '', 'utf-8');
  const todos = parseAll(fs.readFileSync(DB, 'utf-8'));
  const t = todos.find((x) => x && x.id == id);
  return t ? JSON.stringify(t) : null;
};
const createTodoSync = (title) => {
  const now = new Date().toISOString();
  const todo = { id: Date.now(), title, isCompleted: false, createdAt: now, updatedAt: now };
  fs.appendFileSync(DB, JSON.stringify(todo, null, 2) + '\n', 'utf-8');
};
const updateTodoSync = (id, updates) => {
  const todos = parseAll(fs.readFileSync(DB, 'utf-8'));
  const idx = todos.findIndex((x) => x && x.id == id);
  if (idx === -1) return;
  const ex = todos[idx];
  todos[idx] = { ...ex, ...updates, id: ex.id, createdAt: ex.createdAt, updatedAt: new Date().toISOString() };
  fs.writeFileSync(DB, dumpAll(todos), 'utf-8');
};
const deleteTodoSync = (id) => {
  const todos = parseAll(fs.readFileSync(DB, 'utf-8'));
  fs.writeFileSync(DB, dumpAll(todos.filter((x) => x && x.id != id)), 'utf-8');
};
module.exports = {
  getTodosSync,
  getTodoSync,
  createTodoSync,
  updateTodoSync,
  deleteTodoSync,
};
