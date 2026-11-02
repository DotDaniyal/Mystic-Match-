const fs = require('fs');
const https = require('https');
const path = require('path');
const { execSync } = require('child_process');

const url = 'https://download.visualstudio.microsoft.com/download/pr/e2393a1d-1011-45c9-a507-46b696f6f2a4/a1aedc61f794eb66fbcdad6aaf8a8be3/microsoft-jdk-21.0.6-windows-x64.zip';
const targetDir = 'C:\\Users\\faysa\\.jdks';
const targetZip = path.join(targetDir, 'microsoft-jdk-21.zip');

fs.mkdirSync(targetDir, { recursive: true });

function getFileSize(targetUrl) {
  return new Promise((resolve, reject) => {
    const req = https.request(targetUrl, { method: 'HEAD' }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(getFileSize(res.headers.location));
      }
      resolve({
        url: targetUrl,
        size: parseInt(res.headers['content-length'], 10),
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function downloadChunk(chunkUrl, start, end, chunkIndex) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    };
    https.get(chunkUrl, options, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        resolve({ index: chunkIndex, buffer: Buffer.concat(chunks) });
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('Querying JDK 21 size...');
  const { url: finalUrl, size } = await getFileSize(url);
  console.log(`JDK Total Size: ${(size / 1024 / 1024).toFixed(2)} MB`);

  const numChunks = 16;
  const chunkSize = Math.ceil(size / numChunks);
  console.log(`Downloading JDK with ${numChunks} parallel connections...`);

  const promises = [];
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize - 1, size - 1);
    promises.push(
      downloadChunk(finalUrl, start, end, i).then((res) => {
        console.log(`  Chunk ${res.index + 1}/${numChunks} complete`);
        return res;
      })
    );
  }

  const results = await Promise.all(promises);
  results.sort((a, b) => a.index - b.index);

  console.log('Assembling JDK zip...');
  const fd = fs.openSync(targetZip, 'w');
  for (const r of results) {
    fs.writeSync(fd, r.buffer);
  }
  fs.closeSync(fd);

  console.log('Extracting JDK 21...');
  execSync(`powershell -command "Expand-Archive -Path '${targetZip}' -DestinationPath '${targetDir}' -Force"`);
  console.log('JDK 21 installed successfully!');
}

main().catch((err) => {
  console.error('Download failed:', err);
  process.exit(1);
});
