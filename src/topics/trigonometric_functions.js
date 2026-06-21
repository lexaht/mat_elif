export default {
  title: "Trigonometriske Funktioner",
  subtitle: "Cirkler, bølger og svingninger",
  elif: `
    <p>Har du nogensinde tænkt over, hvorfor bølgerne på havet, et pendul på et bornholmerur, og lyden fra en guitarstreng alle ligner hinanden?</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Pariserhjuls-analogien (Harmonisk svingning)</div>
      <p class="analogy-text">
        Forestil dig, at du kigger på et pariserhjul direkte fra siden (så det bare ligner en streg, der går op og ned). Hvis du tegner en prik på hjulet og følger dens højde, vil den starte i midten, gå op til toppen, ned gennem midten til bunden, og op igen.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        Hvis hjulet drejer med en konstant hastighed, og du ruller et langt stykke papir forbi bagved, vil prikken tegne en perfekt bølge!
      </p>
    </div>

    <p>Prikkens <em>højde</em> tegner den bølge, vi kalder <strong>sinus</strong>. Følger vi i stedet prikkens vandrette afstand fra midten, får vi en næsten ens bølge, bare lidt forskudt — den kalder vi <strong>cosinus</strong>. Sinus og cosinus er altså to måder at måle den samme prik på pariserhjulet.</p>

    <p>Trigonometri starter altid med en cirkel. En harmonisk svingning er bare matematikkens ord for "en gentagende, bølgende bevægelse, der kommer af noget, der kører i ring". Det er derfor sinus og cosinus bruges til alt, der svinger i naturen.</p>
  `,
  formula: `
    <div class="formula-card-sub">Den generelle harmoniske svingning.</div>
    
    <p>For at beskrive en bølge eller svingning bruger vi typisk funktionen for sinus eller cosinus med tre vigtige parametre:</p>
    <div data-math="y(t) = A \\cdot \\sin(\\omega \\cdot t + \\phi)"></div>
    
    <ul class="formula-desc-list">
      <li><strong><span data-math="A" data-display="inline"></span> (Amplitude):</strong> Bølgens højde (fra midten til toppen). Hvor voldsomt svinger den?</li>
      <li><strong><span data-math="\\omega" data-display="inline"></span> (Vinkelfrekvens):</strong> Hvor hurtigt kører vi rundt i cirklen? Bestemmer hvor tæt bølgerne ligger. <span data-math="\\omega = 2\\pi \\cdot f" data-display="inline"></span>.</li>
      <li><strong>Periode (<span data-math="T" data-display="inline"></span>):</strong> Tiden for én hel svingning. Den hænger sammen med vinkelfrekvensen ved <span data-math="T = \\frac{2\\pi}{\\omega}" data-display="inline"></span>. Stor <span data-math="\\omega" data-display="inline"></span> giver kort periode (bølgerne ligger tæt).</li>
      <li><strong><span data-math="\\phi" data-display="inline"></span> (Faseforskydning):</strong> Hvor starter vi henne i cirklen til tiden <span data-math="t=0" data-display="inline"></span>? Forskyder bølgen sidelæns. Et positivt <span data-math="\\phi" data-display="inline"></span> rykker bølgen til venstre, et negativt til højre.</li>
    </ul>

    <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
      <h4 style="margin-bottom: 10px; color: var(--accent-indigo);">Eksperimenter med Bølgens Parametre</h4>
      <p style="font-size: 14px; margin-bottom: 15px; color: var(--text-secondary);">Træk i sliderne for direkte at se, hvordan den matematiske forskrift påvirker grafens udseende!</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px;">
        <div class="control-group">
          <label class="control-label" style="color: white;">Amplitude (A): <span id="f-a-val" style="color:var(--accent-pink);">1.0</span></label>
          <input type="range" class="slider-input" id="f-a-slider" min="0" max="2" step="0.1" value="1">
        </div>
        <div class="control-group">
          <label class="control-label" style="color: white;">Frekvens (ω): <span id="f-w-val" style="color:var(--accent-emerald);">1.0</span></label>
          <input type="range" class="slider-input" id="f-w-slider" min="0.5" max="4" step="0.1" value="1">
        </div>
        <div class="control-group">
          <label class="control-label" style="color: white;">Fase (φ): <span id="f-p-val" style="color:var(--accent-blue);">0.0</span></label>
          <input type="range" class="slider-input" id="f-p-slider" min="-3.14" max="3.14" step="0.1" value="0">
        </div>
      </div>

      <div id="wave-container" style="width: 100%; height: 250px; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow: hidden;"></div>
    </div>
  `,
  initVisualizer: (container, controls, formulaContainer) => {
    // Canvas understands real color strings, not CSS var(--...). Resolve them once.
    const rootStyle = getComputedStyle(document.documentElement);
    const cssVar = (name, fallback) => rootStyle.getPropertyValue(name).trim() || fallback;
    const COLOR_PINK = cssVar('--accent-pink', '#ec4899');
    const COLOR_EMERALD = cssVar('--accent-emerald', '#10b981');
    const COLOR_INDIGO = cssVar('--accent-indigo', '#6366f1');
    const COLOR_TEXT = cssVar('--text-primary', '#f3f4f6');

    // 1. MAIN VISUALIZER
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    let animationId = null;
    let isPlaying = true;
    let t = 0;
    
    let showSin = true;
    let showCos = false;
    let waveSpeed = 0.05;

    const history = [];
    const maxHistory = 400;

    // Viewport-dependent drawing coordinates and properties
    const circleCenter = { x: 0, y: 0 };
    let radius = 0;
    let waveStart = 0;
    let waveWidth = 0;
    let px = 0;
    let py = 0;

    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Vis funktioner:</label>
        <div style="display: flex; gap: 15px;">
          <label style="color: var(--accent-pink); display: flex; align-items: center; gap: 5px; cursor: pointer;">
            <input type="checkbox" id="check-sin" checked> Sinus (Y-akse)
          </label>
          <label style="color: var(--accent-emerald); display: flex; align-items: center; gap: 5px; cursor: pointer;">
            <input type="checkbox" id="check-cos"> Cosinus (X-akse)
          </label>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Hastighed: <span class="control-value" id="speed-val">50%</span></label>
        <input type="range" class="slider-input" id="speed-slider" min="1" max="100" value="50">
      </div>
      <div class="control-group">
        <label class="control-label">Handling:</label>
        <div class="btn-group">
          <button class="control-btn" id="btn-play-pause"><i class="fa-solid fa-pause"></i> <span>Pause</span></button>
        </div>
      </div>
    `;

    document.getElementById('check-sin').addEventListener('change', (e) => { showSin = e.target.checked; });
    document.getElementById('check-cos').addEventListener('change', (e) => { showCos = e.target.checked; });

    document.getElementById('speed-slider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('speed-val').textContent = val + '%';
      waveSpeed = val * 0.001;
    });

    const btnPlay = document.getElementById('btn-play-pause');
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i> <span>Pause</span>' : '<i class="fa-solid fa-play"></i> <span>Start</span>';
    });

    let mainObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if(rect.width > 0) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        history.length = 0;
        t = 0;
      }
    });
    mainObserver.observe(container);

    function drawMain() {
      const w = canvas.width / window.devicePixelRatio || container.clientWidth;
      const h = canvas.height / window.devicePixelRatio || container.clientHeight;
      if(w===0) return;
      ctx.clearRect(0, 0, w, h);

      circleCenter.x = w * 0.25;
      circleCenter.y = h / 2;
      radius = Math.min(w, h) * 0.3;
      waveStart = w * 0.5;
      waveWidth = w - waveStart - 15;
      // The wave is plotted left -> right as the angle runs from 0 to 4π, then
      // wipes and starts over (oscilloscope style), so the curve stays put on
      // screen instead of scrolling away.
      const FULL_SPAN = 8 * Math.PI;
      const xFor = (rawT) => waveStart + (Math.max(0, Math.min(rawT, FULL_SPAN)) / FULL_SPAN) * waveWidth;

      const angle = t;
      px = circleCenter.x + radius * Math.cos(angle);
      py = circleCenter.y - radius * Math.sin(angle); // negative y because canvas y is down
      const penX = xFor(angle); // where the "pen" is currently drawing

      if (isPlaying) {
        // store both sin and cos components, oldest first
        history.push({ sin: py, cos: px, rawT: t });
        t += waveSpeed;
        if (t >= FULL_SPAN) { t = 0; history.length = 0; } // wipe and restart the sweep
      }

      // Draw circle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(circleCenter.x, circleCenter.y, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw axes for circle
      ctx.beginPath();
      ctx.moveTo(circleCenter.x - radius - 10, circleCenter.y); ctx.lineTo(circleCenter.x + radius + 10, circleCenter.y);
      ctx.moveTo(circleCenter.x, circleCenter.y - radius - 10); ctx.lineTo(circleCenter.x, circleCenter.y + radius + 10);
      ctx.stroke();

      // Draw quadrant labels on the circle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("0", circleCenter.x + radius + 15, circleCenter.y);
      ctx.fillText("π/2", circleCenter.x, circleCenter.y - radius - 15);
      ctx.fillText("π", circleCenter.x - radius - 15, circleCenter.y);
      ctx.fillText("3π/2", circleCenter.x, circleCenter.y + radius + 15);

      // Draw radius line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath(); ctx.moveTo(circleCenter.x, circleCenter.y); ctx.lineTo(px, py); ctx.stroke();

      // Draw angle arc and text on circle
      if (angle > 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(circleCenter.x, circleCenter.y, radius * 0.2, 0, -angle, true);
        ctx.stroke();

        const midAngle = angle / 2;
        const textRadius = radius * 0.2 + 15;
        const textX = circleCenter.x + textRadius * Math.cos(-midAngle);
        const textY = circleCenter.y + textRadius * Math.sin(-midAngle);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const tempGetTLabel = (val) => {
          const exactMultiple = Math.round(val / (Math.PI / 2));
          const diff = Math.abs(val - exactMultiple * (Math.PI / 2));
          if (diff < 0.08) {
            if (exactMultiple === 0) return "0";
            if (exactMultiple === 1) return "π/2";
            if (exactMultiple === 2) return "π";
            if (exactMultiple === 3) return "3π/2";
            if (exactMultiple % 2 === 0) return (exactMultiple/2) + "π";
            return exactMultiple + "π/2";
          }
          return (val / Math.PI).toFixed(2) + "π";
        };
        ctx.fillText(tempGetTLabel(angle), textX, textY);
      }

      // Highlight active components on the circle axes
      ctx.lineWidth = 3;
      if (showSin) {
        ctx.strokeStyle = COLOR_PINK;
        ctx.beginPath(); ctx.moveTo(px, circleCenter.y); ctx.lineTo(px, py); ctx.stroke();
        
        // Dotted line from the circle to the pen drawing the wave
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(penX, py); ctx.stroke();
        ctx.setLineDash([]);
      }
      if (showCos) {
        ctx.strokeStyle = COLOR_EMERALD;
        ctx.beginPath(); ctx.moveTo(circleCenter.x, py); ctx.lineTo(px, py); ctx.stroke();
        
        // Dotted line from the circle to the pen drawing the wave
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(penX, circleCenter.y - (px - circleCenter.x)); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw point on circle
      ctx.fillStyle = COLOR_TEXT;
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();

      // Draw wave axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(waveStart, circleCenter.y); ctx.lineTo(w, circleCenter.y); ctx.stroke();

      // Draw axis labels (pi, 2pi, etc) dynamically along the wave history
      // We will place a marker every time rawT crosses a multiple of Math.PI/2
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      
      // Look through history to find points close to multiples of pi/2
      for (let i = 0; i < history.length; i++) {
        const pt = history[i];
        // checking modulo Math.PI/2
        const m = pt.rawT % (Math.PI / 2);
        if (m < waveSpeed * 1.5 || m > (Math.PI/2) - waveSpeed * 1.5) {
          // This point is close to a multiple of pi/2
          const exactMultiple = Math.round(pt.rawT / (Math.PI / 2));
          if (i > 0 && Math.round(history[i-1].rawT / (Math.PI/2)) === exactMultiple) continue; // avoid duplicates

          const waveX = xFor(pt.rawT);
          ctx.fillRect(waveX, circleCenter.y - 4, 1, 8);
          
          let label = "";
          if (exactMultiple === 0) label = "0";
          else if (exactMultiple === 1) label = "π/2";
          else if (exactMultiple === 2) label = "π";
          else if (exactMultiple === 3) label = "3π/2";
          else if (exactMultiple % 2 === 0) label = (exactMultiple/2) + "π";
          else label = exactMultiple + "π/2";
          
          ctx.fillText(label, waveX, circleCenter.y + 18);
        }
      }

      // Draw wave history (plotted left -> right by angle)
      ctx.lineWidth = 3;
      if (showSin && history.length > 1) {
        ctx.strokeStyle = COLOR_PINK;
        ctx.beginPath();
        ctx.moveTo(xFor(history[0].rawT), history[0].sin);
        for (let i = 1; i < history.length; i++) {
          ctx.lineTo(xFor(history[i].rawT), history[i].sin);
        }
        ctx.stroke();
      }
      if (showCos && history.length > 1) {
        ctx.strokeStyle = COLOR_EMERALD;
        ctx.beginPath();
        ctx.moveTo(xFor(history[0].rawT), circleCenter.y - (history[0].cos - circleCenter.x));
        for (let i = 1; i < history.length; i++) {
          ctx.lineTo(xFor(history[i].rawT), circleCenter.y - (history[i].cos - circleCenter.x));
        }
        ctx.stroke();
      }

      // Draw stamps for even pi's on the curves (0, 2pi, 4pi, 6pi, 8pi)
      const stampedMultiples = new Set();
      for (let i = 0; i < history.length; i++) {
        const pt = history[i];
        const twoPi = 2 * Math.PI;
        const m = pt.rawT % twoPi;
        if (m < waveSpeed * 1.5 || m > twoPi - waveSpeed * 1.5) {
          const exactMultiple = Math.round(pt.rawT / twoPi);
          if (stampedMultiples.has(exactMultiple)) continue;
          stampedMultiples.add(exactMultiple);
          
          const label = exactMultiple === 0 ? "0" : (exactMultiple * 2) + "π";
          const waveX = xFor(pt.rawT);
          
          if (showSin) {
            ctx.fillStyle = COLOR_PINK;
            ctx.beginPath(); ctx.arc(waveX, pt.sin, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, waveX, pt.sin - 8);
          }
          if (showCos) {
            ctx.fillStyle = COLOR_EMERALD;
            const cosY = circleCenter.y - (pt.cos - circleCenter.x);
            ctx.beginPath(); ctx.arc(waveX, cosY, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(label, waveX, cosY - 8);
          }
        }
      }

      // Draw active point and coordinates on the curves
      const getTLabel = (val) => {
        const exactMultiple = Math.round(val / (Math.PI / 2));
        const diff = Math.abs(val - exactMultiple * (Math.PI / 2));
        if (diff < 0.08) {
          if (exactMultiple === 0) return "0";
          if (exactMultiple === 1) return "π/2";
          if (exactMultiple === 2) return "π";
          if (exactMultiple === 3) return "3π/2";
          if (exactMultiple % 2 === 0) return (exactMultiple/2) + "π";
          return exactMultiple + "π/2";
        }
        return (val / Math.PI).toFixed(2) + "π";
      };

      if (showSin) {
        ctx.fillStyle = COLOR_PINK;
        ctx.beginPath(); ctx.arc(penX, py, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = COLOR_TEXT;
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`(t: ${getTLabel(angle)}, y: ${Math.sin(angle).toFixed(2)})`, penX + 8, py - 5);
      }
      if (showCos) {
        ctx.fillStyle = COLOR_EMERALD;
        const cosY = circleCenter.y - (px - circleCenter.x);
        ctx.beginPath(); ctx.arc(penX, cosY, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = COLOR_TEXT;
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`(t: ${getTLabel(angle)}, x: ${Math.cos(angle).toFixed(2)})`, penX + 8, cosY - 5);
      }
    }


    // 2. FORMULA VISUALIZER (Interactive Wave)
    let fCanvas = null;
    let fCtx = null;
    let fObserver = null;
    let fA = 1.0;
    let fW = 1.0;
    let fP = 0.0;

    function initFormulaWave() {
      const fContainer = document.getElementById('wave-container');
      if (!fContainer) { setTimeout(initFormulaWave, 100); return; }

      const sA = document.getElementById('f-a-slider');
      const vA = document.getElementById('f-a-val');
      const sW = document.getElementById('f-w-slider');
      const vW = document.getElementById('f-w-val');
      const sP = document.getElementById('f-p-slider');
      const vP = document.getElementById('f-p-val');

      sA.addEventListener('input', (e) => { fA = parseFloat(e.target.value); vA.textContent = fA.toFixed(1); drawFormulaWave(); });
      sW.addEventListener('input', (e) => { fW = parseFloat(e.target.value); vW.textContent = fW.toFixed(1); drawFormulaWave(); });
      sP.addEventListener('input', (e) => { fP = parseFloat(e.target.value); vP.textContent = fP.toFixed(1); drawFormulaWave(); });

      fCanvas = document.createElement('canvas');
      fCanvas.style.width = '100%'; fCanvas.style.height = '100%';
      fContainer.appendChild(fCanvas);
      fCtx = fCanvas.getContext('2d');

      fObserver = new ResizeObserver(() => {
        const rect = fContainer.getBoundingClientRect();
        if(rect.width > 0) {
          fCanvas.width = rect.width * window.devicePixelRatio;
          fCanvas.height = rect.height * window.devicePixelRatio;
          fCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
          drawFormulaWave();
        }
      });
      fObserver.observe(fContainer);
    }
    initFormulaWave();

    function drawFormulaWave() {
      if(!fCtx) return;
      const w = fCanvas.width / window.devicePixelRatio;
      const h = fCanvas.height / window.devicePixelRatio;
      if(w===0) return;
      fCtx.clearRect(0,0,w,h);

      const centerY = h / 2;
      const maxAmplitude = (h / 2) * 0.7;
      
      // Axes
      fCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      fCtx.lineWidth = 1;
      fCtx.beginPath();
      fCtx.moveTo(0, centerY); fCtx.lineTo(w, centerY);
      fCtx.stroke();

      // Grid/Ticks on X axis (representing Pi)
      fCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      fCtx.font = '12px monospace';
      fCtx.textAlign = 'center';
      
      const pixelsPerPi = 60; // 60 pixels = Pi

      for (let i = 0; i * pixelsPerPi < w; i++) {
        const px = i * pixelsPerPi;
        fCtx.fillRect(px, centerY - 5, 1, 10);
        let label = i === 0 ? "0" : (i === 1 ? "π" : i + "π");
        if (i > 0) fCtx.fillText(label, px, centerY + 20);
      }

      // Grid/Ticks on Y axis
      fCtx.fillRect(0, centerY - maxAmplitude, 10, 1);
      fCtx.textAlign = 'left';
      fCtx.fillText("1", 15, centerY - maxAmplitude + 4);
      fCtx.fillRect(0, centerY + maxAmplitude, 10, 1);
      fCtx.fillText("-1", 15, centerY + maxAmplitude + 4);

      // Wave
      fCtx.strokeStyle = COLOR_INDIGO;
      fCtx.lineWidth = 3;
      fCtx.beginPath();
      for(let x = 0; x < w; x++) {
        // x represents time t. scale it so pixelsPerPi = PI in math.
        const tVal = (x / pixelsPerPi) * Math.PI;
        const y = centerY - (fA * Math.sin(fW * tVal + fP)) * maxAmplitude;
        if(x===0) fCtx.moveTo(x, y);
        else fCtx.lineTo(x, y);
      }
      fCtx.stroke();
    }

    let isDraggingDot = false;

    function getMousePos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function rebuildHistory() {
      history.length = 0;
      for (let tempT = 0; tempT <= t; tempT += waveSpeed) {
        const px_temp = circleCenter.x + radius * Math.cos(tempT);
        const py_temp = circleCenter.y - radius * Math.sin(tempT);
        history.push({ sin: py_temp, cos: px_temp, rawT: tempT });
      }
    }

    const handleMouseDown = (e) => {
      if (isPlaying) return;
      const pos = getMousePos(e);
      const dx = pos.x - px;
      const dy = pos.y - py;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 18) {
        isDraggingDot = true;
        e.preventDefault();
      }
    };

    const handleMouseMove = (e) => {
      if (!isDraggingDot) return;
      const pos = getMousePos(e);
      const dx = pos.x - circleCenter.x;
      const dy = circleCenter.y - pos.y;
      let newAngle = Math.atan2(dy, dx);
      if (newAngle < 0) newAngle += 2 * Math.PI;

      const cycle = Math.floor(t / (2 * Math.PI));
      t = cycle * 2 * Math.PI + newAngle;

      const FULL_SPAN = 8 * Math.PI;
      if (t < 0) t = 0;
      if (t > FULL_SPAN) t = FULL_SPAN;

      rebuildHistory();
      drawMain();
    };

    const handleMouseUp = () => {
      isDraggingDot = false;
    };

    const handleTouchStart = (e) => {
      if (isPlaying) return;
      const pos = getMousePos(e);
      const dx = pos.x - px;
      const dy = pos.y - py;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 25) {
        isDraggingDot = true;
        e.preventDefault();
      }
    };

    const handleTouchMove = (e) => {
      if (!isDraggingDot) return;
      const pos = getMousePos(e);
      const dx = pos.x - circleCenter.x;
      const dy = circleCenter.y - pos.y;
      let newAngle = Math.atan2(dy, dx);
      if (newAngle < 0) newAngle += 2 * Math.PI;

      const cycle = Math.floor(t / (2 * Math.PI));
      t = cycle * 2 * Math.PI + newAngle;

      const FULL_SPAN = 8 * Math.PI;
      if (t < 0) t = 0;
      if (t > FULL_SPAN) t = FULL_SPAN;

      rebuildHistory();
      drawMain();
    };

    const handleTouchEnd = () => {
      isDraggingDot = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    function animate() {
      drawMain();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      mainObserver.disconnect();
      if(fObserver) fObserver.disconnect();

      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }
};
