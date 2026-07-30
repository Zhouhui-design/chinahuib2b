const fs = require('fs');
const path = require('path');

const filePath = '/var/www/chinahuib2b/public/llms.txt';
const content = fs.readFileSync(filePath, 'utf-8');

const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/llms.txt') {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(content);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const port = 8081;
server.listen(port, () => {
  console.log(`llms.txt server running on port ${port}`);
});
