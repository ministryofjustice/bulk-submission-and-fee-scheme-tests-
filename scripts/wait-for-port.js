#!/usr/bin/env node

const net = require('net');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node scripts/wait-for-port.js <port> [host] [timeoutSeconds]');
  process.exit(1);
}

const port = Number(args[0]);
const host = args[1] || '127.0.0.1';
const timeoutSeconds = args[2] ? Number(args[2]) : 60;

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(`Invalid port: ${args[0]}`);
  process.exit(1);
}

if (Number.isNaN(timeoutSeconds) || timeoutSeconds <= 0) {
  console.error(`Invalid timeout: ${args[2]}`);
  process.exit(1);
}

const deadline = Date.now() + timeoutSeconds * 1000;
const RETRY_DELAY_MS = 2000;

function waitForPort() {
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      if (Date.now() > deadline) {
        return reject(new Error(`Timed out waiting for ${host}:${port}`));
      }

      const socket = new net.Socket();

      const cleanup = () => {
        socket.removeAllListeners();
        socket.destroy();
      };

      const retry = (err) => {
        cleanup();
        if (Date.now() > deadline) {
          reject(new Error(`Timed out waiting for ${host}:${port} (${err.message})`));
          return;
        }
        setTimeout(tryConnect, RETRY_DELAY_MS);
      };

      socket.once('connect', () => {
        cleanup();
        console.log(`Connected to ${host}:${port}`);
        resolve();
      });

      socket.once('error', retry);
      socket.once('timeout', () => retry(new Error('connection timeout')));

      socket.connect(port, host);
      socket.setTimeout(RETRY_DELAY_MS);
    };

    tryConnect();
  });
}

waitForPort()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
