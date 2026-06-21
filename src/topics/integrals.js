export default {
  title: "Integraler",
  subtitle: "Hvordan hænger fart og afstand sammen?",
  elif: `
    <p>Forestil dig, at du kigger på bilens speedometer. Hvis du kører 80 km/t i præcis én time, har du kørt 80 km. Du gangede bare fart med tid (et simpelt rektangel).</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Køreturs-analogien (Stamfunktion)</div>
      <p class="analogy-text">
        Men hvad nu hvis farten ændrer sig hele tiden (du gasser op, bremser ned)? Så kan du finde den samlede kørte afstand ved at dele hele turen op i bittesmå stykker på ét sekund. I hvert sekund kører du med næsten konstant fart. Lægger du alle disse små "sekund-afstande" sammen, får du den totale afstand.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        Her er hemmeligheden: Arealet under fart-grafen ER den tilbagelagte afstand — og afstanden kan du aflæse direkte på kilometertælleren! Kilometertælleren er nemlig stamfunktionen: mens speedometeret (farten) springer op og ned, lægger kilometertælleren stille og roligt det hele sammen. At finde stamfunktionen er præcis det omvendte af at finde ændringshastigheden (differentialkvotienten).
      </p>
    </div>

    <p>Integration er matematikkens måde at lægge uendeligt mange, uendeligt små ting sammen på, for at finde det samlede hele (f.eks. areal, volumen, eller total afstand).</p>
  `,
  formula: `
    <div class="formula-card-sub">Det bestemte integral, stamfunktioner og Riemann-summer.</div>
    
    <p>Arealet under en funktion <span data-math="f(x)" data-display="inline"></span> fra <span data-math="a" data-display="inline"></span> til <span data-math="b" data-display="inline"></span> skrives som:</p>
    <div data-math="\\int_{a}^{b} f(x) \\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i) \\cdot \\Delta x"></div>
    <p>Her er <span data-math='x_i' data-display='inline'></span> et valgt punkt i hvert delinterval, og <span data-math='\\Delta x = \\frac{b-a}{n}' data-display='inline'></span> er bredden. Når <span data-math='n \\to \\infty' data-display='inline'></span> går venstre-, højre- og midtpunktssum alle mod samme værdi.</p>

    <p style="margin-top: 20px;"><strong>Stamfunktionen (F(x)):</strong></p>
    <p>En stamfunktion <span data-math="F(x)" data-display="inline"></span> til en funktion <span data-math="f(x)" data-display="inline"></span> er defineret ved, at hvis man differentierer <span data-math="F" data-display="inline"></span>, får man <span data-math="f" data-display="inline"></span> tilbage: <span data-math="F'(x) = f(x)" data-display="inline"></span>.</p>
    <p>Stamfunktionen er ikke entydig: er <span data-math='F(x)' data-display='inline'></span> en stamfunktion, er <span data-math='F(x)+k' data-display='inline'></span> det også. Det skrives <span data-math='\\int f(x)\\,dx = F(x)+k' data-display='inline'></span> (det ubestemte integral).</p>
    <p>Takket være Infinitesimalregningens Fundamentalsætning, kan vi udregne arealet meget nemt, hvis vi kender stamfunktionen:</p>
    <div data-math="\\int_{a}^{b} f(x) \\, dx = [F(x)]_{a}^{b} = F(b) - F(a)"></div>

    <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
      <h4 style="margin-bottom: 10px; color: var(--accent-emerald);">Interaktiv Riemann-sum Analyse</h4>
      <p style="font-size: 14px; margin-bottom: 15px; color: var(--text-secondary);">Hvordan rektanglerne placeres (venstrekant, højrekant eller midtpunkt) afgør, om vi overvurderer eller undervurderer arealet, før vi tager grænseværdien. Prøv at skifte type:</p>
      
      <div class="btn-group" style="margin-bottom: 15px;">
        <button class="control-btn sum-btn" data-type="under" style="background-color:var(--bg-tertiary); color:var(--text-primary);">Venstresum</button>
        <button class="control-btn sum-btn" data-type="mid" style="background-color:var(--accent-emerald); color:white;">Midtpunkt</button>
        <button class="control-btn sum-btn" data-type="over" style="background-color:var(--bg-tertiary); color:var(--text-primary);">Højresum</button>
      </div>

      <div id="riemann-container" style="width: 100%; height: 250px; background: var(--bg-primary); border-radius: var(--radius-md); border: 1px solid var(--border-color); overflow: hidden;"></div>
    </div>
  `,
  initVisualizer: (container, controls, formulaContainer) => {
    // Canvas understands real color strings, not CSS var(--...). Resolve them once.
    const rootStyle = getComputedStyle(document.documentElement);
    const cssVar = (n, fb) => rootStyle.getPropertyValue(n).trim() || fb;
    const COLOR_EMERALD = cssVar('--accent-emerald', '#10b981');

    // 1. MAIN VISUALIZER
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    
    let numRects = 8;
    let aValue = 100;
    let bValue = 400;

    function f(x) {
      const mathX = (x - 50) * 0.015;
      const mathY = Math.sin(mathX) * 1.2 + Math.sin(mathX * 2.3) * 0.4 + 2;
      return mathY * 70;
    }

    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Antal rektangler (n): <span class="control-value" id="rect-val">8</span></label>
        <input type="range" class="slider-input" id="rect-slider" min="2" max="100" value="8">
      </div>
      <div class="control-group">
        <label class="control-label">Grænser (a til b):</label>
        <div style="display: flex; gap: 10px;">
          <input type="range" class="slider-input" id="a-slider" min="50" max="250" value="100" style="flex: 1;">
          <input type="range" class="slider-input" id="b-slider" min="260" max="450" value="400" style="flex: 1;">
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Resultat:</label>
        <div style="font-size: 13px; margin-top: 4px;">
          <span style="color: var(--accent-emerald);">Areal (Midtpunktsum): </span>
          <strong id="area-riemann" class="control-value">0.00</strong><br/>
          <span style="color: var(--accent-blue);">Eksakt Areal (F(b)-F(a)): </span>
          <strong id="area-exact" class="control-value">0.00</strong>
        </div>
      </div>
    `;

    const rectSlider = document.getElementById('rect-slider');
    const aSlider = document.getElementById('a-slider');
    const bSlider = document.getElementById('b-slider');
    
    rectSlider.addEventListener('input', (e) => { numRects = parseInt(e.target.value); document.getElementById('rect-val').textContent = numRects; drawMain(); if(slopeCtx) drawRiemann(); });
    aSlider.addEventListener('input', (e) => { aValue = parseInt(e.target.value); if(aValue >= bValue) bValue = aValue+10; drawMain(); if(slopeCtx) drawRiemann(); });
    bSlider.addEventListener('input', (e) => { bValue = parseInt(e.target.value); if(bValue <= aValue) aValue = bValue-10; drawMain(); if(slopeCtx) drawRiemann(); });

    let mainObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if(rect.width > 0) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        drawMain();
      }
    });
    mainObserver.observe(container);

    function getExactArea() {
      let sum = 0;
      const steps = 1000;
      const dx = (bValue - aValue) / steps;
      for (let i = 0; i < steps; i++) {
        sum += ((f(aValue + i*dx) + f(aValue + (i+1)*dx)) / 2) * dx;
      }
      return sum / 1000;
    }

    function drawMain() {
      const w = canvas.width / window.devicePixelRatio || container.clientWidth;
      const h = canvas.height / window.devicePixelRatio || container.clientHeight;
      if(w===0) return;
      ctx.clearRect(0, 0, w, h);

      const bottomY = h * 0.85;

      // Exact area fill
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.moveTo(aValue, bottomY);
      for (let x = aValue; x <= bValue; x++) ctx.lineTo(x, bottomY - f(x));
      ctx.lineTo(bValue, bottomY);
      ctx.fill();

      // Curve
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 30; x < w - 20; x++) {
        const y = bottomY - f(x);
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Rectangles (Midpoint)
      const rectWidth = (bValue - aValue) / numRects;
      let riemannSum = 0;
      ctx.strokeStyle = COLOR_EMERALD;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < numRects; i++) {
        const rx = aValue + i * rectWidth;
        const ry = f(rx + rectWidth / 2);
        riemannSum += ry * rectWidth;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fillRect(rx + 1, bottomY - ry, rectWidth - 2, ry);
        ctx.strokeRect(rx + 1, bottomY - ry, rectWidth - 2, ry);
      }

      document.getElementById('area-exact').textContent = getExactArea().toFixed(3);
      document.getElementById('area-riemann').textContent = (riemannSum / 1000).toFixed(3);
    }

    // 2. FORMULA SECTION VISUALIZER (Riemann Types)
    let slopeCanvas = null;
    let slopeCtx = null;
    let riemannObserver = null;
    let sumType = 'mid'; // 'under', 'mid', 'over'

    function initRiemannField() {
      const sfContainer = document.getElementById('riemann-container');
      if (!sfContainer) {
        setTimeout(initRiemannField, 100);
        return;
      }
      
      // Setup buttons
      document.querySelectorAll('.sum-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          sumType = e.target.getAttribute('data-type');
          document.querySelectorAll('.sum-btn').forEach(b => {
            b.style.backgroundColor = 'var(--bg-tertiary)';
            b.style.color = 'var(--text-primary)';
          });
          e.target.style.backgroundColor = 'var(--accent-emerald)';
          e.target.style.color = 'white';
          drawRiemann();
        });
      });

      slopeCanvas = document.createElement('canvas');
      slopeCanvas.style.width = '100%';
      slopeCanvas.style.height = '100%';
      sfContainer.appendChild(slopeCanvas);
      slopeCtx = slopeCanvas.getContext('2d');

      riemannObserver = new ResizeObserver(() => {
        const rect = sfContainer.getBoundingClientRect();
        if(rect.width > 0) {
          slopeCanvas.width = rect.width * window.devicePixelRatio;
          slopeCanvas.height = rect.height * window.devicePixelRatio;
          slopeCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
          drawRiemann();
        }
      });
      riemannObserver.observe(sfContainer);
    }
    initRiemannField();

    function drawRiemann() {
      if(!slopeCtx) return;
      const w = slopeCanvas.width / window.devicePixelRatio;
      const h = slopeCanvas.height / window.devicePixelRatio;
      if(w===0) return;
      slopeCtx.clearRect(0,0,w,h);

      const bottomY = h * 0.9;
      
      // We use the same function, scaled to this canvas
      function rf(x) {
        const mathX = (x - 20) * 0.015;
        const mathY = Math.sin(mathX) * 1.2 + Math.sin(mathX * 2.3) * 0.4 + 2;
        return mathY * (h * 0.2);
      }

      // Exact curve
      slopeCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      slopeCtx.lineWidth = 2;
      slopeCtx.beginPath();
      for (let x = 20; x < w - 20; x++) {
        if(x===20) slopeCtx.moveTo(x, bottomY - rf(x));
        else slopeCtx.lineTo(x, bottomY - rf(x));
      }
      slopeCtx.stroke();

      // Rectangles (tied to numRects from main controls!)
      const locA = 50;
      const locB = w - 50;
      const rectWidth = (locB - locA) / numRects;
      
      slopeCtx.strokeStyle = COLOR_EMERALD;
      slopeCtx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      
      for (let i = 0; i < numRects; i++) {
        const rx = locA + i * rectWidth;
        let ry;
        if(sumType === 'under') ry = Math.min(rf(rx), rf(rx + rectWidth)); // Simplification: actual left endpoint might not be under if function decreases, but usually left=under for increasing. Let's use left endpoint for 'under' label.
        if(sumType === 'under') ry = rf(rx); // Left Riemann
        else if (sumType === 'over') ry = rf(rx + rectWidth); // Right Riemann
        else ry = rf(rx + rectWidth/2); // Midpoint

        slopeCtx.fillRect(rx + 1, bottomY - ry, rectWidth - 2, ry);
        slopeCtx.strokeRect(rx + 1, bottomY - ry, rectWidth - 2, ry);
      }
    }

    return () => {
      mainObserver.disconnect();
      if(riemannObserver) riemannObserver.disconnect();
    };
  }
};
