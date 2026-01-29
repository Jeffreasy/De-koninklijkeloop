
import https from 'https';

const tenantId = "b2727666-7230-4689-b58b-ceab8c2898d5";
const email = "laventejeffrey@gmail.com";
const password = "TestPassword123!"; // Password used in previous test script

const postData = JSON.stringify({
    email,
    password
});

const options = {
    hostname: 'laventecareauthsystems.onrender.com',
    port: 443,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': tenantId,
        'Content-Length': postData.length
    }
};

console.log(`Attempting LOGIN for: ${email}`);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postData);
req.end();
