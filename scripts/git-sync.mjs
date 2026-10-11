import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const POLL_INTERVAL_MS = 6000; // Check every 6 seconds
const DEBOUNCE_PUSH_MS = 3000; // Wait 3 seconds after changes before auto-committing/pushing
const REMOTE = 'origin';
const BRANCH = 'main';

let isSyncing = false;
let pendingPushTimeout = null;

function log(msg) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] [Git-LiveSync] ${msg}`);
}

async function run(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    return { ok: true, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (error) {
    return { ok: false, stdout: error.stdout?.trim() ?? '', stderr: error.stderr?.trim() ?? error.message };
  }
}

async function getLocalChanges() {
  const res = await run('git status --porcelain');
  if (!res.ok || !res.stdout) return [];
  return res.stdout.split('\n').filter(Boolean);
}

async function getCommits() {
  const local = await run('git rev-parse HEAD');
  const remote = await run(`git rev-parse ${REMOTE}/${BRANCH}`);
  return {
    localHead: local.ok ? local.stdout : null,
    remoteHead: remote.ok ? remote.stdout : null,
  };
}

async function syncPull() {
  const fetchRes = await run(`git fetch ${REMOTE} ${BRANCH}`);
  if (!fetchRes.ok) return;

  const { localHead, remoteHead } = await getCommits();
  if (!localHead || !remoteHead) return;

  if (localHead !== remoteHead) {
    // Check if remote has commits ahead of local
    const behindRes = await run(`git rev-list ${localHead}..${remoteHead}`);
    if (behindRes.ok && behindRes.stdout.length > 0) {
      log(`Incoming updates detected from GitHub (${remoteHead.slice(0, 7)}). Pulling...`);
      const pullRes = await run(`git pull --rebase --autostash ${REMOTE} ${BRANCH}`);
      if (pullRes.ok) {
        log(`✓ Pulled and updated local files to GitHub commit ${remoteHead.slice(0, 7)}.`);
      } else {
        log(`⚠ Pull warning: ${pullRes.stderr}`);
      }
    }
  }
}

async function syncPush() {
  const changes = await getLocalChanges();
  if (changes.length > 0) {
    log(`Detected ${changes.length} local file modification(s). Staging & committing...`);
    const addRes = await run('git add -A');
    if (!addRes.ok) {
      log(`Failed to stage changes: ${addRes.stderr}`);
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const commitMsg = `sync: automatic real-time update [${now}]`;
    const commitRes = await run(`git commit -m "${commitMsg}"`);
    if (!commitRes.ok) return;
  }

  // Check if we are ahead of remote
  const aheadRes = await run(`git rev-list ${REMOTE}/${BRANCH}..HEAD`);
  if (aheadRes.ok && aheadRes.stdout.length > 0) {
    log('Local commits ahead of GitHub. Pushing to origin/main...');
    // Always rebase incoming before pushing
    await run(`git pull --rebase --autostash ${REMOTE} ${BRANCH}`);
    const pushRes = await run(`git push ${REMOTE} ${BRANCH}`);
    if (pushRes.ok) {
      const { localHead } = await getCommits();
      log(`✓ Pushed to GitHub (${localHead ? localHead.slice(0, 7) : 'latest'}).`);
    } else {
      log(`⚠ Push warning: ${pushRes.stderr}`);
    }
  }
}

async function cycle() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // 1. Fetch & pull incoming commits from GitHub
    await syncPull();

    // 2. Stage/commit/push if local changes exist or ahead of remote
    const changes = await getLocalChanges();
    const aheadRes = await run(`git rev-list ${REMOTE}/${BRANCH}..HEAD`);
    const isAhead = aheadRes.ok && aheadRes.stdout.length > 0;

    if (changes.length > 0 || isAhead) {
      if (!pendingPushTimeout) {
        pendingPushTimeout = setTimeout(async () => {
          pendingPushTimeout = null;
          await syncPush();
        }, DEBOUNCE_PUSH_MS);
      }
    }
  } catch (err) {
    log(`Sync error: ${err.message}`);
  } finally {
    isSyncing = false;
  }
}

console.log('='.repeat(65));
console.log('  GBHPL Real-Time GitHub Synchronization Engine');
console.log(`  Tracking: ${REMOTE}/${BRANCH}`);
console.log(`  Pull Interval: ${POLL_INTERVAL_MS / 1000}s | Push Debounce: ${DEBOUNCE_PUSH_MS / 1000}s`);
console.log('='.repeat(65));

// Run initial cycle immediately
cycle();

// Set recurring interval
setInterval(cycle, POLL_INTERVAL_MS);
