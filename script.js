document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('vibeCanvas');
  const menuCanvas = document.getElementById('menuBgCanvas');
  if (!canvas || !menuCanvas) return;
  
  const ctx = canvas.getContext('2d');
  const mCtx = menuCanvas.getContext('2d');
  
  let width = canvas.width = menuCanvas.width = window.innerWidth;
  let height = canvas.height = menuCanvas.height = window.innerHeight;
  
  const bgStars = [];
  const nebulaePoints = [];
  let engineActive = false;

  // Anti-Lag Performance Telemetry Properties
  let lastFrameTime = performance.now();
  let frameCount = 0;
  let currentFps = 0;
  let fpsUpdateTimer = 0;
  let renderFpsCounter = false;

  // 100x Prettier Start Menu Moving Vector Stars Array
  const menuStars = [];
  for (let i = 0; i < 60; i++) {
    menuStars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random()
    });
  }

  function initBackground() {
    bgStars.length = 0;
    const starCount = Math.floor((width * height) / 5000); 
    for(let i = 0; i < starCount; i++) {
      bgStars.push({
        x: Math.random() * width, y: Math.random() * height,
        size: Math.random() * 1.2 + 0.4, twinkleSpeed: Math.random() * 0.04 + 0.01,
        phase: Math.random() * Math.PI * 2, parallaxFactor: Math.random() * 0.3 + 0.1
      });
    }

    nebulaePoints.length = 0;
    const cloudCount = 3;
    for(let i = 0; i < cloudCount; i++) {
      nebulaePoints.push({
        x: Math.random() * width, y: Math.random() * height,
        baseRadius: Math.max(width, height) * (Math.random() * 0.15 + 0.2),
        angleOffset: Math.random() * Math.PI * 2, driftSpeed: Math.random() * 0.003 + 0.001
      });
    }
  }

  // Hook Overlay DOM Elements
  const startMenu = document.getElementById('startMenu');
  const launchSandboxBtn = document.getElementById('launchSandboxBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const closeBtn = document.getElementById('closeBtn');

  // Hook Admin Panel Elements
  const adminBtn = document.getElementById('adminBtn');
  const adminPanel = document.getElementById('adminPanel');
  const adminCloseBtn = document.getElementById('adminCloseBtn');
  const toggleFpsCounter = document.getElementById('toggleFpsCounter');
  const fpsDisplay = document.getElementById('fpsDisplay');
  // Hook Password Modal DOM Elements
  const launchProtectedBtn = document.getElementById('launchProtectedBtn');
  const passwordModal = document.getElementById('passwordModal');
  const secureKeyInput = document.getElementById('secureKeyInput');
  const passwordError = document.getElementById('passwordError');
  const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
  const submitPasswordBtn = document.getElementById('submitPasswordBtn');

  // Inject New: Password Visibility Toggle Button directly into the HTML layer dynamically to save you manual edits
  const pwdInputWrapper = secureKeyInput.parentElement;
  pwdInputWrapper.style.position = 'relative';
  
  const eyeBtn = document.createElement('button');
  eyeBtn.innerHTML = '👁️';
  eyeBtn.style.position = 'absolute';
  eyeBtn.style.right = '12px';
  eyeBtn.style.top = '50%';
  eyeBtn.style.transform = 'translateY(-50%)';
  eyeBtn.style.background = 'none';
  eyeBtn.style.border = 'none';
  eyeBtn.style.cursor = 'pointer';
  eyeBtn.style.fontSize = '14px';
  eyeBtn.style.opacity = '0.5';
  eyeBtn.style.transition = 'opacity 0.2s';
  eyeBtn.style.zIndex = '10';
  eyeBtn.title = 'Toggle Password Visibility';
  pwdInputWrapper.appendChild(eyeBtn);

  // Visibility toggle handler
  eyeBtn.addEventListener('click', () => {
    if (secureKeyInput.type === 'password') {
      secureKeyInput.type = 'text';
      eyeBtn.style.opacity = '1';
    } else {
      secureKeyInput.type = 'password';
      eyeBtn.style.opacity = '0.5';
    }
  });

  // Core Sandbox Engine Trigger Initializer
  function startSandboxSimulation(isPasswordSim) {
    startMenu.classList.add('fade-out');
    passwordModal.style.display = 'none';
    passwordModal.classList.add('hidden-interface');
    menuCanvas.style.opacity = '0'; // Softly fade away background stars
    
    settingsBtn.style.display = 'flex';
    settingsBtn.classList.remove('hidden-interface');
    
    // Only display admin override toggle button if entered via correct passcode
    if (isPasswordSim) {
      adminBtn.style.display = 'flex';
      adminBtn.classList.remove('hidden-interface');
    } else {
      adminBtn.style.display = 'none';
      adminBtn.classList.add('hidden-interface');
      adminPanel.classList.add('hidden'); 
    }
    
    engineActive = true;
    matchSwarmCount(); 
    draw();
  }

  function returnToRootMenu() {
    engineActive = false; // Halt main thread particle ticks instantly
    
    startMenu.classList.remove('fade-out');
    menuCanvas.style.opacity = '0.85'; // Restore menu background stars clarity
    settingsPanel.classList.add('hidden');
    adminPanel.classList.add('hidden');
    
    settingsBtn.classList.add('hidden-interface');
    adminBtn.classList.add('hidden-interface');
    fpsDisplay.style.display = 'none';
    toggleFpsCounter.checked = false;
    renderFpsCounter = false;
    
    ctx.clearRect(0, 0, width, height);
    swarm.length = 0; // Wipe old node memory heaps completely
  }

  document.querySelectorAll('.back-to-menu-trigger').forEach(btn => {
    btn.addEventListener('click', returnToRootMenu);
  });
  // Sandbox button directly enters the game, passing `false` to block admin tool button
  launchSandboxBtn.addEventListener('click', () => {
    startSandboxSimulation(false);
  });

  function openPasswordGate() {
    passwordModal.style.display = 'flex';
    passwordModal.classList.remove('hidden-interface');
    secureKeyInput.value = '';
    secureKeyInput.type = 'password'; // Reset to secured dots by default
    eyeBtn.style.opacity = '0.5';
    passwordError.style.opacity = '0';
    secureKeyInput.focus();
  }

  if (launchProtectedBtn) {
    launchProtectedBtn.addEventListener('click', openPasswordGate);
  }

  cancelPasswordBtn.addEventListener('click', () => {
    passwordModal.style.display = 'none';
    passwordModal.classList.add('hidden-interface');
  });

  function verifySecretKey() {
    if (secureKeyInput.value === 'Admin123') {
      passwordError.style.opacity = '0';
      startSandboxSimulation(true); // Grants full left-side admin override control
    } else {
      passwordError.style.opacity = '1';
      secureKeyInput.value = '';
      secureKeyInput.focus();
    }
  }

  submitPasswordBtn.addEventListener('click', verifySecretKey);
  secureKeyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') verifySecretKey();
  });

  adminBtn.addEventListener('click', () => adminPanel.classList.remove('hidden'));
  adminCloseBtn.addEventListener('click', () => adminPanel.classList.add('hidden'));
  
  toggleFpsCounter.addEventListener('change', e => {
    renderFpsCounter = e.target.checked;
    if (renderFpsCounter) fpsDisplay.style.display = 'block';
    else fpsDisplay.style.display = 'none';
  });

  window.addEventListener('resize', () => {
    width = canvas.width = menuCanvas.width = window.innerWidth;
    height = canvas.height = menuCanvas.height = window.innerHeight;
    initBackground();
  });
  
  const inputCount = document.getElementById('ballNumber');
  const inputSize = document.getElementById('ballSize');
  const inputStrength = document.getElementById('gravStrength');
  const inputSpeed = document.getElementById('gravSpeed');
  const inputFriction = document.getElementById('swarmFriction');
  const inputTrails = document.getElementById('trailLength');
  const inputLines = document.getElementById('toggleLines');
  const inputTheme = document.getElementById('themePreset');
  const valCount = document.getElementById('valCount');
  const valSize = document.getElementById('valSize');
  const valStrength = document.getElementById('valStrength');
  const valSpeed = document.getElementById('valSpeed');
  const valFriction = document.getElementById('valFriction');
  const valTrails = document.getElementById('valTrails');

  settingsBtn.addEventListener('click', () => settingsPanel.classList.remove('hidden'));
  closeBtn.addEventListener('click', () => settingsPanel.classList.add('hidden'));

  let config = {
    count: parseInt(inputCount.value), baseSize: parseFloat(inputSize.value),
    strength: parseFloat(inputStrength.value), maxSpeed: parseInt(inputSpeed.value),
    drag: parseFloat(inputFriction.value), trail: parseFloat(inputTrails.value),
    renderLines: inputLines.checked, theme: inputTheme.value
  };

  const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2, active: false };
  const pulses = []; const sparks = []; const swarm = [];
  let baseHue = 190;

  // Swarm Particle Blueprint Class Engine
  class Bee {
    constructor() { this.init(); }
    init() {
      this.x = Math.random() * (width - 40) + 20; this.y = Math.random() * (height - 40) + 20;
      this.vx = (Math.random() - 0.5) * 4; this.vy = (Math.random() - 0.5) * 4;
      this.sizeModifier = Math.random() * 0.5 + 0.8; this.angleOffset = Math.random() * Math.PI * 2;
    }
    update(timeValue) {
      let dx = mouse.x - this.x; let dy = mouse.y - this.y; let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 5) {
        let baseForce = Math.min(0.5, 150 / distance);
        this.vx += (dx / distance) * baseForce * config.strength; this.vy += (dy / distance) * baseForce * config.strength;
      }
      this.vx += Math.sin(timeValue + this.angleOffset) * 0.18; this.vy += Math.cos(timeValue + this.angleOffset) * 0.18;
      for (let i = 0; i < pulses.length; i++) {
        let p = pulses[i]; let pdx = this.x - p.x; let pdy = this.y - p.y; let pDist = Math.sqrt(pdx * pdx + pdy * pdy); let diff = Math.abs(pDist - p.radius);
        if (diff < 120) {
          let push = (1 - diff / 120) * p.force * p.life;
          if (pDist > 0) { this.vx += (pdx / pDist) * push * 0.5; this.vy += (pdy / pDist) * push * 0.5; }
        }
      }
      this.vx *= config.drag; this.vy *= config.drag;
      let currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (currentSpeed > config.maxSpeed) { this.vx = (this.vx / currentSpeed) * config.maxSpeed; this.vy = (this.vy / currentSpeed) * config.maxSpeed; }
      this.x += this.vx; this.y += this.vy;
      const calculatedRadius = config.baseSize * this.sizeModifier; const bounceFriction = 0.82;
      if (this.x - calculatedRadius < 0) { this.x = calculatedRadius; this.vx = -this.vx * bounceFriction; }
      else if (this.x + calculatedRadius > width) { this.x = width - calculatedRadius; this.vx = -this.vx * bounceFriction; }
      if (this.y - calculatedRadius < 0) { this.y = calculatedRadius; this.vy = -this.vy * bounceFriction; }
      else if (this.y + calculatedRadius > height) { this.y = height - calculatedRadius; this.vy = -this.vy * bounceFriction; }
    }
    draw() {
      const calculatedRadius = config.baseSize * this.sizeModifier; let speedFactor = Math.sqrt(this.vx * this.vx + this.vy * this.vy); let fillStyle = '';
      if (config.theme === 'cyber') { fillStyle = `hsla(${baseHue + (speedFactor * 4)}, 100%, 70%, 0.95)`; }
      else if (config.theme === 'matrix') { fillStyle = `hsla(120, 100%, ${60 + speedFactor * 2}%, 0.95)`; }
      else if (config.theme === 'synth') { fillStyle = `hsla(320, 100%, ${60 + speedFactor * 2}%, 0.95)`; }
      else if (config.theme === 'deep') { fillStyle = `hsla(190, 100%, ${65 + speedFactor * 2}%, 0.95)`; }
      ctx.beginPath(); ctx.arc(this.x, this.y, calculatedRadius, 0, Math.PI * 2); ctx.fillStyle = fillStyle; ctx.fill();
    }
  }

  function matchSwarmCount() {
    if (swarm.length < config.count) { while (swarm.length < config.count) swarm.push(new Bee()); }
    else if (swarm.length > config.count) { swarm.length = config.count; }
  }
  function drawMenuBackground() {
    if (engineActive) return;
    mCtx.fillStyle = '#020205'; mCtx.fillRect(0, 0, width, height);
    mCtx.fillStyle = 'rgba(0, 255, 200, 0.35)';
    menuStars.forEach(s => {
      s.y -= s.speed; if (s.y < 0) s.y = height;
      s.opacity += (Math.random() - 0.5) * 0.04; s.opacity = Math.max(0.1, Math.min(1, s.opacity));
      mCtx.globalAlpha = s.opacity; mCtx.fillRect(s.x, s.y, s.r, s.r);
    });
    mCtx.globalAlpha = 1;
    requestAnimationFrame(drawMenuBackground);
  }

  inputCount.addEventListener('input', e => { config.count = parseInt(e.target.value); valCount.textContent = config.count; matchSwarmCount(); });
  inputSize.addEventListener('input', e => { config.baseSize = parseFloat(e.target.value); valSize.textContent = config.baseSize.toFixed(1) + "px"; });
  inputStrength.addEventListener('input', e => { config.strength = parseFloat(e.target.value); valStrength.textContent = config.strength.toFixed(1); });
  inputSpeed.addEventListener('input', e => { config.maxSpeed = parseInt(e.target.value); valSpeed.textContent = config.maxSpeed; });
  inputFriction.addEventListener('input', e => { config.drag = parseFloat(e.target.value); if (config.drag > 0.97) valFriction.textContent = "Low (Icy)"; else if (config.drag >= 0.93) valFriction.textContent = "Medium"; else valFriction.textContent = "High (Heavy)"; });
  inputTrails.addEventListener('input', e => { config.trail = parseFloat(e.target.value); if (config.trail <= 0.1) valTrails.textContent = "Sharp"; else if (config.trail <= 0.25) valTrails.textContent = "Long"; else valTrails.textContent = "Hyper Fluid"; });
  inputLines.addEventListener('change', e => { config.renderLines = e.target.checked; });
  inputTheme.addEventListener('change', e => { config.theme = e.target.value; });

  window.addEventListener('mousemove', e => { mouse.targetX = e.clientX; mouse.targetY = e.clientY; mouse.active = true; });
  window.addEventListener('mouseleave', () => { mouse.active = false; });

  window.addEventListener('click', e => {
    if (!engineActive || settingsPanel.contains(e.target) || settingsBtn.contains(e.target) || adminPanel.contains(e.target) || adminBtn.contains(e.target) || passwordModal.contains(e.target)) return;
    baseHue = (baseHue + 65) % 360; const sparkCount = 20;
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 5 + 3; let sparkHue = baseHue;
      if (config.theme === 'matrix') sparkHue = 120; else if (config.theme === 'synth') sparkHue = 320; else if (config.theme === 'deep') sparkHue = 190;
      sparks.push({ x: e.clientX, y: e.clientY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: Math.random() * 1.8 + 0.8, hue: sparkHue + (config.theme === 'cyber' ? Math.random() * 30 : 0), alpha: 1, decay: Math.random() * 0.03 + 0.02 });
    }
  });

  window.addEventListener('contextmenu', e => {
    if (!engineActive || settingsPanel.contains(e.target) || settingsBtn.contains(e.target) || adminPanel.contains(e.target) || adminBtn.contains(e.target) || passwordModal.contains(e.target)) return;
    e.preventDefault(); pulses.push({ x: e.clientX, y: e.clientY, radius: 0, maxRadius: Math.max(width, height) * 0.85, force: 140, life: 1 });
  });

  // Master hardware accelerated animation engine render track
  function draw() {
    if (!engineActive) return;

    const now = performance.now();
    frameCount++; fpsUpdateTimer += (now - lastFrameTime); lastFrameTime = now;

    if (fpsUpdateTimer >= 1000) {
      currentFps = Math.round((frameCount * 1000) / fpsUpdateTimer);
      if (renderFpsCounter) {
        fpsDisplay.textContent = `FPS: ${currentFps}`;
        if (currentFps >= 50) fpsDisplay.style.color = '#00ffcc';
        else if (currentFps >= 30) fpsDisplay.style.color = '#ffaa00';
        else fpsDisplay.style.color = '#ff0055';
      }
      frameCount = 0; fpsUpdateTimer = 0;
    }

    ctx.fillStyle = `rgba(2, 2, 5, ${config.trail})`; ctx.fillRect(0, 0, width, height);
    mouse.x += (mouse.targetX - mouse.x) * 0.08; mouse.y += (mouse.targetY - mouse.y) * 0.08; 
    time += 0.04; // Globally accurate time accumulator variable

    let coreGlow = 'rgba(0, 255, 200,'; let altGlow = 'rgba(0, 100, 255,';
    if (config.theme === 'matrix') { coreGlow = 'rgba(50, 255, 50,'; altGlow = 'rgba(0, 150, 50,'; }
    else if (config.theme === 'synth') { coreGlow = 'rgba(255, 50, 200,'; altGlow = 'rgba(150, 0, 200,'; }
    else if (config.theme === 'deep') { coreGlow = 'rgba(0, 200, 255,'; altGlow = 'rgba(0, 50, 150,'; }
    else if (config.theme === 'cyber') { coreGlow = `hsla(${baseHue},100%,60%,`; altGlow = `hsla(${(baseHue+60)%360},100%,40%,`; }

    nebulaePoints.forEach((p, idx) => {
      p.angleOffset += p.driftSpeed; let cx = p.x + Math.sin(p.angleOffset) * 60; let cy = p.y + Math.cos(p.angleOffset) * 60; let radius = p.baseRadius + Math.sin(time * 0.5 + idx) * 30;
      let gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius); let opacityFactor = 0.04 + (Math.sin(time * 0.2 + idx) * 0.015);
      gradient.addColorStop(0, `${idx % 2 === 0 ? coreGlow : altGlow}${opacityFactor})`); gradient.addColorStop(0.5, `${altGlow}${opacityFactor * 0.4})`); gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    });

    bgStars.forEach(star => {
      star.phase += star.twinkleSpeed; let twinkleAlpha = 0.3 + Math.abs(Math.sin(star.phase)) * 0.7;
      let renderX = star.x + (mouse.x - width / 2) * star.parallaxFactor * -0.05; let renderY = star.y + (mouse.y - height / 2) * star.parallaxFactor * -0.05;
      if (renderX < 0) star.x += width; else if (renderX > width) star.x -= width; if (renderY < 0) star.y += height; else if (renderY > height) star.y -= height;
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkleAlpha * 0.65})`; ctx.fillRect(renderX, renderY, star.size, star.size);
    });

    let portalGlowRadius = Math.max(width, height) * 0.28; let portalGradient = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, portalGlowRadius);
    portalGradient.addColorStop(0, `${coreGlow}0.12)`); portalGradient.addColorStop(0.4, `${altGlow}0.04)`); portalGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = portalGradient; ctx.fillRect(0, 0, width, height);

    for (let i = pulses.length - 1; i >= 0; i--) {
      let p = pulses[i]; p.radius += 22; p.life -= 0.02;
      if (p.life <= 0 || p.radius > p.maxRadius) { pulses.splice(i, 1); }
    }

    swarm.forEach(bee => { bee.update(time); bee.draw(); });

    if (config.renderLines) {
      const maxConnectDistance = 55; const cellSize = 55; const grid = new Map();
      swarm.forEach((b, idx) => { const cx = Math.floor(b.x / cellSize); const cy = Math.floor(b.y / cellSize); const key = `${cx},${cy}`; if (!grid.has(key)) grid.set(key, []); grid.get(key).push(idx); });
      let strokeStyle = ''; if (config.theme === 'cyber') strokeStyle = 'rgba(0,255,200,'; else if (config.theme === 'matrix') strokeStyle = 'rgba(50,255,50,'; else if (config.theme === 'synth') strokeStyle = 'rgba(255,50,200,'; else if (config.theme === 'deep') strokeStyle = 'rgba(0,200,255,';
      ctx.lineWidth = 0.5;
      grid.forEach((cellIndices, key) => {
        const [cx, cy] = key.split(',').map(Number);
        for (let oX = 0; oX <= 1; oX++) {
          for (let oY = (oX === 0 ? 0 : -1); oY <= 1; oY++) {
            const targetKey = `${cx + oX},${cy + oY}`; if (!grid.has(targetKey)) continue;
            const targetIndices = grid.get(targetKey);
            for (let i = 0; i < cellIndices.length; i++) {
              const b1Idx = cellIndices[i]; const b1 = swarm[b1Idx];
              for (let j = 0; j < targetIndices.length; j++) {
                const b2Idx = targetIndices[j]; if (b1Idx >= b2Idx) continue;
                const b2 = swarm[b2Idx]; const dx = b1.x - b2.x; const dy = b1.y - b2.y; const distSq = dx * dx + dy * dy;
                if (distSq < maxConnectDistance * maxConnectDistance) {
                  const distance = Math.sqrt(distSq); const opacity = (1 - (distance / maxConnectDistance)) * 0.22;
                  ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.strokeStyle = `${strokeStyle}${opacity})`; ctx.stroke();
                }
              }
            }
          }
        }
      });
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      let s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vx *= 0.95; s.vy *= 0.95; s.alpha -= s.decay;
      if (s.alpha <= 0) { sparks.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fillStyle = `hsla(${s.hue}, 100%, 75%, ${s.alpha})`; ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  initBackground();
  matchSwarmCount();
  drawMenuBackground();
});