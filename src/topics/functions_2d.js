export default {
  title: "Funktioner med 2 variable",
  subtitle: "Hvordan finder man vej i bjergene?",
  elif: `
    <p>Normalt har vi en funktion, der svarer til en sti: Du kan gå frem eller tilbage (X), og stien går op eller ned (Y). Det er en funktion med 1 variabel.</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Bjergvandrings-analogien</div>
      <p class="analogy-text">
        Men forestil dig, at du står midt i et stort bjerglandskab. Her kan du både gå mod Nord/Syd (Y-retningen) og Øst/Vest (X-retningen). Uanset hvilken GPS-koordinat du står på, vil der være en bestemt højde (Z).
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        For at tegne dette landskab på et fladt stykke papir, bruger man ofte farver. Blå farver betyder dybe dale eller vand, og røde farver betyder høje bjergtoppe. Dette kaldes et topografisk varmekort.
      </p>
    </div>

    <p>Når du går i bjerge, vil der altid være én retning, der er den absolut stejleste vej direkte mod toppen. I matematik kalder man den retning for en <strong>Gradientvektor</strong>. Det er ligesom et magisk kompas, der ikke peger mod Nord, men altid peger <em>direkte op ad bakke</em>!</p>
  `,
  formula: `
    <div class="formula-card-sub">Partielle afledte og gradientvektorer for <span data-math="f(x,y)" data-display="inline"></span>.</div>
    
    <p>Når vi har en funktion med to variable <span data-math="z = f(x,y)" data-display="inline"></span>, kan vi differentiere den i to retninger. Dette kaldes <strong>partielle afledte</strong>:</p>
    
    <ul class="formula-desc-list">
      <li><strong><span data-math="\\frac{\\partial f}{\\partial x}" data-display="inline"></span> (Mht. x):</strong> Hældningen hvis vi fryser vores Y-koordinat og kun bevæger os i X-retningen (Øst/Vest).</li>
      <li><strong><span data-math="\\frac{\\partial f}{\\partial y}" data-display="inline"></span> (Mht. y):</strong> Hældningen hvis vi fryser X-koordinaten og kun bevæger os i Y-retningen (Nord/Syd).</li>
    </ul>

    <p style="margin-top: 20px;"><strong>Gradientvektoren <span data-math="\\nabla f" data-display="inline"></span>:</strong></p>
    <p>Sætter vi disse to hældninger sammen til en vektor, får vi <strong>Gradientvektoren</strong>. Denne vektor peger altid i den retning, hvor funktionen vokser hurtigst (stejleste stigning):</p>
    <div data-math="\\nabla f(x,y) = \\begin{pmatrix} \\frac{\\partial f}{\\partial x} \\\\ \\frac{\\partial f}{\\partial y} \\end{pmatrix}"></div>

    <p style="margin-top: 20px;"><strong>Stationære punkter:</strong></p>
    <p>På en bjergtop, i bunden af en dal, eller midt i et bjergpas (sadelpunkt), er terrænet helt fladt i det specifikke punkt. Her gælder det at hældningen er 0 i alle retninger:</p>
    <div data-math="\\nabla f(x,y) = \\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix}"></div>

    <p>I et stationært punkt er gradienten nul, men det afslører ikke <em>hvilken</em> slags punkt det er. Man skelner via de andenordens partielle afledte, fx diskriminanten <span data-math="d = f''_{xx}\\cdot f''_{yy} - (f''_{xy})^2" data-display='inline'></span>: er <span data-math="d>0" data-display='inline'></span> er det en top eller dal, er <span data-math="d<0" data-display='inline'></span> er det et sadelpunkt.</p>

    <p>Gradienten står altid vinkelret på niveaukurverne (højdekurverne) og peger den stejleste vej opad.</p>
  `,
  initVisualizer: (container, controls, formulaContainer) => {
    // Canvas understands real color strings, not CSS var(--...). Resolve them once.
    const rootStyle = getComputedStyle(document.documentElement);
    const cssVar = (name, fallback) => rootStyle.getPropertyValue(name).trim() || fallback;
    const COLOR_TEXT = cssVar('--text-primary', '#f3f4f6');

    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    canvas.style.cursor = 'crosshair';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    
    let shapeType = 'paraboloid';
    let mousePos = { x: -1, y: -1 };
    let isMouseOver = false;

    // We cache the heatmap so we don't recalculate thousands of pixels every frame
    let cachedHeatmap = null;
    let cachedW = 0;
    let cachedH = 0;

    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Landskab (Funktion):</label>
        <select id="func-select" style="padding:8px; border-radius:4px; background:var(--bg-tertiary); color:white; border:1px solid var(--border-color); width: 100%;">
          <option value="paraboloid">Paraboloide (En dal)</option>
          <option value="saddle">Sadelpunkt (Bjergpas)</option>
          <option value="waves">Komplekse Bølger</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">Funktion:</label>
        <div style="font-family: monospace; color: var(--accent-emerald); font-size: 1.1em; padding: 5px 0;" id="f-formula-display">
          f(x,y) = x² + y²
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Interaktion:</label>
        <div style="font-size: 13px; color: var(--text-secondary);">
          <i class="fa-solid fa-arrow-pointer"></i> Kør musen over kortet for at se <strong>Gradientvektoren</strong> (den peger mod stejleste stigning).
        </div>
      </div>
    `;

    const funcSelect = document.getElementById('func-select');
    const fDisplay = document.getElementById('f-formula-display');

    funcSelect.addEventListener('change', (e) => {
      shapeType = e.target.value;
      if (shapeType === 'paraboloid') fDisplay.innerHTML = 'f(x,y) = x² + y²';
      else if (shapeType === 'saddle') fDisplay.innerHTML = 'f(x,y) = x² - y²';
      else if (shapeType === 'waves') fDisplay.innerHTML = 'f(x,y) = sin(x) + cos(y)';
      cachedHeatmap = null; // force redraw
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      // Mouse pos relative to canvas resolution
      const scaleX = canvas.width / window.devicePixelRatio / rect.width;
      const scaleY = canvas.height / window.devicePixelRatio / rect.height;
      mousePos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
      isMouseOver = true;
    });
    canvas.addEventListener('mouseleave', () => { isMouseOver = false; });

    // Touch support: mirror the mouse logic so the gradient arrow works on tablets/phones
    function updatePosFromTouch(touch) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / window.devicePixelRatio / rect.width;
      const scaleY = canvas.height / window.devicePixelRatio / rect.height;
      mousePos = {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
      isMouseOver = true;
    }
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches[0]) updatePosFromTouch(e.touches[0]);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault(); // prevent page scroll while dragging on the map
      if (e.touches[0]) updatePosFromTouch(e.touches[0]);
    });
    canvas.addEventListener('touchend', () => { isMouseOver = false; });

    let mainObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if(rect.width > 0) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        cachedHeatmap = null;
      }
    });
    mainObserver.observe(container);

    // Mathematical functions mapping [-3, 3] x [-3, 3] to Z
    function f(x, y) {
      if (shapeType === 'paraboloid') return x*x + y*y; // min 0, max 18
      if (shapeType === 'saddle') return x*x - y*y; // min -9, max 9
      if (shapeType === 'waves') return Math.sin(x*1.5) + Math.cos(y*1.5); // min -2, max 2
      return 0;
    }

    // Convert Z value to RGB Heatmap color
    function zToColor(z) {
      let normZ = 0;
      if (shapeType === 'paraboloid') normZ = z / 18; // 0 to 1
      else if (shapeType === 'saddle') normZ = (z + 9) / 18; // 0 to 1
      else if (shapeType === 'waves') normZ = (z + 2) / 4; // 0 to 1

      // Clamp
      normZ = Math.max(0, Math.min(1, normZ));
      
      // Color map: Blue (0) -> Green -> Yellow -> Red (1)
      // Using HSL interpolation: Blue is 240, Red is 0
      const hue = (1 - normZ) * 240; 
      return `hsl(${hue}, 80%, 50%)`;
    }

    // Numeric partial derivatives
    function getGradient(x, y) {
      const h = 0.001;
      const dfdx = (f(x+h, y) - f(x-h, y)) / (2*h);
      const dfdy = (f(x, y+h) - f(x, y-h)) / (2*h);
      return { dx: dfdx, dy: dfdy };
    }

    function generateHeatmap(w, h) {
      // Create offscreen canvas for heatmap cache
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w; offCanvas.height = h;
      const offCtx = offCanvas.getContext('2d');

      // To make it fast and have a cool blocky/retro topographical look, 
      // we evaluate f(x,y) on a grid of small blocks instead of individual pixels.
      const blockSize = 6; 
      
      for (let cy = 0; cy < h; cy += blockSize) {
        for (let cx = 0; cx < w; cx += blockSize) {
          // Map canvas [0, w] to math [-3, 3]
          const mathX = (cx / w) * 6 - 3;
          // Canvas Y goes down, Math Y goes up, so invert Y
          const mathY = -((cy / h) * 6 - 3);

          const z = f(mathX, mathY);
          offCtx.fillStyle = zToColor(z);
          offCtx.fillRect(cx, cy, blockSize, blockSize);
        }
      }

      // Draw contour lines
      offCtx.strokeStyle = 'rgba(255,255,255,0.15)';
      offCtx.lineWidth = 1;
      offCtx.beginPath();
      // Simple contour approximation
      for (let cy = 0; cy < h; cy += 4) {
        for (let cx = 0; cx < w; cx += 4) {
          const mathX = (cx / w) * 6 - 3;
          const mathY = -((cy / h) * 6 - 3);
          const z = f(mathX, mathY);
          
          let zScale = 1;
          if (shapeType === 'paraboloid' || shapeType === 'saddle') zScale = 2; // lines every 2 units
          else zScale = 0.5;

          // If z is close to a whole number multiple of zScale, draw a contour dot
          if (Math.abs((z % zScale) - zScale/2) > (zScale/2 - 0.05)) {
             offCtx.fillStyle = 'rgba(255,255,255,0.2)';
             offCtx.fillRect(cx, cy, 2, 2);
          }
        }
      }

      cachedW = w;
      cachedH = h;
      return offCanvas;
    }

    let animationId = null;

    function draw() {
      const w = canvas.width / window.devicePixelRatio || container.clientWidth;
      const h = canvas.height / window.devicePixelRatio || container.clientHeight;
      if(w===0) return;

      if (!cachedHeatmap || w !== cachedW || h !== cachedH) {
        cachedHeatmap = generateHeatmap(w, h);
      }

      // 1. Draw cached background
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(cachedHeatmap, 0, 0, w, h);

      // Draw axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h); // Y-axis
      ctx.moveTo(0, h/2); ctx.lineTo(w, h/2); // X-axis
      ctx.stroke();

      // Mark the stationary point at origo for the function types where (0,0) is stationary.
      // Paraboloide (x²+y²) has a minimum and saddle (x²-y²) has a saddle point at origo;
      // both have ∇f(0,0)=0. The wave function does not, so we skip it.
      if (shapeType === 'paraboloid' || shapeType === 'saddle') {
        ctx.strokeStyle = COLOR_TEXT;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(w/2, h/2, 7, 0, Math.PI*2); // origo is at canvas center
        ctx.stroke();
      }

      // 2. Draw Interactive Gradient Vector
      if (isMouseOver) {
        const mathX = (mousePos.x / w) * 6 - 3;
        const mathY = -((mousePos.y / h) * 6 - 3);
        
        const grad = getGradient(mathX, mathY);
        
        // Scale vector for visibility. If gradient is very large, clamp it.
        const gradLen = Math.sqrt(grad.dx*grad.dx + grad.dy*grad.dy);
        let visualLen = gradLen * 15; 
        if (visualLen > 60) visualLen = 60; // Max visual arrow length
        
        // Normalize
        const nx = gradLen === 0 ? 0 : grad.dx / gradLen;
        const ny = gradLen === 0 ? 0 : grad.dy / gradLen;

        // Convert visual vector back to canvas coords. 
        // Math Y is up, Canvas Y is down, so visual dy must be inverted!
        const arrowDX = nx * visualLen;
        const arrowDY = -ny * visualLen; 

        const toX = mousePos.x + arrowDX;
        const toY = mousePos.y + arrowDY;

        // Draw arrow shaft
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(mousePos.x, mousePos.y);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(toY - mousePos.y, toX - mousePos.x);
        const headlen = 10;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.fill();

        // Draw dot at base
        ctx.fillStyle = COLOR_TEXT;
        ctx.beginPath(); ctx.arc(mousePos.x, mousePos.y, 4, 0, Math.PI*2); ctx.fill();

        // Text output near cursor
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(mousePos.x + 15, mousePos.y + 15, 140, 75);
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.fillText(`Z (højde): ${f(mathX, mathY).toFixed(2)}`, mousePos.x + 20, mousePos.y + 30);
        ctx.fillText(`∂f/∂x = ${grad.dx.toFixed(2)}`, mousePos.x + 20, mousePos.y + 45);
        ctx.fillText(`∂f/∂y = ${grad.dy.toFixed(2)}`, mousePos.x + 20, mousePos.y + 60);
        ctx.fillText(`∇f længde: ${gradLen.toFixed(2)}`, mousePos.x + 20, mousePos.y + 75);
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
    };
  }
};
