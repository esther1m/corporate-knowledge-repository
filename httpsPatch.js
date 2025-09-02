const fs = require('fs');
const https = require('https');

// Load your Zscaler cert
const zscalerCert = fs.readFileSync('C:\Users\elizabeth.adeleke\OneDrive - Buckinghamshire New University\BNU - Assignments & Projects\Web Programming\CW2\corporate-knowledge\Zscaler Intermediate Root CA (zscalerthree.net).pem');

// Patch the global HTTPS agent
https.globalAgent.options.ca = zscalerCert;

console.log('Zscaler cert injected into global HTTPS agent');
