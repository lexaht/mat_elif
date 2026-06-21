export default {
  title: "Trigonometriske Funktioner",
  subtitle: "Hvad har bølger og cirkler med hinanden at gøre?",
  elif: `
    <p>Forestil dig, at du sidder i et <strong>pariserhjul</strong> (eller kigger på en cykelpedal, der kører rundt). Hjulet drejer rundt i en fast cirkel.</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Pariserhjul-analogien</div>
      <p class="analogy-text">
        Hvis du står foran hjulet og måler, <strong>hvor højt over jorden</strong> din ven i pariserhjulet er, vil du se, at de kører op, flader ud i toppen, kører ned, og flader ud i bunden. Tegner du denne højde over tid, får du en blød, bølgende streg. Det kalder vi en <strong>sinus-bølge</strong>.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        Hvis du i stedet ligger på jorden direkte under hjulet og måler, <strong>hvor langt til højre eller venstre</strong> din ven er fra midten, får du en bølge, der er rykket en lille smule. Det kalder vi en <strong>cosinus-bølge</strong>.
      </p>
    </div>

    <p>Trigonometri handler dybest set bare om at beskrive denne cirkel-bevægelse. Når noget gentager sig (som lydbølger, lys, havbølger eller årstider), bruger vi sinus og cosinus til at beskrive det i computerprogrammer og fysik.</p>
  `,
  formula: `
    <div class="formula-card-sub">Trigonometri i en enhedscirkel (en cirkel med radius 1) og retvinklede trekanter.</div>
    
    <p>For en vinkel <span data-math="\\theta" data-display="inline"></span> i enhedscirklen defineres sinus og cosinus som koordinaterne til retningspunktet <span data-math="P(x,y)" data-display="inline"></span>:</p>
    <div data-math="cos(\\theta) = x"></div>
    <div data-math="sin(\\theta) = y"></div>
    <div data-math="tan(\\theta) = \\frac{sin(\\theta)}{cos(\\theta)} = \\frac{y}{x} \\quad (x \\neq 0)"></div>

    <p style="margin-top: 20px;">I en retvinklet trekant defineres de ud fra sidernes forhold:</p>
    <ul class="formula-desc-list">
      <li><strong>Sinus:</strong> Modstående katete divideret med hypotenusen: <span data-math="sin(\\theta) = \\frac{\\text{modstående}}{\\text{hypotenuse}}" data-display="inline"></span></li>
      <li><strong>Cosinus:</strong> Hosliggende katete divideret med hypotenusen: <span data-math="cos(\\theta) = \\frac{\\text{hosliggende}}{\\text{hypotenuse}}" data-display="inline"></span></li>
      <li><strong>Tangens:</strong> Modstående katete divideret med hosliggende katete: <span data-math="tan(\\theta) = \\frac{\\text{modstående}}{\\text{hosliggende}}" data-display="inline"></span></li>
    </ul>

    <p style="margin-top: 20px;">For en bølge, der ændrer sig over tid <span data-math="t" data-display="inline"></span>, bruger vi formlen:</p>
    <div data-math="y(t) = A \\cdot \\sin(\\omega t + \\phi)"></div>
    <ul class="formula-desc-list">
      <li><strong>A (Amplitude):</strong> Bølgens højde (hvor højt går hjulet op).</li>
      <li><strong><span data-math="\\omega" data-display="inline"></span> (Vinkelfrekvens):</strong> Hvor hurtigt hjulet drejer rundt (<span data-math="\\omega = 2\\pi f" data-display="inline"></span>).</li>
      <li><strong><span data-math="\\phi" data-display="inline"></span> (Faseforskydning):</strong> Hvor hjulet startede, da vi begyndte at tage tid.</li>
    </ul>
  `,
  initVisualizer: (container, controls) => {
    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let isPlaying = true;
    let speed = 0.02;
    let angle = 0;
    let showWave = 'sin'; // 'sin', 'cos', 'both'

    // Wave history
    const waveHistory = [];
    const maxHistory = 350;

    // Controls setup
    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Frekvens (Hastighed): <span class="control-value" id="speed-val">2.0 Hz</span></label>
        <input type="range" class="slider-input" id="speed-slider" min="0.005" max="0.08" step="0.005" value="0.02">
      </div>
      <div class="control-group">
        <label class="control-label">Vis funktion:</label>
        <div class="btn-group">
          <button class="control-btn" id="btn-show-sin" style="background-color: var(--accent-pink); color: white;">Sinus</button>
          <button class="control-btn" id="btn-show-cos">Cosinus</button>
          <button class="control-btn" id="btn-show-both">Begge</button>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Handling:</label>
        <div class="btn-group">
          <button class="control-btn" id="btn-play-pause">
            <i class="fa-solid fa-pause"></i> <span id="play-text">Pause</span>
          </button>
          <button class="control-btn" id="btn-reset">Nulstil</button>
        </div>
      </div>
    `;

    // Hook controls
    const speedSlider = document.getElementById('speed-slider');
    const speedVal = document.getElementById('speed-val');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const playText = document.getElementById('play-text');
    const btnReset = document.getElementById('btn-reset');
    const btnSin = document.getElementById('btn-show-sin');
    const btnCos = document.getElementById('btn-show-cos');
    const btnBoth = document.getElementById('btn-show-both');

    speedSlider.addEventListener('input', (e) => {
      speed = parseFloat(e.target.value);
      speedVal.textContent = (speed * 100).toFixed(1) + ' Hz';
    });

    btnPlayPause.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlayPause.innerHTML = isPlaying 
        ? '<i class="fa-solid fa-pause"></i> <span>Pause</span>' 
        : '<i class="fa-solid fa-play"></i> <span>Start</span>';
    });

    btnReset.addEventListener('click', () => {
      angle = 0;
      waveHistory.length = 0;
      if (!isPlaying) draw();
    });

    function updateActiveButton(activeBtn) {
      [btnSin, btnCos, btnBoth].forEach(btn => {
        btn.style.backgroundColor = 'var(--bg-tertiary)';
        btn.style.color = 'var(--text-primary)';
      });
      if (activeBtn === 'sin') {
        btnSin.style.backgroundColor = 'var(--accent-pink)';
        btnSin.style.color = 'white';
      } else if (activeBtn === 'cos') {
        btnCos.style.backgroundColor = 'var(--accent-blue)';
        btnCos.style.color = 'white';
      } else {
        btnBoth.style.backgroundColor = 'var(--accent-indigo)';
        btnBoth.style.color = 'white';
      }
    }

    btnSin.addEventListener('click', () => { showWave = 'sin'; updateActiveButton('sin'); });
    btnCos.addEventListener('click', () => { showWave = 'cos'; updateActiveButton('cos'); });
    btnBoth.addEventListener('click', () => { showWave = 'both'; updateActiveButton('both'); });

    // Handle Canvas Sizing
    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    // Initial size
    resize();
    window.addEventListener('resize', resize);

    // Animation Loop
    function draw() {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, w, h);

      // Define visual centers
      const circleCenterX = w * 0.25;
      const circleCenterY = h * 0.5;
      const radius = Math.min(w * 0.15, h * 0.3);
      const waveStartX = w * 0.5;

      // Draw unit circle background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw X & Y axes for circle
      ctx.beginPath();
      ctx.moveTo(circleCenterX - radius - 20, circleCenterY);
      ctx.lineTo(circleCenterX + radius + 20, circleCenterY);
      ctx.moveTo(circleCenterX, circleCenterY - radius - 20);
      ctx.lineTo(circleCenterX, circleCenterY + radius + 20);
      ctx.stroke();

      // Current Point on Circle
      const px = circleCenterX + radius * Math.cos(-angle);
      const py = circleCenterY + radius * Math.sin(-angle); // minus to rotate counter-clockwise on canvas

      // Draw Rotating Arm
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(circleCenterX, circleCenterY);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Store history (y-coord for sine, x-coord for cosine relative to center)
      if (isPlaying) {
        waveHistory.unshift({
          y: py - circleCenterY,
          x: px - circleCenterX,
          angle: angle
        });
        if (waveHistory.length > maxHistory) {
          waveHistory.pop();
        }
      }

      // Draw projections and wave lines
      if (showWave === 'sin' || showWave === 'both') {
        // Line from point on circle to sine wave start
        ctx.strokeStyle = 'var(--accent-pink)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(waveStartX, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Sine wave
        ctx.strokeStyle = 'var(--accent-pink)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < waveHistory.length; i++) {
          const wx = waveStartX + i * ((w - waveStartX) / maxHistory);
          const wy = circleCenterY + waveHistory[i].y;
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      if (showWave === 'cos' || showWave === 'both') {
        // Line from point on circle to cosine wave start (needs to project X coordinate)
        ctx.strokeStyle = 'var(--accent-blue)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        // For Cosine, we project the X coordinate onto the vertical axis
        ctx.moveTo(px, py);
        ctx.lineTo(px, circleCenterY - radius - 20); // project up
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Cosine wave (rendered horizontally for comparison, or offset vertically)
        ctx.strokeStyle = 'var(--accent-blue)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < waveHistory.length; i++) {
          const wx = waveStartX + i * ((w - waveStartX) / maxHistory);
          // Cosine wave uses the X coordinate offset as its amplitude offset
          const wy = circleCenterY + waveHistory[i].x; 
          if (i === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      // Draw Rotating Point on circle
      ctx.fillStyle = 'var(--text-primary)';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();

      // Axis labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px monospace';
      ctx.fillText('0°', circleCenterX + radius + 5, circleCenterY + 12);
      ctx.fillText('90°', circleCenterX - 8, circleCenterY - radius - 5);
      ctx.fillText('180°', circleCenterX - radius - 30, circleCenterY + 12);
      ctx.fillText('270°', circleCenterX - 13, circleCenterY + radius + 15);

      // Increment angle
      if (isPlaying) {
        angle += speed;
        if (angle > Math.PI * 2) angle -= Math.PI * 2;
      }
    }

    function animate() {
      draw();
      animationId = requestAnimationFrame(animate);
    }
    
    animate();

    // Return cleanup function
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }
};
