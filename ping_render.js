const https = require('https');
const http = require('http');

// Replace this with your actual Render backend URL
// It is recommended to use an endpoint that returns quickly and doesn't do heavy database operations, 
// such as a health check endpoint or just the base URL if it returns a response.
const RENDER_URL = 'https://your-backend-app.onrender.com';

function pingServer() {
    console.log(`[${new Date().toLocaleTimeString()}] Pinging ${RENDER_URL}...`);
    
    const client = RENDER_URL.startsWith('https') ? https : http;
    
    client.get(RENDER_URL, (res) => {
        console.log(`[${new Date().toLocaleTimeString()}] Response Status: ${res.statusCode}`);
        
        // Consume response data to free up memory
        res.on('data', () => {});
        res.on('end', () => {});
    }).on('error', (err) => {
        console.error(`[${new Date().toLocaleTimeString()}] Error pinging server: ${err.message}`);
    });
}

// Ping immediately upon starting the script
pingServer();

// Ping every 50 seconds (50,000 milliseconds)
setInterval(pingServer, 50 * 1000);

console.log('Keep-awake script started. Pinging every 50 seconds...');
console.log('Press Ctrl+C to stop.');
