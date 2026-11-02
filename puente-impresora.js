// Puente local para imprimir por IP (TCP/9100) desde el navegador.
// Uso: node puente-impresora.js   (escucha en http://localhost:9101)
const http = require('http'), net = require('net');
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST' || req.url !== '/print') { res.writeHead(404); return res.end('No encontrado'); }
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    try {
      const { host, port, data } = JSON.parse(body);
      const sock = net.connect({ host, port: port || 9100, timeout: 5000 }, () => sock.end(Buffer.from(data, 'base64')));
      sock.on('close', () => { if (!res.writableEnded) { res.writeHead(200); res.end('OK'); } });
      sock.on('error', e => { res.writeHead(502); res.end('Error de impresora: ' + e.message); });
      sock.on('timeout', () => sock.destroy(new Error('tiempo agotado')));
    } catch (e) { res.writeHead(400); res.end('Solicitud inválida'); }
  });
}).listen(9101, () => console.log('Puente de impresión en http://localhost:9101'));
