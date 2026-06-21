export default {
  title: "Polære Koordinater",
  subtitle: "Hvordan finder man vej med vinkel og afstand?",
  elif: `
    <p>Normalt når du skal forklare, hvor en skat ligger på et kort, bruger du <strong>firkanter</strong> (X og Y): "Gå 4 skridt mod øst, og derefter 3 skridt mod nord". Det kalder vi kartesiske koordinater.</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Kompas- og radar-analogien</div>
      <p class="analogy-text">
        Men hvad nu hvis du står midt på en øde ø? Der er ingen gader. Så er det meget nemmere at sige: <strong>"Drej dig 37 grader til venstre, og gå 5 skridt lige ud."</strong>
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        Det er <strong>polære koordinater</strong>! Du fortæller to ting: 
        1. <strong>Vinklen</strong> (<span data-math="\\theta" data-display="inline"></span>) du skal dreje.
        2. <strong>Afstanden</strong> (<span data-math="r" data-display="inline"></span>) du skal gå.
      </p>
    </div>

    <p>Dette bruges af krigsskibe, flyradarer, mikrofoner og når man designer computerspil til at rotere figurer eller tegne smukke cirkulære mønstre som spiraler og blomsterblade.</p>
  `,
  formula: `
    <div class="formula-card-sub">Koordinattransformation mellem Kartesiske (x,y) og Polære (r, θ) koordinater.</div>
    
    <p>For et punkt <span data-math="P" data-display="inline"></span> med afstand <span data-math="r" data-display="inline"></span> fra origo (centrum) og vinkel <span data-math="\\theta" data-display="inline"></span> i forhold til x-aksen gælder:</p>
    
    <p style="margin-top: 15px;"><strong>Fra Polære til Kartesiske koordinater:</strong></p>
    <div data-math="x = r \\cdot \\cos(\\theta)"></div>
    <div data-math="y = r \\cdot \\sin(\\theta)"></div>

    <p style="margin-top: 20px;"><strong>Fra Kartesiske til Polære koordinater:</strong></p>
    <div data-math="r = \\sqrt{x^2 + y^2}"></div>
    <div data-math="\\theta = \\arctan\\left(\\frac{y}{x}\\right) \\quad (\\text{for } x > 0)"></div>
    <p class="formula-card-sub" style="font-size: 13px; margin-top: 5px;">Note: Hvis <span data-math="x < 0" data-display="inline"></span> lægges <span data-math="180^\\circ" data-display="inline"></span> (<span data-math="\\pi" data-display="inline"></span>) til vinklen.</p>

    <p style="margin-top: 20px;"><strong>Polære kurver (eksempel: Rosekurve):</strong></p>
    <p>Nogle kurver er meget nemmere at beskrive polært. En rosekurve, der tegner en blomst, beskrives ved:</p>
    <div data-math="r(\\theta) = a \\cdot \\cos(k \\cdot \\theta)"></div>
    <ul class="formula-desc-list">
      <li><strong>a:</strong> Længden på kronbladene.</li>
      <li><strong>k:</strong> Bestemmer antallet af kronblade (hvis <span data-math="k" data-display="inline"></span> er ulige, er der <span data-math="k" data-display="inline"></span> blade; hvis lige, er der <span data-math="2k" data-display="inline"></span> blade).</li>
    </ul>
  `,
  initVisualizer: (container, controls) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationId = null;
    
    // Parameters
    let rValue = 100;
    let thetaValue = 45; // in degrees
    let mode = 'radar'; // 'radar' or 'rose'
    let roseK = 5;
    let autoRotate = false;
    let currentAngle = 0; // for auto-rotation/drawing rose

    // Controls setup
    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">Tilstand:</label>
        <div class="btn-group">
          <button class="control-btn" id="btn-mode-radar" style="background-color: var(--accent-indigo); color: white;">Radar/Punkt</button>
          <button class="control-btn" id="btn-mode-rose">Blomsterblade (Rose)</button>
        </div>
      </div>
      
      <!-- Radar specific controls -->
      <div id="radar-ctrls">
        <div class="control-group">
          <label class="control-label">Afstand (Radius r): <span class="control-value" id="r-val">100 px</span></label>
          <input type="range" class="slider-input" id="r-slider" min="10" max="150" value="100">
        </div>
        <div class="control-group">
          <label class="control-label">Vinkel (θ): <span class="control-value" id="theta-val">45°</span></label>
          <input type="range" class="slider-input" id="theta-slider" min="0" max="360" value="45">
        </div>
      </div>

      <!-- Rose specific controls -->
      <div id="rose-ctrls" style="display:none;">
        <div class="control-group">
          <label class="control-label">Mønster-konstant (k): <span class="control-value" id="k-val">5</span></label>
          <input type="range" class="slider-input" id="k-slider" min="1" max="12" step="1" value="5">
        </div>
        <div class="control-group">
          <label class="control-label">Handling:</label>
          <button class="control-btn" id="btn-rotate-toggle">
            <i class="fa-solid fa-play"></i> <span id="rotate-text">Tegn figur</span>
          </button>
        </div>
      </div>

      <div class="control-group">
        <label class="control-label">Koordinater:</label>
        <div style="font-size:12px; font-family: monospace; line-height: 1.5;">
          <span style="color:var(--accent-pink);">Polær: </span>(r: <span id="polar-r-disp">0</span>, θ: <span id="polar-t-disp">0</span>°)<br/>
          <span style="color:var(--accent-blue);">Kartesisk: </span>(x: <span id="cart-x-disp">0</span>, y: <span id="cart-y-disp">0</span>)
        </div>
      </div>
    `;

    const rSlider = document.getElementById('r-slider');
    const rVal = document.getElementById('r-val');
    const thetaSlider = document.getElementById('theta-slider');
    const thetaVal = document.getElementById('theta-val');
    const kSlider = document.getElementById('k-slider');
    const kVal = document.getElementById('k-val');
    const btnRadar = document.getElementById('btn-mode-radar');
    const btnRose = document.getElementById('btn-mode-rose');
    const radarCtrls = document.getElementById('radar-ctrls');
    const roseCtrls = document.getElementById('rose-ctrls');
    const btnRotate = document.getElementById('btn-rotate-toggle');
    const rotateText = document.getElementById('rotate-text');

    const polarRDisp = document.getElementById('polar-r-disp');
    const polarTDisp = document.getElementById('polar-t-disp');
    const cartXDisp = document.getElementById('cart-x-disp');
    const cartYDisp = document.getElementById('cart-y-disp');

    rSlider.addEventListener('input', (e) => {
      rValue = parseInt(e.target.value);
      rVal.textContent = rValue + ' px';
      updateDisplays();
    });

    thetaSlider.addEventListener('input', (e) => {
      thetaValue = parseInt(e.target.value);
      thetaVal.textContent = thetaValue + '°';
      updateDisplays();
    });

    kSlider.addEventListener('input', (e) => {
      roseK = parseInt(e.target.value);
      kVal.textContent = roseK;
      currentAngle = 0;
    });

    btnRadar.addEventListener('click', () => {
      mode = 'radar';
      btnRadar.style.backgroundColor = 'var(--accent-indigo)';
      btnRadar.style.color = 'white';
      btnRose.style.backgroundColor = 'var(--bg-tertiary)';
      btnRose.style.color = 'var(--text-primary)';
      radarCtrls.style.display = 'block';
      roseCtrls.style.display = 'none';
      autoRotate = false;
      rotateText.textContent = 'Tegn figur';
      btnRotate.innerHTML = '<i class="fa-solid fa-play"></i> <span>Tegn figur</span>';
      updateDisplays();
    });

    btnRose.addEventListener('click', () => {
      mode = 'rose';
      btnRose.style.backgroundColor = 'var(--accent-indigo)';
      btnRose.style.color = 'white';
      btnRadar.style.backgroundColor = 'var(--bg-tertiary)';
      btnRadar.style.color = 'var(--text-primary)';
      radarCtrls.style.display = 'none';
      roseCtrls.style.display = 'block';
      currentAngle = 0;
      updateDisplays();
    });

    btnRotate.addEventListener('click', () => {
      autoRotate = !autoRotate;
      if (autoRotate) {
        rotateText.textContent = 'Pause';
        btnRotate.innerHTML = '<i class="fa-solid fa-pause"></i> <span>Pause</span>';
      } else {
        rotateText.textContent = 'Fortsæt';
        btnRotate.innerHTML = '<i class="fa-solid fa-play"></i> <span>Fortsæt</span>';
      }
    });

    function updateDisplays() {
      if (mode === 'radar') {
        const rad = (thetaValue * Math.PI) / 180;
        const x = rValue * Math.cos(rad);
        const y = rValue * Math.sin(rad);

        polarRDisp.textContent = rValue;
        polarTDisp.textContent = thetaValue;
        cartXDisp.textContent = x.toFixed(1);
        cartYDisp.textContent = (-y).toFixed(1); // canvas Y is inverted
      } else {
        polarRDisp.textContent = `a • cos(${roseK}θ)`;
        polarTDisp.textContent = 'θ';
        cartXDisp.textContent = 'Variable';
        cartYDisp.textContent = 'Variable';
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      updateDisplays();
    }

    window.addEventListener('resize', resize);
    resize();

    // Drawing loops
    function draw() {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;

      // Draw polar grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Circles
      for (let r = 40; r <= 160; r += 40) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radial lines (spokes)
      for (let angleDeg = 0; angleDeg < 360; angleDeg += 30) {
        const rad = (angleDeg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + 160 * Math.cos(rad), centerY + 160 * Math.sin(rad));
        ctx.stroke();

        // Label angles
        if (angleDeg % 90 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.font = '9px monospace';
          // Convert 0, 90, 180, 270 degrees to match standard orientation
          let label = angleDeg.toString();
          if (angleDeg === 90) label = '270°'; // canvas vertical inversion
          else if (angleDeg === 270) label = '90°';
          ctx.fillText(label + '°', centerX + 168 * Math.cos(rad) - 10, centerY + 168 * Math.sin(rad) + 4);
        }
      }

      // Main axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX - 170, centerY);
      ctx.lineTo(centerX + 170, centerY);
      ctx.moveTo(centerX, centerY - 170);
      ctx.lineTo(centerX, centerY + 170);
      ctx.stroke();

      if (mode === 'radar') {
        // RADAR MODE
        const rad = (thetaValue * Math.PI) / 180;
        const targetX = centerX + rValue * Math.cos(-rad); // minus to go counter-clockwise
        const targetY = centerY + rValue * Math.sin(-rad);

        // Sweeping radar effect (just static vector line)
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + 170 * Math.cos(-rad), centerY + 170 * Math.sin(-rad));
        ctx.stroke();

        // Coordinate point vector
        ctx.strokeStyle = 'var(--accent-indigo)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // X/Y projections
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        // X projection line
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(targetX, centerY);
        ctx.stroke();
        // Y projection line
        ctx.beginPath();
        ctx.moveTo(targetX, targetY);
        ctx.lineTo(centerX, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Highlight projections on axes
        ctx.fillStyle = 'var(--accent-pink)';
        ctx.beginPath();
        ctx.arc(targetX, centerY, 4, 0, Math.PI * 2);
        ctx.arc(centerX, targetY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Target dot
        ctx.fillStyle = 'var(--accent-pink)';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
      } else {
        // ROSE MODE
        const petalScale = 140;

        // Draw the full completed rose line faintly in background
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.01) {
          const r = petalScale * Math.cos(roseK * a);
          const rx = centerX + r * Math.cos(a);
          const ry = centerY + r * Math.sin(a);
          if (a === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.stroke();

        // Draw active drawing progress
        ctx.strokeStyle = 'var(--accent-pink)';
        ctx.shadowColor = 'var(--accent-pink)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const limit = autoRotate ? currentAngle : Math.PI * 2;
        for (let a = 0; a <= limit; a += 0.01) {
          const r = petalScale * Math.cos(roseK * a);
          const rx = centerX + r * Math.cos(a);
          const ry = centerY + r * Math.sin(a);
          if (a === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset shadow

        // Pen tip
        if (autoRotate) {
          const r = petalScale * Math.cos(roseK * currentAngle);
          const rx = centerX + r * Math.cos(currentAngle);
          const ry = centerY + r * Math.sin(currentAngle);

          ctx.fillStyle = 'var(--text-primary)';
          ctx.beginPath();
          ctx.arc(rx, ry, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // Increment angle
          currentAngle += 0.025;
          if (currentAngle > Math.PI * 2) {
            currentAngle = 0; // loop
          }
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
      window.removeEventListener('resize', resize);
    };
  }
};
