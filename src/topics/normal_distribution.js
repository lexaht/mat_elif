export default {
  title: "Normalfordeling",
  subtitle: "Naturens egen klokkeformede kurve",
  elif: `
    <p>Hvorfor er de fleste voksne danskere mellem 170 og 180 cm høje, mens meget få er under 150 cm eller over 210 cm?</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Galtonbræt-analogien</div>
      <p class="analogy-text">
        Forestil dig, at du slipper en lille kugle ned gennem en plade fyldt med søm. Hver gang kuglen rammer et søm, har den 50% chance for at hoppe til venstre og 50% chance for at hoppe til højre.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        For at ende helt ude i den <strong>venstre side</strong>, skal kuglen hoppe til venstre <em>hver evig eneste gang</em>. Det sker næsten aldrig.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        For at ende i <strong>midten</strong>, skal den bare hoppe cirka lige mange gange til venstre som til højre. Det er der rigtig mange kombinationer, der giver!
      </p>
    </div>

    <p>Hvis du slipper 1000 kugler, vil de stable sig op i en smuk bunke, der er høj i midten og flader ud til siderne. Det kaldes en <strong>normalfordeling</strong> eller en <strong>klokkekurve</strong>. Naturen elsker denne kurve: højde, intelligens, skostørrelser, og præcisionen af fabriksmaskiner følger alle denne regel.</p>
  `,
  formula: `
    <div class="formula-card-sub">Sandsynlighedstæthedsfunktionen for en normalfordelt stokastisk variabel X ~ N(μ, σ²).</div>
    
    <p>Normalfordelingen beskrives matematisk ved den berømte tæthedsfunktion, som giver den bløde klokkeformede graf:</p>
    <div data-math="f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\cdot e^{-\\frac{1}{2} \\left( \\frac{x - \\mu}{\\sigma} \\right)^2}"></div>
    
    <p>Hvor:</p>
    <ul class="formula-desc-list">
      <li><strong><span data-math="\\mu" data-display="inline"></span> (My - Middelværdi):</strong> Tyngdepunktet eller centrum af klokken (gennemsnittet).</li>
      <li><strong><span data-math="\\sigma" data-display="inline"></span> (Sigma - Standardafvigelse):</strong> Spredningen. Jo større <span data-math="\\sigma" data-display="inline"></span> er, jo bredere og lavere bliver klokken (data er mere spredt).</li>
      <li><strong><span data-math="\\sigma^2" data-display="inline"></span> (Varians):</strong> Standardafvigelsen i anden.</li>
    </ul>

    <p style="margin-top: 20px;"><strong>68-95-99.7% reglen (Sandsynlighedsintervaller):</strong></p>
    <p>For enhver normalfordeling gælder det, at arealet under kurven svarer til sandsynligheden:</p>
    <ul class="formula-desc-list">
      <li>Ca. <strong>68,2%</strong> af alle observationer ligger inden for <span data-math="\\pm 1\\sigma" data-display="inline"></span> fra middelværdien: <span data-math="P(\\mu - \\sigma < X < \\mu + \\sigma) \\approx 0.682" data-display="inline"></span></li>
      <li>Ca. <strong>95,4%</strong> af alle observationer ligger inden for <span data-math="\\pm 2\\sigma" data-display="inline"></span> fra middelværdien: <span data-math="P(\\mu - 2\\sigma < X < \\mu + 2\\sigma) \\approx 0.954" data-display="inline"></span></li>
      <li>Ca. <strong>99,7%</strong> af alle observationer ligger inden for <span data-math="\\pm 3\\sigma" data-display="inline"></span> fra middelværdien: <span data-math="P(\\mu - 3\\sigma < X < \\mu + 3\\sigma) \\approx 0.997" data-display="inline"></span></li>
    </ul>
  `,
  initVisualizer: (container, controls) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let isPlaying = true;
    let spawnRate = 4; // Ball drops per second
    let dropInterval = null;
    
    // Physics constants
    const gravity = 0.15;
    const bounceLoss = 0.3;
    const pegRadius = 3;
    const ballRadius = 4;

    // Simulation structures
    const balls = [];
    const pegs = [];
    const bins = Array(15).fill(0);
    let ballCounter = 0;

    // Controls setup
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

    const btnSlow = document.getElementById('btn-speed-slow');
    const btnFast = document.getElementById('btn-speed-fast');
    const btnDropBulk = document.getElementById('btn-drop-bulk');
    const btnReset = document.getElementById('btn-reset');
    const ballCountText = document.getElementById('ball-count');
    const speedVal = document.getElementById('speed-val');

    function setSpawnRate(rate, label) {
      spawnRate = rate;
      speedVal.textContent = label;
      
      [btnSlow, btnFast].forEach(btn => {
        btn.style.backgroundColor = 'var(--bg-tertiary)';
        btn.style.color = 'var(--text-primary)';
      });
      if (rate === 1) {
        btnSlow.style.backgroundColor = 'var(--accent-indigo)';
        btnSlow.style.color = 'white';
      } else {
        btnFast.style.backgroundColor = 'var(--accent-indigo)';
        btnFast.style.color = 'white';
      }

      startSpawning();
    }

    btnSlow.addEventListener('click', () => setSpawnRate(1, 'Langsom'));
    btnFast.addEventListener('click', () => setSpawnRate(6, 'Hurtig'));
    
    btnDropBulk.addEventListener('click', () => {
      // Spawn 50 balls with slight horizontal offsets immediately
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          spawnBall();
        }, i * 40);
      }
    });

    btnReset.addEventListener('click', () => {
      balls.length = 0;
      bins.fill(0);
      ballCounter = 0;
      ballCountText.textContent = 0;
    });

    function spawnBall() {
      // Spawn at the top center with tiny random offset
      const w = canvas.width / window.devicePixelRatio;
      balls.push({
        x: w / 2 + (Math.random() - 0.5) * 2,
        y: 15,
        vx: 0,
        vy: 0,
        color: `hsl(${220 + Math.random() * 80}, 85%, 65%)`
      });
    }

    function startSpawning() {
      if (dropInterval) clearInterval(dropInterval);
      dropInterval = setInterval(() => {
        if (isPlaying && document.hidden === false) {
          spawnBall();
        }
      }, 1000 / spawnRate);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      setupPegs();
    }

    function setupPegs() {
      pegs.length = 0;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      const centerX = w / 2;
      const rows = 9;
      const spacingY = 22;
      const spacingX = 26;
      const startY = 45;

      for (let r = 0; r < rows; r++) {
        const y = startY + r * spacingY;
        const count = r + 1;
        const startX = centerX - ((count - 1) * spacingX) / 2;
        for (let c = 0; c < count; c++) {
          pegs.push({ x: startX + c * spacingX, y: y });
        }
      }
    }

    window.addEventListener('resize', resize);
    resize();
    startSpawning();

    // Physics update + draw loop
    function draw() {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const binBottomY = h * 0.95;
      const binTopY = h * 0.7;
      const binHeight = binBottomY - binTopY;
      const numBins = bins.length;
      const binWidth = 24;
      const binStartX = centerX - (numBins * binWidth) / 2;

      // Draw bins outlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= numBins; i++) {
        const bx = binStartX + i * binWidth;
        ctx.beginPath();
        ctx.moveTo(bx, binTopY - 10);
        ctx.lineTo(bx, binBottomY);
        ctx.stroke();
      }

      // Draw accumulated histogram balls as stacked bars
      ctx.fillStyle = 'var(--accent-indigo)';
      const maxInBin = Math.max(...bins, 10);
      
      for (let i = 0; i < numBins; i++) {
        const count = bins[i];
        if (count > 0) {
          const bx = binStartX + i * binWidth;
          // Render a smooth solid bar instead of drawing hundreds of circles (better performance)
          const barHeight = Math.min((count / maxInBin) * binHeight, binHeight);
          
          // Gradient for the bar
          const grad = ctx.createLinearGradient(bx, binBottomY, bx, binBottomY - barHeight);
          grad.addColorStop(0, 'var(--accent-indigo)');
          grad.addColorStop(1, 'var(--accent-purple)');
          
          ctx.fillStyle = grad;
          ctx.fillRect(bx + 2, binBottomY - barHeight, binWidth - 4, barHeight);
          
          // Draw bin count text if space permits
          if (binWidth > 15 && count > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '8px monospace';
            ctx.fillText(count, bx + binWidth/2 - 4, binBottomY - barHeight - 4);
          }
        }
      }

      // Draw normal curve outline overlaying the bins
      ctx.strokeStyle = 'var(--accent-pink)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // Mathematically estimate the binomial curve transformed to canvas
      const meanBin = (numBins - 1) / 2;
      const stdDevBin = Math.sqrt(numBins * 0.25); // approximation for binomial n=15, p=0.5
      
      for (let x = binStartX; x <= binStartX + numBins * binWidth; x++) {
        // Map x to bin scale
        const binIndex = (x - binStartX) / binWidth;
        const z = (binIndex - meanBin) / stdDevBin;
        // Bell shape y = amplitude * e^(-z^2/2)
        const curveY = binBottomY - (binHeight * 0.85) * Math.exp(-0.5 * z * z);
        if (x === binStartX) ctx.moveTo(x, curveY);
        else ctx.lineTo(x, curveY);
      }
      ctx.stroke();

      // Draw Pegs
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      pegs.forEach(peg => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, pegRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and Draw active falling balls
      for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];

        // Apply gravity
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Collision check with pegs
        pegs.forEach(peg => {
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = ballRadius + pegRadius;

          if (dist < minDist) {
            // Collision response
            // Push out of collision
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Reflect velocity with bounce loss
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * bounceLoss;
            ball.vy = (ball.vy - 2 * dot * ny) * bounceLoss;

            // Add tiny random scattering to simulate real physics/coin flip
            ball.vx += (Math.random() - 0.5) * 0.3;
            // Push downwards slightly so it doesn't get stuck
            ball.vy += 0.2;
          }
        });

        // Left/right wall bounce
        if (ball.x < 15) {
          ball.x = 15;
          ball.vx = -ball.vx * bounceLoss;
        } else if (ball.x > w - 15) {
          ball.x = w - 15;
          ball.vx = -ball.vx * bounceLoss;
        }

        // Bins collision - check if ball has reached the bin top
        if (ball.y >= binTopY) {
          // Find which bin the ball fell into
          const binIndex = Math.floor((ball.x - binStartX) / binWidth);
          if (binIndex >= 0 && binIndex < numBins) {
            bins[binIndex]++;
            ballCounter++;
            ballCountText.textContent = ballCounter;
          }
          // Remove ball
          balls.splice(i, 1);
          continue;
        }

        // Draw ball
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function animate() {
      draw();
      animationId = requestAnimationFrame(animate);
    }
    
    animate();

    return () => {
      clearInterval(dropInterval);
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }
};
