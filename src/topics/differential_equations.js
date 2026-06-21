export default {
  title: "Differentialligninger",
  subtitle: "Hvordan beskriver vi ændringer?",
  elif: `
    <p>Når du kører i en bil, fortæller dit speedometer, præcis hvor hurtigt du kører i <em>dette øjeblik</em>. Det er din <strong>ændringshastighed</strong> (hvor hurtigt din afstand ændrer sig). I matematik kalder vi en ændringshastighed for en <strong>differentialkvotient</strong>.</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Vandspands-analogien (Eksponentiel)</div>
      <p class="analogy-text">
        Forestil dig en spand med et hul i bunden. Hvor hurtigt vandet render ud (farten) afhænger direkte af, hvor meget vand der er i spanden (trykket). Meget vand = høj fart. Lidt vand = lav fart.
      </p>
    </div>

    <div class="analogy-box">
      <div class="analogy-title">Bakterie-analogien (Logistisk)</div>
      <p class="analogy-text">
        Tænk på bakterier, der vokser i en skål. I starten er der masser af mad, så de formerer sig ekstremt hurtigt. Men når skålen begynder at blive fuld, slipper maden op, og væksten bremser op og stopper helt. Deres ændringshastighed afhænger af, hvor mange der er, <em>og</em> hvor meget plads der er tilbage!
      </p>
    </div>

    <p>En differentialligning er bare en matematisk regel (en ligning), der forklarer denne ændringshastighed. Den løser ikke sig selv til et simpelt tal, men dens "svar" er en hel graf (en funktion), der viser udviklingen over tid.</p>
  `,
  formula: `
    <div class="formula-card-sub">Differentialkvotienter og 1. ordens differentialligninger.</div>
    
    <p>En <strong>differentialkvotient</strong> <span data-math="y'" data-display="inline"></span> (eller <span data-math="\\frac{dy}{dt}" data-display="inline"></span>) beskriver hældningen af en tangent til en funktion – altså funktionens øjeblikkelige væksthastighed.</p>
    
    <p>En <strong>1. ordens differentialligning</strong> er en ligning, der indeholder den første afledte <span data-math="y'" data-display="inline"></span> og selve funktionen <span data-math="y" data-display="inline"></span>. Her er tre klassiske modeller fra gymnasiet:</p>
    
    <ul class="formula-desc-list">
      <li>
        <strong>Lineær vækst (Konstant ændring):</strong> 
        <span data-math="y' = k" data-display="inline"></span>. 
        Løsningen er en ret linje: <span data-math="y(t) = k \\cdot t + c" data-display="inline"></span>.
      </li>
      <li style="margin-top:10px;">
        <strong>Eksponentiel vækst/henfald:</strong> 
        <span data-math="y' = k \\cdot y" data-display="inline"></span>. 
        Løsningen er en eksponentialfunktion: <span data-math="y(t) = c \\cdot e^{kt}" data-display="inline"></span>.
      </li>
      <li style="margin-top:10px;">
        <strong>Logistisk vækst:</strong> 
        <span data-math="y' = k \\cdot y \\cdot (M - y)" data-display="inline"></span>. 
        Her er <span data-math="M" data-display="inline"></span> den maksimale bæreevne (plads i petriskålen). Løsningen danner en S-kurve, hvor væksten stopper, når <span data-math="y = M" data-display="inline"></span>.
      </li>
    </ul>

    <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
      <h4 style="margin-bottom: 10px; color: var(--accent-indigo);">Interaktivt Linjeelement-felt (Retningsfelt)</h4>
      <p style="font-size: 14px; margin-bottom: 15px; color: var(--text-secondary);">Et retningsfelt viser hældningen (y') for ethvert punkt (t, y) i et koordinatsystem. En løsningskurve (funktionen) skal altid følge "strømmen" i dette felt. Prøv at skifte vækstmodel øverst for at se, hvordan feltet ændrer sig!</p>
      <div id="slope-field-container" style="width: 100%; height: 300px; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow: hidden;"></div>
    </div>
  `,
  initVisualizer: (container, controls, formulaContainer) => {
    // 1. MAIN VISUALIZER (Graph)
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let isPlaying = true;
    
    // Variables
    let modelType = 'logistic'; // 'linear', 'exponential', 'logistic'
    let k = 0.003; 
    let M = 180; // Carrying capacity (pixels) for logistic
    let y0 = 10; // initial height
    let t = 0;
    const history = [];
    const maxHistory = 300;

    // Controls setup
    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Vækstmodel:</label>
        <select id="model-select" style="padding:8px; border-radius:4px; background:var(--bg-tertiary); color:white; border:1px solid var(--border-color); font-family:var(--font-sans);">
          <option value="logistic">Logistisk (S-kurve / Bakterier)</option>
          <option value="exponential">Eksponentiel Henfald (Vandspand)</option>
          <option value="linear">Lineær (Konstant fart)</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">Konstant (k): <span class="control-value" id="k-val">0.003</span></label>
        <input type="range" class="slider-input" id="k-slider" min="0.001" max="0.010" step="0.001" value="0.003">
      </div>
      <div class="control-group">
        <label class="control-label">Startværdi (y₀): <span class="control-value" id="y0-val">10</span></label>
        <input type="range" class="slider-input" id="y0-slider" min="5" max="150" value="10">
      </div>
      <div class="control-group">
        <label class="control-label">Handling:</label>
        <div class="btn-group">
          <button class="control-btn" id="btn-play-pause"><i class="fa-solid fa-pause"></i> <span>Pause</span></button>
          <button class="control-btn" id="btn-reset">Nulstil</button>
        </div>
      </div>
    `;

    const y0Slider = document.getElementById('y0-slider');
    const y0Val = document.getElementById('y0-val');
    const kSlider = document.getElementById('k-slider');
    const kVal = document.getElementById('k-val');
    const modelSelect = document.getElementById('model-select');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnReset = document.getElementById('btn-reset');

    function resetSim() {
      t = 0;
      history.length = 0;
      if (!isPlaying) {
        draw();
        if (slopeCtx) drawSlopeField();
      }
    }

    modelSelect.addEventListener('change', (e) => {
      modelType = e.target.value;
      if (modelType === 'linear') {
        kSlider.max = 0.5; kSlider.value = 0.2; k = 0.2;
        y0Slider.value = 10; y0 = 10;
      } else if (modelType === 'exponential') {
        kSlider.max = 0.02; kSlider.value = 0.005; k = 0.005;
        y0Slider.value = 150; y0 = 150;
      } else {
        kSlider.max = 0.01; kSlider.value = 0.003; k = 0.003;
        y0Slider.value = 10; y0 = 10;
      }
      kVal.textContent = k;
      y0Val.textContent = y0;
      resetSim();
    });

    y0Slider.addEventListener('input', (e) => {
      y0 = parseInt(e.target.value);
      y0Val.textContent = y0;
      if (t === 0) resetSim();
    });

    kSlider.addEventListener('input', (e) => {
      k = parseFloat(e.target.value);
      kVal.textContent = k.toFixed(3);
      if (slopeCtx) drawSlopeField(); // update slope field live!
    });

    btnPlayPause.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlayPause.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i> <span>Pause</span>' : '<i class="fa-solid fa-play"></i> <span>Start</span>';
    });

    btnReset.addEventListener('click', resetSim);

    let mainObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if(rect.width > 0) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    });
    mainObserver.observe(container);

    // Analytical functions for exact y(t) given t
    function getY(time) {
      if (modelType === 'linear') {
        return y0 + k * time;
      } else if (modelType === 'exponential') {
        return y0 * Math.exp(-k * time);
      } else if (modelType === 'logistic') {
        // y(t) = M / (1 + C*exp(-kMt)) where C = (M-y0)/y0
        const C = (M - y0) / y0;
        return M / (1 + C * Math.exp(-k * M * time));
      }
    }

    // Derivative function for the slope field y'(t, y)
    function getDerivative(y_val) {
      if (modelType === 'linear') return k;
      if (modelType === 'exponential') return -k * y_val;
      if (modelType === 'logistic') return k * y_val * (M - y_val);
      return 0;
    }

    function draw() {
      const w = canvas.width / window.devicePixelRatio || container.clientWidth;
      const h = canvas.height / window.devicePixelRatio || container.clientHeight;
      if (w===0 || h===0) return;
      
      ctx.clearRect(0, 0, w, h);

      const graphLeft = 50;
      const graphTop = 20;
      const graphWidth = w - 80;
      const graphHeight = h - 60;
      const graphBottom = graphTop + graphHeight;
      const maxY = 200; // scale constraint

      // Draw axes
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(graphLeft, graphTop); ctx.lineTo(graphLeft, graphBottom);
      ctx.moveTo(graphLeft, graphBottom); ctx.lineTo(graphLeft + graphWidth, graphBottom);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px monospace';
      ctx.fillText('y(t)', graphLeft - 30, graphTop + 10);
      ctx.fillText('t', graphLeft + graphWidth + 10, graphBottom + 4);

      if (modelType === 'logistic') {
        // Draw carrying capacity line M
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        const my = graphBottom - (M / maxY) * graphHeight;
        ctx.moveTo(graphLeft, my);
        ctx.lineTo(graphLeft + graphWidth, my);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'var(--accent-pink)';
        ctx.fillText('Max (M)', graphLeft - 45, my + 4);
      }

      const currentY = getY(t);

      if (isPlaying) {
        history.push({ t: t, val: currentY });
        if (history.length > maxHistory) {
          // Instead of shifting, we reset time if it goes off screen for continuous demo
          t = 0; history.length = 0;
        } else {
          t += 0.8;
        }
      }

      // Plot history line
      if (history.length > 0) {
        ctx.strokeStyle = 'var(--accent-emerald)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        history.forEach((pt, i) => {
          const px = graphLeft + (pt.t / (maxHistory*0.8)) * graphWidth;
          const py = graphBottom - (pt.val / maxY) * graphHeight;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Draw dot
        const lastPt = history[history.length - 1];
        const dotX = graphLeft + (lastPt.t / (maxHistory*0.8)) * graphWidth;
        const dotY = graphBottom - (lastPt.val / maxY) * graphHeight;
        
        ctx.fillStyle = 'var(--accent-pink)';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.fillText(`y = ${lastPt.val.toFixed(1)}`, dotX + 10, dotY - 5);
      }
    }


    // 2. SLOPE FIELD VISUALIZER (In Formula Drawer)
    let slopeCanvas = null;
    let slopeCtx = null;
    let slopeObserver = null;

    // We must poll to see when the formulaContainer injects the placeholder #slope-field-container
    // because it might be rendered asynchronously by KaTeX or the DOM string replacement.
    function initSlopeField() {
      const sfContainer = document.getElementById('slope-field-container');
      if (!sfContainer) {
        setTimeout(initSlopeField, 100);
        return;
      }
      
      slopeCanvas = document.createElement('canvas');
      slopeCanvas.style.width = '100%';
      slopeCanvas.style.height = '100%';
      sfContainer.appendChild(slopeCanvas);
      slopeCtx = slopeCanvas.getContext('2d');

      slopeObserver = new ResizeObserver(() => {
        const rect = sfContainer.getBoundingClientRect();
        if(rect.width > 0) {
          slopeCanvas.width = rect.width * window.devicePixelRatio;
          slopeCanvas.height = rect.height * window.devicePixelRatio;
          slopeCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
          drawSlopeField();
        }
      });
      slopeObserver.observe(sfContainer);
    }
    
    // Start trying to inject the slope field canvas
    initSlopeField();

    function drawSlopeField() {
      if (!slopeCtx) return;
      const w = slopeCanvas.width / window.devicePixelRatio;
      const h = slopeCanvas.height / window.devicePixelRatio;
      if (w===0 || h===0) return;

      slopeCtx.clearRect(0, 0, w, h);
      
      const gridX = 20;
      const gridY = 15;
      const stepX = w / gridX;
      const stepY = h / gridY;
      const lineLen = Math.min(stepX, stepY) * 0.4;
      
      // We scale our mathematical y up to M=180 max
      const maxY = 200;

      slopeCtx.lineWidth = 1.5;

      for (let i = 0; i <= gridX; i++) {
        for (let j = 0; j <= gridY; j++) {
          const cx = i * stepX;
          const cy = h - j * stepY; // flip y for canvas
          
          // Math Y value for this row
          const mathY = (j / gridY) * maxY;
          
          // Get slope y'
          const slope = getDerivative(mathY);
          
          // Normalize slope to visual angle (we scale slope down visually so lines don't all look vertical)
          const visualSlopeScale = 5; 
          const angle = Math.atan(slope * visualSlopeScale);
          
          slopeCtx.strokeStyle = 'rgba(165, 180, 252, 0.6)'; // text-accent
          
          // Highlight regions depending on model
          if (modelType === 'logistic' && Math.abs(mathY - M) < 5) {
             slopeCtx.strokeStyle = 'var(--accent-pink)';
          }

          slopeCtx.beginPath();
          slopeCtx.moveTo(cx - Math.cos(angle)*lineLen, cy + Math.sin(angle)*lineLen); // Canvas +Y is down
          slopeCtx.lineTo(cx + Math.cos(angle)*lineLen, cy - Math.sin(angle)*lineLen);
          slopeCtx.stroke();
        }
      }
    }


    function animate() {
      draw();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      mainObserver.disconnect();
      if(slopeObserver) slopeObserver.disconnect();
    };
  }
};
