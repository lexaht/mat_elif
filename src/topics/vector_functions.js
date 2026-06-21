export default {
  title: "Vektorfunktioner",
  subtitle: "Hvordan tegner man en rutsjebane matematisk?",
  elif: `
    <p>Forestil dig en magisk tegnetavle (Etch-A-Sketch) med to drejeknapper. Den ene knap styrer pennen <strong>venstre/højre</strong>, og den anden knap styrer pennen <strong>op/ned</strong>.</p>
    
    <div class="analogy-box">
      <div class="analogy-title">Tegnetavle-analogien</div>
      <p class="analogy-text">
        Hvis du drejer på begge knapper på samme tid efter en bestemt "opskrift", vil pennen bevæge sig i en blød, glidende kurve på skærmen – som et fly, der laver loops, eller en rutsjebane.
      </p>
      <p class="analogy-text" style="margin-top: 8px;">
        Samtidig har pennen altid en <strong>fart og en retning</strong> i det øjeblik, den tegner. Hvis du satte en pil på pennen, ville pilen altid pege præcis i den retning, pennen er på vej hen (som forlygterne på en bil, der drejer).
      </p>
    </div>

    <p>En vektorfunktion er bare denne "opskrift". I stedet for at sige, hvad y er, når vi kender x, bruger vi en stopur-tid (t). Vi fortæller matematikken: "Til tiden t = 3 sekunder, hvor er vi så henne på venstre/højre knappen, og hvor er vi henne på op/ned knappen?" Dette lader os tegne kurver, der krydser sig selv og laver loops!</p>
  `,
  formula: `
    <div class="formula-card-sub">Parameterfremstilling og vektorfunktioner i planen.</div>
    
    <p>En vektorfunktion <span data-math="\\vec{r}(t)" data-display="inline"></span> beskriver en partikels position til tiden <span data-math="t" data-display="inline"></span> ved at bruge to uafhængige funktioner for x- og y-koordinaterne (kaldet koordinatfunktioner):</p>
    <div data-math="\\vec{r}(t) = \\begin{pmatrix} x(t) \\\\ y(t) \\end{pmatrix}"></div>
    
    <p style="margin-top: 20px;"><strong>Hastighedsvektor (Differentialkvotient for vektorer):</strong></p>
    <p>Når vi differentierer en vektorfunktion med hensyn til tiden <span data-math="t" data-display="inline"></span>, differentierer vi blot hver koordinat for sig. Dette giver <strong>hastighedsvektoren</strong> <span data-math="\\vec{v}(t)" data-display="inline"></span>, som altid er tangent (peger i køreretningen) til banekurven:</p>
    <div data-math="\\vec{v}(t) = \\vec{r}'(t) = \\begin{pmatrix} x'(t) \\\\ y'(t) \\end{pmatrix}"></div>

    <p style="margin-top: 20px;"><strong>Fart (Længden af hastighedsvektoren):</strong></p>
    <p>Vektoren viser retningen, men hvor hurtigt kører vi? Farten er hastighedsvektorens længde, som findes med Pythagoras:</p>
    <div data-math="|\\vec{v}(t)| = \\sqrt{(x'(t))^2 + (y'(t))^2}"></div>
    
    <p style="margin-top: 20px;"><strong>Tangent til banekurven:</strong></p>
    <p>Tangenten til banekurven i punktet svarende til <span data-math="t_0" data-display="inline"></span> har hastighedsvektoren som retningsvektor:</p>
    <div data-math="\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\vec{r}(t_0) + s \\cdot \\vec{r}'(t_0)"></div>

    <p style="margin-top: 20px;"><strong>Accelerationsvektor:</strong></p>
    <p>Differentierer vi hastigheden, får vi <strong>accelerationsvektoren</strong>. Den fortæller hvordan hastigheden ændrer sig — både hvis farten øges/bremses, og hvis retningen drejer. Når farten er konstant og banen krummer, peger accelerationen vinkelret ind mod kurvens indre (centripetalt, som ind mod midten af et sving).</p>
    <div data-math="\\vec{a}(t) = \\vec{v}'(t) = \\vec{r}''(t) = \\begin{pmatrix} x''(t) \\\\ y''(t) \\end{pmatrix}"></div>
  `,
  initVisualizer: (container, controls, formulaContainer) => {
    // Canvas understands real color strings, not CSS var(--...). Resolve them once.
    const rootStyle = getComputedStyle(document.documentElement);
    const cssVar = (name, fallback) => rootStyle.getPropertyValue(name).trim() || fallback;
    const COLOR_EMERALD = cssVar('--accent-emerald', '#10b981');
    const COLOR_PINK = cssVar('--accent-pink', '#ec4899');
    const COLOR_TEXT = cssVar('--text-primary', '#f3f4f6');

    const canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationId = null;
    let isPlaying = true;
    let t = 0;
    const history = [];
    const maxHistory = 400; // Trail length

    // Equation parameters for a Lissajous curve: x(t) = A*cos(at), y(t) = B*sin(bt)
    let freqX = 3;
    let freqY = 2;
    let showVelocity = true;
    let showAcceleration = false;

    // Controls
    controls.innerHTML = `
      <div class="control-group">
        <label class="control-label">X-Knap (Frekvens a): <span class="control-value" id="freqx-val">3</span></label>
        <input type="range" class="slider-input" id="freqx-slider" min="1" max="5" value="3">
      </div>
      <div class="control-group">
        <label class="control-label">Y-Knap (Frekvens b): <span class="control-value" id="freqy-val">2</span></label>
        <input type="range" class="slider-input" id="freqy-slider" min="1" max="5" value="2">
      </div>
      <div class="control-group">
        <label class="control-label">Vis vektorer:</label>
        <div class="btn-group">
          <button class="control-btn" id="btn-vel" style="background-color: var(--accent-emerald); color: white;">Hastighed (v)</button>
          <button class="control-btn" id="btn-acc">Acceleration (a)</button>
        </div>
      </div>
      <div class="control-group">
        <label class="control-label">Handling:</label>
        <div class="btn-group">
          <button class="control-btn" id="vec-play-pause"><i class="fa-solid fa-pause"></i> <span>Pause</span></button>
          <button class="control-btn" id="vec-reset">Nulstil t</button>
        </div>
      </div>
    `;

    const fxSlider = document.getElementById('freqx-slider');
    const fxVal = document.getElementById('freqx-val');
    const fySlider = document.getElementById('freqy-slider');
    const fyVal = document.getElementById('freqy-val');
    const btnVel = document.getElementById('btn-vel');
    const btnAcc = document.getElementById('btn-acc');

    fxSlider.addEventListener('input', (e) => {
      freqX = parseInt(e.target.value);
      fxVal.textContent = freqX;
      history.length = 0; // clear path
    });

    fySlider.addEventListener('input', (e) => {
      freqY = parseInt(e.target.value);
      fyVal.textContent = freqY;
      history.length = 0; // clear path
    });

    btnVel.addEventListener('click', () => {
      showVelocity = !showVelocity;
      btnVel.style.backgroundColor = showVelocity ? 'var(--accent-emerald)' : 'var(--bg-tertiary)';
      btnVel.style.color = showVelocity ? 'white' : 'var(--text-primary)';
    });

    btnAcc.addEventListener('click', () => {
      showAcceleration = !showAcceleration;
      btnAcc.style.backgroundColor = showAcceleration ? 'var(--accent-pink)' : 'var(--bg-tertiary)';
      btnAcc.style.color = showAcceleration ? 'white' : 'var(--text-primary)';
    });

    const btnPlay = document.getElementById('vec-play-pause');
    btnPlay.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btnPlay.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i> <span>Pause</span>' : '<i class="fa-solid fa-play"></i> <span>Start</span>';
    });

    const btnReset = document.getElementById('vec-reset');
    btnReset.addEventListener('click', () => {
      t = 0;
      history.length = 0; // clear trail
    });

    let resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    });
    resizeObserver.observe(container);

    function drawArrow(ctx, fromX, fromY, toX, toY, color) {
      const headlen = 10;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      
      // Arrowhead
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.fill();
    }

    function draw() {
      const w = canvas.width / window.devicePixelRatio || container.clientWidth;
      const h = canvas.height / window.devicePixelRatio || container.clientHeight;
      if (w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const scaleX = w * 0.35;
      const scaleY = h * 0.35;

      // Position functions: x(t) = cos(freqX * t), y(t) = sin(freqY * t)
      const xFn = (time) => scaleX * Math.sin(freqX * time);
      const yFn = (time) => scaleY * Math.sin(freqY * time + Math.PI/4); // phase shift to make it interesting

      // Derivatives for velocity (chain rule)
      const vxFn = (time) => freqX * scaleX * Math.cos(freqX * time);
      const vyFn = (time) => freqY * scaleY * Math.cos(freqY * time + Math.PI/4);

      // Second derivatives for acceleration
      const axFn = (time) => -freqX * freqX * scaleX * Math.sin(freqX * time);
      const ayFn = (time) => -freqY * freqY * scaleY * Math.sin(freqY * time + Math.PI/4);

      const currX = centerX + xFn(t);
      const currY = centerY + yFn(t);

      if (isPlaying) {
        history.push({ x: currX, y: currY });
        if (history.length > maxHistory) history.shift();
      }

      // Draw faint axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY); ctx.lineTo(w, centerY);
      ctx.moveTo(centerX, 0); ctx.lineTo(centerX, h);
      ctx.stroke();

      // Draw path history
      if (history.length > 1) {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(history[0].x, history[0].y);
        for (let i = 1; i < history.length; i++) {
          ctx.lineTo(history[i].x, history[i].y);
        }
        ctx.stroke();
      }

      // Draw moving particle
      ctx.fillStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.arc(currX, currY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw velocity vector (tangent)
      if (showVelocity) {
        // scale down velocity for visual aesthetics
        const visualVelScale = 0.2; 
        const vx = vxFn(t) * visualVelScale;
        const vy = vyFn(t) * visualVelScale;
        drawArrow(ctx, currX, currY, currX + vx, currY + vy, COLOR_EMERALD);
      }

      // Draw acceleration vector (inwards)
      if (showAcceleration) {
        const visualAccScale = 0.05;
        const ax = axFn(t) * visualAccScale;
        const ay = ayFn(t) * visualAccScale;
        drawArrow(ctx, currX, currY, currX + ax, currY + ay, COLOR_PINK);
      }

      // Live speed readout |v(t)| from the true (unscaled) velocity functions
      const speed = Math.sqrt(vxFn(t) * vxFn(t) + vyFn(t) * vyFn(t)) / Math.max(scaleX, scaleY);
      ctx.fillStyle = COLOR_TEXT;
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Fart |v| = ' + speed.toFixed(2), currX + 12, currY - 12);

      if (isPlaying) {
        t += 0.015;
      }
    }

    function animate() {
      draw();
      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }
};
