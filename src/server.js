// Simple CRUD API (Create, Read, Update) — Delete is intentionally not supported.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

function loadItems() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

function validate(input) {
  const name = String(input.name ?? '').trim();
  const price = Number(input.price);
  const quantity = Number(input.quantity);
  if (!name) return { error: 'Name is required' };
  if (!Number.isFinite(price) || price < 0) return { error: 'Price must be a non-negative number' };
  if (!Number.isInteger(quantity) || quantity < 0) return { error: 'Quantity must be a non-negative integer' };
  return { value: { name, price, quantity } };
}

function serveStatic(req, res) {
  const file = req.url === '/' ? 'index.html' : req.url.slice(1);
  const filePath = path.join(PUBLIC_DIR, file);
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('Not found');
  }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
  res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const match = req.url.match(/^\/api\/items(?:\/(\d+))?$/);
  if (!match) return serveStatic(req, res);

  const id = match[1] ? Number(match[1]) : null;
  const items = loadItems();

  try {
    // READ all
    if (req.method === 'GET' && id === null) {
      return sendJson(res, 200, items);
    }

    // READ one
    if (req.method === 'GET') {
      const item = items.find(i => i.id === id);
      return item ? sendJson(res, 200, item) : sendJson(res, 404, { error: 'Item not found' });
    }

    // CREATE
    if (req.method === 'POST' && id === null) {
      const { value, error } = validate(await readBody(req));
      if (error) return sendJson(res, 400, { error });
      const newItem = { id: items.reduce((max, i) => Math.max(max, i.id), 0) + 1, ...value };
      items.push(newItem);
      saveItems(items);
      return sendJson(res, 201, newItem);
    }

    // UPDATE
    if (req.method === 'PUT' && id !== null) {
      const index = items.findIndex(i => i.id === id);
      if (index === -1) return sendJson(res, 404, { error: 'Item not found' });
      const { value, error } = validate(await readBody(req));
      if (error) return sendJson(res, 400, { error });
      items[index] = { id, ...value };
      saveItems(items);
      return sendJson(res, 200, items[index]);
    }

    // DELETE (and anything else) is not allowed
    res.setHeader('Allow', id === null ? 'GET, POST' : 'GET, PUT');
    return sendJson(res, 405, { error: `Method ${req.method} not allowed` });
  } catch (err) {
    return sendJson(res, 400, { error: err.message });
  }
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
