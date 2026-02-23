#!/usr/bin/env node

/**
 * Simple HTTP Server for Portfolio
 * Usage: node serve.js
 * Open: http://localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Remove leading slash
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Get file path
    const filePath = path.join(__dirname, pathname);

    // Security: prevent directory traversal
    const realPath = path.resolve(filePath);
    const baseDir = path.resolve(__dirname);

    if (!realPath.startsWith(baseDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    // Read and serve file
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
            }
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': mimeType,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        });

        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  Portfolio Server Running             ║
╠════════════════════════════════════════╣
║  URL: http://localhost:${PORT}        ║
║  Press Ctrl+C to stop                ║
╚════════════════════════════════════════╝
    `);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try another port.`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
