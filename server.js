const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Handle root path
    let filePath = req.url === '/' ? '/index.html' : req.url;

    // Remove query parameters
    filePath = filePath.split('?')[0];

    // Security: prevent directory traversal
    filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');

    // Build the full path
    const fullPath = path.join(__dirname, filePath);

    // Get file extension
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Check if file exists
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            console.error(`404 - File not found: ${fullPath}`);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>404 - Página Não Encontrada</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background-color: #f5f7fa;
                            color: #2c3e50;
                        }
                        .error-container {
                            text-align: center;
                            padding: 40px;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }
                        h1 {
                            font-size: 72px;
                            margin: 0;
                            color: #4A6B54;
                        }
                        p {
                            font-size: 18px;
                            margin: 20px 0;
                        }
                        a {
                            color: #4A6B54;
                            text-decoration: none;
                            font-weight: 600;
                        }
                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <h1>404</h1>
                        <p>Página não encontrada</p>
                        <p><a href="/">← Voltar para o Dashboard</a></p>
                    </div>
                </body>
                </html>
            `);
            return;
        }

        // Check if it's a directory
        fs.stat(fullPath, (err, stats) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            if (stats.isDirectory()) {
                // Try to serve index.html from directory
                const indexPath = path.join(fullPath, 'index.html');
                fs.access(indexPath, fs.constants.F_OK, (err) => {
                    if (err) {
                        res.writeHead(403, { 'Content-Type': 'text/plain' });
                        res.end('Forbidden - Directory listing not allowed');
                        return;
                    }
                    serveFile(indexPath, 'text/html', res);
                });
            } else {
                serveFile(fullPath, contentType, res);
            }
        });
    });
});

function serveFile(filePath, contentType, res) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error(`Error reading file: ${filePath}`, err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        res.end(content);
    });
}

server.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Starken Financial Dashboard - Local Development Server  ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`  Server running at: http://localhost:${PORT}`);
    console.log(`  Company: Starken Tecnologia Ltda`);
    console.log(`  CNPJ: 62.839.769/0001-55`);
    console.log('');
    console.log('  Available pages:');
    console.log(`  - Dashboard:         http://localhost:${PORT}/`);
    console.log(`  - Contas a Pagar:    http://localhost:${PORT}/pages/contas-pagar.html`);
    console.log(`  - Contas a Receber:  http://localhost:${PORT}/pages/contas-receber.html`);
    console.log(`  - DRE:               http://localhost:${PORT}/pages/dre.html`);
    console.log(`  - Analíticos:        http://localhost:${PORT}/pages/analiticos.html`);
    console.log(`  - Relatórios:        http://localhost:${PORT}/pages/relatorios.html`);
    console.log('');
    console.log('  Press Ctrl+C to stop the server');
    console.log('═══════════════════════════════════════════════════════════');
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${PORT} is already in use.`);
        console.error('Try stopping the other server or use a different port:');
        console.error(`  PORT=3001 npm start`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('\nServer shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n\nServer stopped by user');
    process.exit(0);
});
