export default {
  title: "Integraler",
  subtitle: "Hvordan måler man arealet af en krøllet figur?",
  elif: `
    <p>Forestil dig, at du skal lægge rullegræs på en sti i haven. Stien har en <strong>flot buet kurve</strong> på den ene side. Hvordan finder du ud af, hvor meget græs du skal købe?</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Rullegræs-analogien</div>
      <p class="analogy-text">
        Du kan ikke bare bruge formlen for en firkant, for stien buer. Men du kan købe nogle brede baner græs og lægge dem ved siden af hinanden. Det bliver lidt takket i kanten, så det passer ikke helt præcist.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        Hvad nu hvis banerne er <strong>meget tynde</strong>? Hvis banerne er super tynde (som sugerør), kan du skubbe dem helt tæt på den buede kant. Jo tyndere banerne er, jo tættere kommer du på det helt præcise areal.
      </p>
    </div>

    <p>Integration er præcis denne proces. Vi tager et område under en buet linje (en graf) og deler det op i <strong>uendeligt mange, uendeligt tynde rektangler</strong>, og lægger alle deres arealer sammen for at få det præcise svar.</p>
  `,
  formula: `
    <div class="formula-card-sub">Bestemte integraler og Riemann-summer.</div>
    
    <p>Arealet under en funktion <span data-math="f(x)" data-display="inline"></span> fra punktet <span data-math="a" data-display="inline"></span> til <span data-math="b" data-display="inline"></span> kaldes det <strong>bestemte integral</strong> og skrives som:</p>
    <div data-math="\\int_{a}^{b} f(x) \\, dx"></div>

    <p>Hvor:</p>
    <ul class="formula-desc-list">
      <li><strong><span data-math="\\int" data-display="inline"></span> (Integraltegn):</strong> Et stiliseret 'S', som står for 'Sum'.</li>
      <li><strong><span data-math="f(x)" data-display="inline"></span>:</strong> Højden af kurven på et givet sted.</li>
      <li><strong><span data-math="dx" data-display="inline"></span>:</strong> Den uendeligt lille bredde af hvert enkelt rektangel.</li>
    </ul>

    <p style="margin-top: 20px;">Matematisk defineres det som grænseværdien af en sum (Riemann-sum), når bredden <span data-math="\\Delta x" data-display="inline"></span> går mod nul:</p>
    <div data-math="\\int_{a}^{b} f(x) \\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i) \\cdot \\Delta x"></div>

    <p style="margin-top: 20px;">I praksis beregner vi integralet ved hjælp af en <strong>stamfunktion</strong> <span data-math="F(x)" data-display="inline"></span> (hvor <span data-math="F'(x) = f(x)" data-display="inline"></span>) og Infinitesimalregningens Fundamentalsætning:</p>
    <div data-math="\\int_{a}^{b} f(x) \\, dx = [F(x)]_{a}^{b} = F(b) - F(a)"></div>
  `,
  initVisualizer: (container, controls) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationId = null;

    // Simulation parameters
    let numRects = 8;
    let aValue = 100; // start X
    let bValue = 400; // end X
    let showGrid = true;

    // Define function curve: f(x) = y coordinate on canvas
    // We want a nice wavy function: y = a_func(x)
    function f(x) {
      // Return Y coordinate (inverted for canvas drawing later)
      // Standard mathematical function: f(x_math)
      // Let's map canvas X to math X
      const mathX = (x - 50) * 0.015;
      const mathY = Math.sin(mathX) * 1.2 + Math.sin(mathX * 2.3) * 0.4 + 2;
      // Map back to canvas height: 1 unit = 70px, offset from bottom
      return mathY * 70;
    }

    // Controls setup
    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Antal rektangler (n): <span class="control-value" id="rect-val">8</span></label>
        <input type="range" class="slider-input" id="rect-slider" min="2" max="60" value="8">
      </div>
      <div class="control-group">
        <label class="control-label">Arealgrænser (a til b):</label>
        <div style="display: flex; gap: 10px;">
          <input type="range" class="slider-input" id="a-slider" min="50" max="200" value="100" style="flex: 1;">
          <input type="range" class="slider-input" id="b-slider" min="250" max="450" value="400" style="flex: 1;">
        </div>
        <div class="control-label" style="margin-top: 4px;">
          <span>Start a: <span class="control-value" id="a-val">100</span></span>
          <span>Slut b: <span class="control-value" id="b-val">400</span></span>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Handling & info:</label>
        <div style="font-size: 13px; margin-top: 4px;">
          <span style="color: var(--accent-emerald);">Areal (Riemann-sum): </span>
          <strong id="area-riemann" class="control-value">0.00</strong><br/>
          <span style="color: var(--accent-blue);">Eksakt Areal: </span>
          <strong id="area-exact" class="control-value">0.00</strong>
        </div>
      </div>
    `;

    const rectSlider = document.getElementById('rect-slider');
    const rectVal = document.getElementById('rect-val');
    const aSlider = document.getElementById('a-slider');
    const aVal = document.getElementById('a-val');
    const bSlider = document.getElementById('b-slider');
    const bVal = document.getElementById('b-val');
    const areaRiemann = document.getElementById('area-riemann');
    const areaExact = document.getElementById('area-exact');

    rectSlider.addEventListener('input', (e) => {
      numRects = parseInt(e.target.value);
      rectVal.textContent = numRects;
      draw();
    });

    aSlider.addEventListener('input', (e) => {
      aValue = parseInt(e.target.value);
      aVal.textContent = aValue;
      if (aValue >= bValue - 20) {
        bValue = aValue + 20;
        bSlider.value = bValue;
        bVal.textContent = bValue;
      }
      draw();
    });

    bSlider.addEventListener('input', (e) => {
      bValue = parseInt(e.target.value);
      bVal.textContent = bValue;
      if (bValue <= aValue + 20) {
        aValue = bValue - 20;
        aSlider.value = aValue;
        aVal.textContent = aValue;
      }
      draw();
    });

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      draw();
    }
    
    window.addEventListener('resize', resize);

    // Trapezoidal numerical integration helper
    function getExactArea() {
      let sum = 0;
      const steps = 1000;
      const dx = (bValue - aValue) / steps;
      for (let i = 0; i < steps; i++) {
        const x1 = aValue + i * dx;
        const x2 = x1 + dx;
        sum += ((f(x1) + f(x2)) / 2) * dx;
      }
      // Scale down mathematically (just for visualization display numbers)
      return sum / 1000;
    }

    function draw() {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, w, h);

      const bottomY = h * 0.85;

      // Draw exact area filled
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.moveTo(aValue, bottomY);
      for (let x = aValue; x <= bValue; x++) {
        ctx.lineTo(x, bottomY - f(x));
      }
      ctx.lineTo(bValue, bottomY);
      ctx.fill();

      // Draw coordinate system axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, 15);
      ctx.lineTo(30, bottomY);
      ctx.lineTo(w - 20, bottomY);
      ctx.stroke();

      // Plot function curve
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 30; x < w - 20; x++) {
        const y = bottomY - f(x);
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Riemann Rectangles
      const rectWidth = (bValue - aValue) / numRects;
      let riemannSum = 0;

      ctx.strokeStyle = 'var(--accent-emerald)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < numRects; i++) {
        const rx = aValue + i * rectWidth;
        // Midpoint Riemann sum (evaluate height at middle of rectangle)
        const mx = rx + rectWidth / 2;
        const ry = f(mx);
        const rectHeight = ry;
        riemannSum += rectHeight * rectWidth;

        // Rectangle Fill
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fillRect(rx + 1, bottomY - rectHeight, rectWidth - 2, rectHeight);
        
        // Rectangle Border
        ctx.strokeRect(rx + 1, bottomY - rectHeight, rectWidth - 2, rectHeight);
      }

      // Draw range markers
      ctx.strokeStyle = 'var(--accent-pink)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      
      ctx.beginPath();
      ctx.moveTo(aValue, bottomY);
      ctx.lineTo(aValue, bottomY - f(aValue));
      ctx.moveTo(bValue, bottomY);
      ctx.lineTo(bValue, bottomY - f(bValue));
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw labels a and b
      ctx.fillStyle = 'var(--accent-pink)';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('a', aValue - 4, bottomY + 20);
      ctx.fillText('b', bValue - 4, bottomY + 20);

      // Update control panel stats
      const exactVal = getExactArea();
      const riemannVal = riemannSum / 1000;
      areaExact.textContent = exactVal.toFixed(3);
      areaRiemann.textContent = riemannVal.toFixed(3);

      // Show difference/error
      const errorPct = Math.abs((riemannVal - exactVal) / exactVal) * 100;
      // Add text label overlay on canvas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '11px monospace';
      ctx.fillText(`Afvigelse (fejl): ${errorPct.toFixed(1)}%`, 50, 40);
    }

    // Initial draw
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }
};
