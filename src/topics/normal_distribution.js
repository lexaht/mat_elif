export default {
  title: "Normalfordeling",
  subtitle: "Naturens egen klokkeformede kurve",
  elif: `
    <p>Hvorfor er de fleste voksne danskere omkring gennemsnitshøjden, mens meget få er ekstremt lave eller ekstremt høje?</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Galtonbræt-analogien</div>
      <p class="analogy-text">
        Forestil dig, at du slipper en lille kugle ned gennem en plade fyldt med søm. Hver gang kuglen rammer et søm, har den 50% chance for at hoppe til venstre og 50% chance for at hoppe til højre.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        For at ende helt ude i den <strong>venstre side</strong>, skal kuglen have "held" til at hoppe til venstre <em>hver evig eneste gang</em>. Det sker næsten aldrig.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        For at ende i <strong>midten</strong>, skal den bare hoppe cirka lige mange gange til venstre som til højre. Det er der rigtig mange kombinationer, der giver!
      </p>
    </div>

    <p>Når mange uafhængige, tilfældige begivenheder (som genetik, kost og miljø) lægges sammen, vil resultatet næsten altid fordele sig i en smuk "klokkeform", der er høj i midten og flader ud til siderne. Dette fænomen kaldes Den Centrale Grænseværdisætning.</p>
  `,
  formula: `
    <div class="formula-card-sub">Sandsynlighedstæthedsfunktionen for en normalfordelt variabel X ~ N(μ, σ²).</div>
    
    <p>Normalfordelingen beskrives matematisk ved denne funktion, som tegner selve klokken:</p>
    <div data-math="f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\cdot e^{-\\frac{1}{2} \\left( \\frac{x - \\mu}{\\sigma} \\right)^2}"></div>
    
    <ul class="formula-desc-list">
      <li><strong><span data-math="\\mu" data-display="inline"></span> (Middelværdi):</strong> Klokkens centrum (gennemsnittet).</li>
      <li><strong><span data-math="\\sigma" data-display="inline"></span> (Standardafvigelse):</strong> Spredningen. Stor spredning = bred, lav klokke.</li>
    </ul>

    <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
      <h4 style="margin-bottom: 10px; color: var(--accent-pink);">Z-Kurven og 68-95-99.7% reglen</h4>
      <p style="font-size: 14px; margin-bottom: 15px; color: var(--text-secondary);">En standard normalfordeling (hvor μ=0 og σ=1) gør det nemt at se, hvor stor en procentdel af data der ligger inden for et bestemt antal standardafvigelser. Træk i slideren for at se arealet under kurven!</p>
      
      <div class="control-group" style="margin-bottom: 15px;">
        <label class="control-label" style="color: white;">Interval: <span data-math="\\mu \\pm " data-display="inline"></span><span id="z-val-display" style="color: var(--accent-pink); font-weight: bold;">1</span><span data-math="\\sigma" data-display="inline"></span></label>
        <input type="range" class="slider-input" id="z-slider" min="0" max="3.5" step="0.1" value="1">
      </div>

      <div id="zcurve-container" style="width: 100%; height: 250px; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow: hidden; position: relative;">
        <div id="z-area-text" style="position: absolute; top: 20px; left: 20px; color: white; font-weight: bold; font-size: 18px;">Areal: 68.3%</div>
      </div>
    </div>
  `,
  initVisualizer: (container, controls, formulaContainer) => {
    // 1. GALTON BOARD VISUALIZER
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    let animationId = null;
    let isPlaying = true;
    let spawnRate = 4;
    let dropInterval = null;
    
    const gravity = 0.15;
    const bounceLoss = 0.3;
    const pegRadius = 3;
    const ballRadius = 4;

    const balls = [];
    const pegs = [];
    const bins = Array(15).fill(0);
    let ballCounter = 0;

    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Drop-hastighed: <span class="control-value" id="speed-val">Hurtig</span></label>
        <div class="btn-group">
          <button class="control-btn" id="btn-speed-slow">Langsom</button>
          <button class="control-btn" id="btn-speed-fast" style="background-color: var(--accent-indigo); color: white;">Hurtig</button>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Drop kugler:</label>
        <button class="control-btn" id="btn-drop-bulk" style="background-color: var(--accent-pink); color: white;">
          <i class="fa-solid fa-circle-nodes"></i> Slip 50 kugler
        </button>
      </div>
      <div class="control-group">
        <label class="control-label">Statistik & Handling:</label>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:var(--text-secondary);">Kugler talt: <strong id="ball-count" class="control-value">0</strong></span>
          <button class="control-btn" id="btn-reset">Nulstil</button>
        </div>
      </div>
    `;

    document.getElementById('btn-speed-slow').addEventListener('click', (e) => setSpawnRate(1, 'Langsom', e.target));
    document.getElementById('btn-speed-fast').addEventListener('click', (e) => setSpawnRate(6, 'Hurtig', e.target));
    
    document.getElementById('btn-drop-bulk').addEventListener('click', () => {
      for (let i = 0; i < 50; i++) setTimeout(spawnBall, i * 40);
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      balls.length = 0; bins.fill(0); ballCounter = 0; document.getElementById('ball-count').textContent = 0;
    });

    function setSpawnRate(rate, label, targetBtn) {
      spawnRate = rate;
      document.getElementById('speed-val').textContent = label;
      document.querySelectorAll('#btn-speed-slow, #btn-speed-fast').forEach(b => {
        b.style.backgroundColor = 'var(--bg-tertiary)'; b.style.color = 'var(--text-primary)';
      });
      targetBtn.style.backgroundColor = 'var(--accent-indigo)'; targetBtn.style.color = 'white';
      startSpawning();
    }

    function spawnBall() {
      const w = canvas.width / window.devicePixelRatio || container.clientWidth;
      if (w === 0) return;
      balls.push({
        x: w / 2 + (Math.random() - 0.5) * 2,
        y: 15, vx: 0, vy: 0,
        color: `hsl(${220 + Math.random() * 80}, 85%, 65%)`
      });
    }

    function startSpawning() {
      if (dropInterval) clearInterval(dropInterval);
      dropInterval = setInterval(() => {
        if (isPlaying && !document.hidden && container.clientWidth > 0) spawnBall();
      }, 1000 / spawnRate);
    }

    function setupPegs(w, h) {
      pegs.length = 0;
      const centerX = w / 2;
      const rows = 9;
      const spacingY = 22;
      const spacingX = 26;
      const startY = 45;
      for (let r = 0; r < rows; r++) {
        const y = startY + r * spacingY;
        const count = r + 1;
        const startX = centerX - ((count - 1) * spacingX) / 2;
        for (let c = 0; c < count; c++) pegs.push({ x: startX + c * spacingX, y: y });
      }
    }

    let mainObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if(rect.width > 0) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        setupPegs(rect.width, rect.height);
      }
    });
    mainObserver.observe(container);

    startSpawning();

    function draw() {
      const w = canvas.width / window.devicePixelRatio || container.clientWidth;
      const h = canvas.height / window.devicePixelRatio || container.clientHeight;
      if (w === 0) return;
      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const binBottomY = h * 0.95;
      const binTopY = h * 0.7;
      const binHeight = binBottomY - binTopY;
      const numBins = bins.length;
      const binWidth = 24;
      const binStartX = centerX - (numBins * binWidth) / 2;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= numBins; i++) {
        const bx = binStartX + i * binWidth;
        ctx.beginPath(); ctx.moveTo(bx, binTopY - 10); ctx.lineTo(bx, binBottomY); ctx.stroke();
      }

      const maxInBin = Math.max(...bins, 10);
      for (let i = 0; i < numBins; i++) {
        const count = bins[i];
        if (count > 0) {
          const bx = binStartX + i * binWidth;
          const barHeight = Math.min((count / maxInBin) * binHeight, binHeight);
          const grad = ctx.createLinearGradient(bx, binBottomY, bx, binBottomY - barHeight);
          grad.addColorStop(0, 'var(--accent-indigo)'); grad.addColorStop(1, 'var(--accent-purple)');
          ctx.fillStyle = grad;
          ctx.fillRect(bx + 2, binBottomY - barHeight, binWidth - 4, barHeight);
        }
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      pegs.forEach(peg => {
        ctx.beginPath(); ctx.arc(peg.x, peg.y, pegRadius, 0, Math.PI*2); ctx.fill();
      });

      for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        ball.vy += gravity; 
        ball.x += ball.vx; 
        ball.y += ball.vy;

        pegs.forEach(peg => {
          const dx = ball.x - peg.x; const dy = ball.y - peg.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const minDist = ballRadius + pegRadius;
          if (dist < minDist) {
            const overlap = minDist - dist; const nx = dx/dist; const ny = dy/dist;
            ball.x += nx * overlap; ball.y += ny * overlap;
            const dot = ball.vx*nx + ball.vy*ny;
            ball.vx = (ball.vx - 2*dot*nx) * bounceLoss + (Math.random() - 0.5) * 0.2; // reduced random jitter
            ball.vy = (ball.vy - 2*dot*ny) * bounceLoss + 0.1;
          }
        });

        // Add funnel walls so balls cannot escape the pyramid horizontally
        // The pyramid width grows as it goes down. 
        const py = Math.max(0, ball.y - 45); // 45 is startY
        const maxDistFromCenter = 26 + (py / 22) * 13; // rough funnel based on rows (spacingY=22, spacingX=26/2)
        if (ball.x < centerX - maxDistFromCenter) {
           ball.x = centerX - maxDistFromCenter;
           ball.vx = Math.abs(ball.vx) * bounceLoss + 0.5; // bounce right
        } else if (ball.x > centerX + maxDistFromCenter) {
           ball.x = centerX + maxDistFromCenter;
           ball.vx = -Math.abs(ball.vx) * bounceLoss - 0.5; // bounce left
        }

        if (ball.y >= binTopY) {
          let binIndex = Math.floor((ball.x - binStartX) / binWidth);
          // Clamp to valid bins so balls never disappear
          if (binIndex < 0) binIndex = 0;
          if (binIndex >= numBins) binIndex = numBins - 1;
          
          bins[binIndex]++; 
          ballCounter++; 
          document.getElementById('ball-count').textContent = ballCounter;
          
          balls.splice(i, 1);
          continue;
        }

        ctx.fillStyle = ball.color;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI*2); ctx.fill();
      }
    }


    // 2. Z-CURVE VISUALIZER (Inside Formula Drawer)
    let zCanvas = null;
    let zCtx = null;
    let zObserver = null;
    let zValue = 1.0;

    function erf(x) {
      // Error function approximation for calculating accurate areas
      const sign = (x >= 0) ? 1 : -1;
      x = Math.abs(x);
      const a1 =  0.254829592, a2 = -0.284496736, a3 =  1.421413741, a4 = -1.453152027, a5 =  1.061405429;
      const p  =  0.3275911;
      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      return sign * y;
    }

    function getNormalArea(z) {
      return (erf(z / Math.sqrt(2))) * 100;
    }

    function initZCurve() {
      const zContainer = document.getElementById('zcurve-container');
      if (!zContainer) { setTimeout(initZCurve, 100); return; }

      const zSlider = document.getElementById('z-slider');
      const zValDisp = document.getElementById('z-val-display');
      const zAreaText = document.getElementById('z-area-text');

      zSlider.addEventListener('input', (e) => {
        zValue = parseFloat(e.target.value);
        zValDisp.textContent = zValue.toFixed(1);
        zAreaText.textContent = 'Areal: ' + getNormalArea(zValue).toFixed(1) + '%';
        drawZCurve();
      });

      zCanvas = document.createElement('canvas');
      zCanvas.style.width = '100%'; zCanvas.style.height = '100%';
      zContainer.appendChild(zCanvas);
      zCtx = zCanvas.getContext('2d');

      zObserver = new ResizeObserver(() => {
        const rect = zContainer.getBoundingClientRect();
        if(rect.width > 0) {
          zCanvas.width = rect.width * window.devicePixelRatio;
          zCanvas.height = rect.height * window.devicePixelRatio;
          zCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
          drawZCurve();
        }
      });
      zObserver.observe(zContainer);
    }
    initZCurve();

    function drawZCurve() {
      if(!zCtx) return;
      const w = zCanvas.width / window.devicePixelRatio;
      const h = zCanvas.height / window.devicePixelRatio;
      if(w===0) return;
      zCtx.clearRect(0,0,w,h);

      const bottomY = h * 0.85;
      const centerX = w / 2;
      const scaleX = w / 8; // -4 to 4 standard deviations fits in width
      const scaleY = h * 0.7; // max height

      function normalPDF(x) { return Math.exp(-0.5 * x * x); } // Simplified standard normal (unnormalized height)

      // Draw highlighted area
      zCtx.fillStyle = 'rgba(236, 72, 153, 0.3)';
      zCtx.beginPath();
      zCtx.moveTo(centerX - zValue * scaleX, bottomY);
      for (let x = -zValue; x <= zValue; x += 0.05) {
        zCtx.lineTo(centerX + x * scaleX, bottomY - normalPDF(x) * scaleY);
      }
      zCtx.lineTo(centerX + zValue * scaleX, bottomY);
      zCtx.fill();

      // Draw curve outline
      zCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      zCtx.lineWidth = 3;
      zCtx.beginPath();
      for (let x = -4; x <= 4; x += 0.05) {
        const py = bottomY - normalPDF(x) * scaleY;
        const px = centerX + x * scaleX;
        if (x === -4) zCtx.moveTo(px, py);
        else zCtx.lineTo(px, py);
      }
      zCtx.stroke();

      // Axes
      zCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      zCtx.lineWidth = 1;
      zCtx.beginPath();
      zCtx.moveTo(0, bottomY); zCtx.lineTo(w, bottomY);
      zCtx.stroke();

      // Markers
      zCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      zCtx.font = '10px monospace';
      for(let i = -3; i <= 3; i++) {
        const px = centerX + i * scaleX;
        zCtx.fillRect(px, bottomY - 5, 1, 10);
        zCtx.fillText(i === 0 ? 'μ' : i+'σ', px - 6, bottomY + 15);
      }
      
      // Boundaries
      zCtx.strokeStyle = 'var(--accent-pink)';
      zCtx.setLineDash([4,4]);
      zCtx.beginPath();
      zCtx.moveTo(centerX - zValue * scaleX, bottomY);
      zCtx.lineTo(centerX - zValue * scaleX, bottomY - normalPDF(-zValue) * scaleY);
      zCtx.moveTo(centerX + zValue * scaleX, bottomY);
      zCtx.lineTo(centerX + zValue * scaleX, bottomY - normalPDF(zValue) * scaleY);
      zCtx.stroke();
      zCtx.setLineDash([]);
    }

    function animate() {
      draw();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      clearInterval(dropInterval);
      cancelAnimationFrame(animationId);
      mainObserver.disconnect();
      if(zObserver) zObserver.disconnect();
    };
  }
};
