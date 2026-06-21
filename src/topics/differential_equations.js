export default {
  title: "Differentialligninger",
  subtitle: "Hvordan ændrer ting sig over tid?",
  elif: `
    <p>Forestil dig en <strong>spand fyldt med vand</strong>, som har et lille hul i bunden. Vandet løber ud af hullet, men hvor hurtigt gør det det?</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Vandspands-analogien</div>
      <p class="analogy-text">
        Når spanden er <strong>helt fuld</strong>, er der meget pres på bunden. Vandet sprøjter ud med stor fart.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        Når spanden næsten er <strong>tom</strong>, er der næsten intet pres. Vandet render kun langsomt ud som en lille siver.
      </p>
    </div>

    <p>En differentialligning er blot en matematisk regel, der siger: <strong>"Hvor hurtigt noget ændrer sig (vandet der render ud), afhænger af, hvor meget vi har lige nu (hvor meget vand der er i spanden)"</strong>.</p>
    <p>Det bruges overalt i den virkelige verden: til at forudsige, hvordan sygdomme smitter (hvor hurtigt folk bliver syge afhænger af, hvor mange der allerede er syge), hvordan en varm kop kaffe køler af, eller hvordan en raket accelererer.</p>
  `,
  formula: `
    <div class="formula-card-sub">Førsteordens lineære differentialligninger og deres løsninger.</div>
    
    <p>I eksemplet med vandspanden er ændringshastigheden af vandmængden <span data-math="y'(t)" data-display="inline"></span> proportional med den nuværende vandmængde <span data-math="y(t)" data-display="inline"></span>. Dette beskrives ved differentialligningen:</p>
    <div data-math="y'(t) = -k \\cdot y(t)"></div>
    
    <p>Her er:</p>
    <ul class="formula-desc-list">
      <li><strong><span data-math="y(t)" data-display="inline"></span>:</strong> Vandmængden til tiden <span data-math="t" data-display="inline"></span>.</li>
      <li><strong><span data-math="y'(t)" data-display="inline"></span>:</strong> Hvor hurtigt vandet ændrer sig (negativ, fordi det render ud).</li>
      <li><strong><span data-math="k" data-display="inline"></span>:</strong> En positiv konstant (afhænger af hullets størrelse).</li>
    </ul>

    <p style="margin-top: 20px;">Løsningen til denne differentialligning er en funktion (og ikke bare et tal!). Den kaldes en eksponentiel aftagende funktion:</p>
    <div data-math="y(t) = y_0 \\cdot e^{-k \\cdot t}"></div>
    
    <p>Hvor:</p>
    <ul class="formula-desc-list">
      <li><strong><span data-math="y_0" data-display="inline"></span>:</strong> Vandmængden i spanden ved starten (<span data-math="t = 0" data-display="inline"></span>).</li>
      <li><strong><span data-math="e" data-display="inline"></span>:</strong> Eulers tal (ca. 2,718), basen for den naturlige eksponentialfunktion.</li>
    </ul>
  `,
  initVisualizer: (container, controls) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let isPlaying = true;
    
    // Variables
    let k = 0.005; // hole size/drain rate
    let y0 = 150; // initial height
    let t = 0;
    const history = [];
    const maxHistory = 300;

    // Controls setup
    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Start-vandstand (y₀): <span class="control-value" id="y0-val">150 px</span></label>
        <input type="range" class="slider-input" id="y0-slider" min="50" max="200" value="150">
      </div>
      <div class="control-group">
        <label class="control-label">Hullets størrelse (Drain rate k): <span class="control-value" id="k-val">0.005</span></label>
        <input type="range" class="slider-input" id="k-slider" min="0.001" max="0.015" step="0.001" value="0.005">
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

    const y0Slider = document.getElementById('y0-slider');
    const y0Val = document.getElementById('y0-val');
    const kSlider = document.getElementById('k-slider');
    const kVal = document.getElementById('k-val');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const playText = document.getElementById('play-text');
    const btnReset = document.getElementById('btn-reset');

    y0Slider.addEventListener('input', (e) => {
      y0 = parseInt(e.target.value);
      y0Val.textContent = y0 + ' px';
      if (t === 0) {
        history.length = 0;
        if (!isPlaying) draw();
      }
    });

    kSlider.addEventListener('input', (e) => {
      k = parseFloat(e.target.value);
      kVal.textContent = k.toFixed(3);
    });

    btnPlayPause.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlayPause.innerHTML = isPlaying 
        ? '<i class="fa-solid fa-pause"></i> <span>Pause</span>' 
        : '<i class="fa-solid fa-play"></i> <span>Start</span>';
    });

    btnReset.addEventListener('click', () => {
      t = 0;
      history.length = 0;
      if (!isPlaying) draw();
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, w, h);

      // Tank details
      const tankWidth = w * 0.18;
      const tankHeight = h * 0.6;
      const tankLeft = w * 0.12;
      const tankTop = h * 0.2;
      const tankBottom = tankTop + tankHeight;

      // Calculate current height based on analytical solution y(t) = y0 * e^(-k*t)
      const currentHeightValue = y0 * Math.exp(-k * t);

      // Draw tank outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tankLeft, tankTop);
      ctx.lineTo(tankLeft, tankBottom);
      ctx.lineTo(tankLeft + tankWidth, tankBottom);
      ctx.lineTo(tankLeft + tankWidth, tankTop);
      ctx.stroke();

      // Draw water
      const waterTop = tankBottom - (currentHeightValue / 200) * tankHeight;
      if (currentHeightValue > 1) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.fillRect(tankLeft + 2, waterTop, tankWidth - 4, tankBottom - waterTop - 2);

        // Draw escaping water jet
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.beginPath();
        // The speed of jet is proportional to pressure (height)
        const jetDistance = (currentHeightValue / 200) * 80;
        ctx.moveTo(tankLeft + tankWidth - 10, tankBottom - 5);
        ctx.quadraticCurveTo(
          tankLeft + tankWidth + jetDistance / 2, 
          tankBottom - 5, 
          tankLeft + tankWidth + jetDistance, 
          h * 0.9
        );
        ctx.lineTo(tankLeft + tankWidth + jetDistance - 5, h * 0.9);
        ctx.quadraticCurveTo(
          tankLeft + tankWidth + jetDistance / 2, 
          tankBottom, 
          tankLeft + tankWidth - 10, 
          tankBottom
        );
        ctx.fill();
      }

      // Record history for graph
      if (isPlaying) {
        history.push({ t: t, val: currentHeightValue });
        if (history.length > maxHistory) {
          history.shift();
        }
      }

      // Draw Graph area
      const graphLeft = w * 0.45;
      const graphTop = h * 0.2;
      const graphWidth = w * 0.45;
      const graphHeight = h * 0.6;
      const graphBottom = graphTop + graphHeight;

      // Draw Graph axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(graphLeft, graphTop - 10);
      ctx.lineTo(graphLeft, graphBottom);
      ctx.lineTo(graphLeft + graphWidth + 10, graphBottom);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px monospace';
      ctx.fillText('Højde y(t)', graphLeft - 10, graphTop - 15);
      ctx.fillText('Tid t', graphLeft + graphWidth - 10, graphBottom + 15);

      // Plot y(t) line
      if (history.length > 1) {
        ctx.strokeStyle = 'var(--accent-emerald)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        history.forEach((point, i) => {
          // Scale t to X
          // Scale val to Y
          const gx = graphLeft + (i / maxHistory) * graphWidth;
          const gy = graphBottom - (point.val / 200) * graphHeight;
          if (i === 0) ctx.moveTo(gx, gy);
          else ctx.lineTo(gx, gy);
        });
        ctx.stroke();
      }

      // Draw current coordinate dot on graph
      if (history.length > 0) {
        const dotX = graphLeft + ((history.length - 1) / maxHistory) * graphWidth;
        const dotY = graphBottom - (currentHeightValue / 200) * graphHeight;
        
        ctx.fillStyle = 'var(--accent-pink)';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Show current values on screen
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = '11px monospace';
        ctx.fillText(`y(${t.toFixed(0)}) = ${currentHeightValue.toFixed(1)}`, dotX + 10, dotY - 5);
      }

      // Increment time
      if (isPlaying) {
        t += 0.8;
      }
    }

    function animate() {
      draw();
      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }
};
