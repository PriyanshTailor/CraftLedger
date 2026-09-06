import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mlProcess = null;
const ML_PORT = process.env.ML_SERVICE_PORT || 5001;
const ML_URL = `http://127.0.0.1:${ML_PORT}`;

/**
 * Checks if the ML service is already online.
 */
export async function isMlServiceOnline() {
  try {
    const res = await fetch(`${ML_URL}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      return data?.status === 'online';
    }
  } catch {
    // Offline
  }
  return false;
}

/**
 * Automatically starts the ML service child process alongside the backend.
 */
export async function startMlService() {
  // 1. Check if already online
  const alreadyRunning = await isMlServiceOnline();
  if (alreadyRunning) {
    console.log(`[ML-Service] ⚡ Connected to existing ML engine running at ${ML_URL}`);
    return;
  }

  const mlServiceDir = path.resolve(__dirname, '../../../ml-service');
  const serverScript = path.resolve(mlServiceDir, 'server.py');

  console.log(`[ML-Service] 🚀 Starting Python ML Engine on port ${ML_PORT}...`);

  // Detect python command
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  try {
    mlProcess = spawn(pythonCmd, [serverScript], {
      cwd: mlServiceDir,
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUNBUFFERED: '1',
        ML_SERVICE_PORT: String(ML_PORT)
      },
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    });

    mlProcess.stdout.on('data', (chunk) => {
      const msg = chunk.toString().trim();
      if (msg) console.log(msg);
    });

    mlProcess.stderr.on('data', (chunk) => {
      const err = chunk.toString().trim();
      if (err) console.error(err);
    });

    mlProcess.on('error', (err) => {
      console.warn(`[ML-Service] ⚠️ Notice: Could not launch python ML service (${err.message}). The backend will use direct execution fallback.`);
    });

    mlProcess.on('exit', (code, signal) => {
      if (code !== 0 && signal !== 'SIGTERM' && signal !== 'SIGINT') {
        console.log(`[ML-Service] ML process exited (code ${code || signal})`);
      }
      mlProcess = null;
    });

    // Ensure clean teardown when backend exits
    const cleanup = () => {
      if (mlProcess) {
        try {
          mlProcess.kill();
        } catch {
          // ignore
        }
        mlProcess = null;
      }
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

    // Wait for service to become ready (up to 7 seconds)
    const startTime = Date.now();
    while (Date.now() - startTime < 7000) {
      await new Promise(r => setTimeout(r, 250));
      if (await isMlServiceOnline()) {
        console.log(`[ML-Service] Ready for high-speed ML inference.`);
        break;
      }
    }

  } catch (err) {
    console.warn(`[ML-Service] Could not spawn ML service: ${err.message}. Seamless analytical fallback is active.`);
  }
}

/**
 * Stops the ML service process if running.
 */
export function stopMlService() {
  if (mlProcess) {
    console.log('[ML-Service] Shutting down ML process...');
    try {
      mlProcess.kill();
    } catch {
      // ignore
    }
    mlProcess = null;
  }
}

export function getMlServiceUrl() {
  return ML_URL;
}
