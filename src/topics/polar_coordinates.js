export default {
  title: "Polære Koordinater",
  subtitle: "En anden måde at finde vej på",
  elif: `
    <p>Normalt når vi tegner grafer, bruger vi et "X og Y" system (Kartesisk). Det svarer til at sige: "Gå 3 skridt mod øst, og 4 skridt mod nord." Det danner altid et skakternet-mønster af firkanter.</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Radar-analogien</div>
      <p class="analogy-text">
        Men tænk på en skibsrader. En radar kigger ikke i "skridt frem og skridt til siden". Den roterer i en cirkel og udsender et signal. Når den finder et skib, siger den: "Skibet er 5 km væk i en retning, der er drejet præcis 50 grader fra nord."
      </p>
    </div>

    <p>Dette er polære koordinater! I stedet for at køre ad veje på kryds og tværs (X og Y), står du fast i midten. Du vælger en <strong>retning</strong> (en vinkel), og så skyder du en pil ud i den retning med en bestemt <strong>længde</strong>. Nogle figurer, som blomster eller spiraler, er et mareridt at tegne med firkanter, men supernemme at tegne med vinkler!</p>
  `,
  formula: `
    <div class="formula-card-sub">Omregning og komplekse tal (Euler).</div>
    
    <p>I polære koordinater defineres et punkt ud fra radius <span data-math="r" data-display="inline"></span> og vinkel <span data-math="\\theta" data-display="inline"></span>. Omregningen mellem X/Y og polære koordinater er ren trigonometri (højvinklede trekanter):</p>
    
    <div style="display:flex; justify-content:space-around; flex-wrap:wrap; margin:20px 0;">
      <div>
        <strong>Polær til Kartesisk:</strong>
        <div data-math="x = r \\cdot \\cos(\\theta)"></div>
        <div data-math="y = r \\cdot \\sin(\\theta)"></div>
      </div>
      <div>
        <strong>Kartesisk til Polær:</strong>
        <div data-math="r = \\sqrt{x^2 + y^2}"></div>
        <div data-math="\\theta = \\arctan\\left(\\frac{y}{x}\\right)"></div>
      </div>
    </div>

    <p><strong>Bonus for 3.g (Komplekse tal):</strong> Polære koordinater bruges intensivt til at beskrive komplekse tal. I stedet for <span data-math="z = x + i\\cdot y" data-display="inline"></span> kan et komplekst tal skrives med polære koordinater via <strong>Eulers formel</strong>:</p>
    <div data-math="z = r \\cdot e^{i\\cdot\\theta} = r(\\cos\\theta + i\\cdot\\sin\\theta)"></div>

    <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
      <h4 style="margin-bottom: 10px; color: var(--accent-blue);">Live Koordinat-Omregner</h4>
      <p style="font-size: 14px; margin-bottom: 15px; color: var(--text-secondary);">Prøv at trække i det grønne punkt for at se, hvordan (X,Y) og (r,θ) hænger sammen i realtid!</p>
      
      <div style="display:flex; gap:20px; align-items:flex-start;">
        <div id="converter-container" style="flex:1; height:200px; background:var(--bg-primary); border-radius:var(--radius-md); border:1px solid var(--border-color); overflow:hidden;"></div>
        <div style="flex:1; background:var(--bg-tertiary); padding:15px; border-radius:var(--radius-md);">
          <div style="margin-bottom:10px;"><strong style="color:var(--accent-pink);">Kartesisk (X, Y)</strong></div>
          <div style="font-family:monospace; margin-bottom:20px;">
            x = <span id="conv-x">0.0</span><br/>
            y = <span id="conv-y">0.0</span>
          </div>
          <div style="margin-bottom:10px;"><strong style="color:var(--accent-emerald);">Polær (r, θ)</strong></div>
          <div style="font-family:monospace;">
            r = <span id="conv-r">0.0</span><br/>
            θ = <span id="conv-t">0.0</span> rad (<span id="conv-d">0</span>°)
          </div>
        </div>
      </div>
    </div>
  `,
  initVisualizer: (container, controls, formulaContainer) => {
    // 1. MAIN VISUALIZER (Rose Curve)
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    let animationId = null;
    let isPlaying = true;
    let t = 0;
    
    let shapeType = 'rose'; // 'rose', 'spiral', 'cardioid'
    let param1 = 4;
    let param2 = 1;
    const history = [];

    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Form:</label>
        <select id="shape-select" style="padding:8px; border-radius:4px; background:var(--bg-tertiary); color:white; border:1px solid var(--border-color); width: 100%;">
          <option value="rose">Rosenkurve (Blomst)</option>
          <option value="cardioid">Kardioide (Hjerte)</option>
          <option value="spiral">Arkimedisk Spiral</option>
        </select>
      </div>
      <div class="control-group" id="p1-container">
        <label class="control-label"><span id="p1-label">Blad-parameter (n):</span> <span class="control-value" id="p1-val">4</span></label>
        <input type="range" class="slider-input" id="p1-slider" min="1" max="10" value="4">
      </div>
      <div class="control-group" id="p2-container">
        <label class="control-label"><span id="p2-label">Kompleksitet (d):</span> <span class="control-value" id="p2-val">1</span></label>
        <input type="range" class="slider-input" id="p2-slider" min="1" max="10" value="1">
      </div>
      <div class="control-group">
        <label class="control-label">Funktion:</label>
        <div style="font-family: monospace; color: var(--accent-emerald); font-size: 1.1em; padding: 5px 0;" id="formula-display">
          r(θ) = cos(4/1 · θ)
        </div>
      </div>
    `;

    const p1Slider = document.getElementById('p1-slider');
    const p1Val = document.getElementById('p1-val');
    const p1Label = document.getElementById('p1-label');
    const p2Slider = document.getElementById('p2-slider');
    const p2Val = document.getElementById('p2-val');
    const p2Label = document.getElementById('p2-label');
    const p2Container = document.getElementById('p2-container');
    const formDisplay = document.getElementById('formula-display');

    function updateUI() {
      if (shapeType === 'rose') {
        p1Label.textContent = 'Blad-parameter (n):';
        p2Label.textContent = 'Kompleksitet (d):';
        p2Container.style.display = 'block';
        p1Slider.max = 10; p2Slider.max = 10;
        formDisplay.innerHTML = `r(θ) = cos(${param1}/${param2} · θ)`;
      } else if (shapeType === 'cardioid') {
        p1Label.textContent = 'Bule-størrelse (a):';
        p2Container.style.display = 'none';
        p1Slider.max = 5;
        formDisplay.innerHTML = `r(θ) = 1 + ${param1} · cos(θ)`;
      } else if (shapeType === 'spiral') {
        p1Label.textContent = 'Vinding-afstand (a):';
        p2Container.style.display = 'none';
        p1Slider.max = 5;
        formDisplay.innerHTML = `r(θ) = ${param1} · θ`;
      }
    }

    document.getElementById('shape-select').addEventListener('change', (e) => {
      shapeType = e.target.value;
      if (shapeType === 'rose') { param1 = 4; param2 = 1; }
      else if (shapeType === 'cardioid') { param1 = 1; }
      else if (shapeType === 'spiral') { param1 = 1; }
      p1Slider.value = param1; p2Slider.value = param2;
      p1Val.textContent = param1; p2Val.textContent = param2;
      updateUI();
      history.length = 0; t = 0;
    });

    p1Slider.addEventListener('input', (e) => {
      param1 = parseInt(e.target.value);
      p1Val.textContent = param1;
      updateUI();
      history.length = 0; t = 0;
    });

    p2Slider.addEventListener('input', (e) => {
      param2 = parseInt(e.target.value);
      p2Val.textContent = param2;
      updateUI();
      history.length = 0; t = 0;
    });

    let mainObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if(rect.width > 0) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    });
    mainObserver.observe(container);

    function getR(theta, maxRadius) {
      if (shapeType === 'rose') {
        const k = param1 / param2;
        return Math.cos(k * theta) * maxRadius;
      } else if (shapeType === 'cardioid') {
        // scaled so max r is maxRadius
        const maxExpected = 1 + param1; 
        return ((1 + param1 * Math.cos(theta)) / maxExpected) * maxRadius;
      } else if (shapeType === 'spiral') {
        // limit spiral max size visually
        return (param1 * theta) * (maxRadius / 20);
      }
    }

    function drawMain() {
      const w = canvas.width / window.devicePixelRatio || container.clientWidth;
      const h = canvas.height / window.devicePixelRatio || container.clientHeight;
      if(w===0) return;
      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const maxRadius = Math.min(w, h) * 0.45;

      // Draw polar grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath(); ctx.arc(centerX, centerY, (maxRadius / 4) * r, 0, Math.PI * 2); ctx.stroke();
      }
      for (let a = 0; a < 8; a++) {
        const angle = (a * Math.PI) / 4;
        ctx.beginPath(); ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + maxRadius * Math.cos(angle), centerY + maxRadius * Math.sin(angle));
        ctx.stroke();
      }

      // Pre-draw the full target shape faintly
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const maxTheta = shapeType === 'rose' ? Math.PI * 2 * param2 : (shapeType === 'spiral' ? Math.PI * 10 : Math.PI * 2);
      for (let th = 0; th <= maxTheta; th += 0.05) {
        const radius = getR(th, maxRadius);
        const px = centerX + radius * Math.cos(th);
        const py = centerY + radius * Math.sin(th);
        if (th === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Current moving point
      const r = getR(t, maxRadius);
      const px = centerX + r * Math.cos(t);
      const py = centerY + r * Math.sin(t);

      if (isPlaying && t <= maxTheta) {
        history.push({ x: px, y: py });
        t += 0.05;
      } else if (t > maxTheta) {
        // Auto reset when done
        history.length = 0; t = 0;
      }

      // Draw thick history curve
      if (history.length > 0) {
        ctx.strokeStyle = 'var(--accent-emerald)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(history[0].x, history[0].y);
        for (let i = 1; i < history.length; i++) ctx.lineTo(history[i].x, history[i].y);
        ctx.stroke();
      }

      // Draw radar sweep line
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(centerX, centerY); 
      // Radar line extends to edge of grid
      ctx.lineTo(centerX + maxRadius * Math.cos(t), centerY + maxRadius * Math.sin(t)); 
      ctx.stroke();

      // Draw active point
      ctx.fillStyle = 'var(--text-primary)';
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2); ctx.fill();
    }


    // 2. CONVERTER VISUALIZER (Inside Formula Drawer)
    let cCanvas = null;
    let cCtx = null;
    let cObserver = null;
    let isDragging = false;
    let point = { x: 50, y: -50 }; // Logical coordinates (-100 to 100)

    function updateConverterText() {
      const x = point.x; const y = point.y;
      const r = Math.sqrt(x*x + y*y);
      let theta = Math.atan2(y, x); // -pi to pi
      if (theta < 0) theta += 2*Math.PI; // 0 to 2pi
      
      document.getElementById('conv-x').textContent = x.toFixed(1);
      document.getElementById('conv-y').textContent = y.toFixed(1);
      document.getElementById('conv-r').textContent = r.toFixed(1);
      document.getElementById('conv-t').textContent = theta.toFixed(2);
      document.getElementById('conv-d').textContent = (theta * 180 / Math.PI).toFixed(1);
    }

    function initConverter() {
      const cContainer = document.getElementById('converter-container');
      if (!cContainer) { setTimeout(initConverter, 100); return; }

      cCanvas = document.createElement('canvas');
      cCanvas.style.width = '100%'; cCanvas.style.height = '100%';
      cCanvas.style.cursor = 'crosshair';
      cContainer.appendChild(cCanvas);
      cCtx = cCanvas.getContext('2d');

      const getMousePos = (evt) => {
        const rect = cCanvas.getBoundingClientRect();
        const scaleX = cCanvas.width / window.devicePixelRatio / rect.width;
        const scaleY = cCanvas.height / window.devicePixelRatio / rect.height;
        return {
          x: (evt.clientX - rect.left) * scaleX,
          y: (evt.clientY - rect.top) * scaleY
        };
      };

      const logicToCanvas = (lx, ly, w, h) => {
        return {
          x: w/2 + (lx / 100) * (w/2 * 0.9),
          y: h/2 - (ly / 100) * (h/2 * 0.9) // invert y
        };
      };

      const canvasToLogic = (cx, cy, w, h) => {
        return {
          x: ((cx - w/2) / (w/2 * 0.9)) * 100,
          y: -((cy - h/2) / (h/2 * 0.9)) * 100
        };
      };

      cCanvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        const w = cCanvas.width / window.devicePixelRatio;
        const h = cCanvas.height / window.devicePixelRatio;
        const pos = getMousePos(e);
        point = canvasToLogic(pos.x, pos.y, w, h);
        updateConverterText(); drawConverter();
      });
      cCanvas.addEventListener('mousemove', (e) => {
        if(!isDragging) return;
        const w = cCanvas.width / window.devicePixelRatio;
        const h = cCanvas.height / window.devicePixelRatio;
        const pos = getMousePos(e);
        point = canvasToLogic(pos.x, pos.y, w, h);
        // Clamp to 100 radius logical for neatness
        const r = Math.sqrt(point.x*point.x + point.y*point.y);
        if(r > 100) { point.x = (point.x/r)*100; point.y = (point.y/r)*100; }
        updateConverterText(); drawConverter();
      });
      window.addEventListener('mouseup', () => { isDragging = false; });

      cObserver = new ResizeObserver(() => {
        const rect = cContainer.getBoundingClientRect();
        if(rect.width > 0) {
          cCanvas.width = rect.width * window.devicePixelRatio;
          cCanvas.height = rect.height * window.devicePixelRatio;
          cCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
          drawConverter();
        }
      });
      cObserver.observe(cContainer);
      updateConverterText();
    }
    initConverter();

    function drawConverter() {
      if(!cCtx) return;
      const w = cCanvas.width / window.devicePixelRatio;
      const h = cCanvas.height / window.devicePixelRatio;
      if(w===0) return;
      cCtx.clearRect(0,0,w,h);

      const cx = w/2; const cy = h/2;
      const R = Math.min(w,h)/2 * 0.9;

      // Axes
      cCtx.strokeStyle = 'rgba(255,255,255,0.2)'; cCtx.lineWidth = 1;
      cCtx.beginPath(); cCtx.moveTo(cx-R, cy); cCtx.lineTo(cx+R, cy); cCtx.stroke();
      cCtx.beginPath(); cCtx.moveTo(cx, cy-R); cCtx.lineTo(cx, cy+R); cCtx.stroke();

      // Max Circle
      cCtx.beginPath(); cCtx.arc(cx,cy, R, 0, Math.PI*2); cCtx.stroke();

      // Logical to Canvas
      const px = cx + (point.x / 100) * R;
      const py = cy - (point.y / 100) * R;

      // X and Y lines
      cCtx.strokeStyle = 'var(--accent-pink)'; cCtx.setLineDash([4,4]);
      cCtx.beginPath(); cCtx.moveTo(px, cy); cCtx.lineTo(px, py); cCtx.stroke(); // Y
      cCtx.beginPath(); cCtx.moveTo(cx, py); cCtx.lineTo(px, py); cCtx.stroke(); // X
      cCtx.setLineDash([]);

      // Radius line
      cCtx.strokeStyle = 'var(--accent-emerald)'; cCtx.lineWidth = 2;
      cCtx.beginPath(); cCtx.moveTo(cx, cy); cCtx.lineTo(px, py); cCtx.stroke();

      // Angle arc
      const theta = Math.atan2(-point.y, point.x); // screen Y is inverted
      cCtx.strokeStyle = 'var(--accent-blue)';
      cCtx.beginPath();
      cCtx.arc(cx, cy, R*0.2, 0, theta, theta < 0);
      cCtx.stroke();

      // Point
      cCtx.fillStyle = '#fff'; cCtx.beginPath(); cCtx.arc(px,py, 6, 0, Math.PI*2); cCtx.fill();
    }

    function animate() {
      drawMain();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      mainObserver.disconnect();
      if(cObserver) cObserver.disconnect();
    };
  }
};
