const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DATA_PATH = path.join(__dirname, 'data.json');

function readData() {
  return JSON.parse(fs.readFileSync(DATA_PATH));
}

function writeData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, method } = parsedUrl;

  if (method === 'GET' && (pathname === '/' || pathname.startsWith('/'))) {
    let filePath = pathname === '/' 
      ? path.join(__dirname, 'public', 'index.html')
      : path.join(__dirname, 'public', pathname);

    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
    }[ext] || 'text/plain';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
    return;
  }

  if (method === 'GET' && pathname === '/api/items') {
    const data = readData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  if (method === 'POST' && pathname === '/api/items') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const data = readData();
      const newItem = { id: Date.now(), ...JSON.parse(body) };
      data.push(newItem);
      writeData(data);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newItem));
    });
    return;
  }

  if (method === 'PUT' && pathname.startsWith('/api/items/')) {
    const id = parseInt(pathname.split('/').pop());
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const data = readData();
      const updated = JSON.parse(body);
      const index = data.findIndex(item => item.id === id);
      if (index !== -1) {
        data[index].name = updated.name;
        writeData(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data[index]));
      } else {
        res.writeHead(404);
        res.end('Item not found');
      }
    });
    return;
  }

  if (method === 'DELETE' && pathname.startsWith('/api/items/')) {
    const id = parseInt(pathname.split('/').pop());
    let data = readData();
    data = data.filter(item => item.id !== id);
    writeData(data);
    res.writeHead(204);
    res.end();
    return;
  }

  res.writeHead(404);
  res.end('Route not found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
