// Initialize variables
let missionTimeInterval;
let alienResponseTimeout;
let transmissionActive = false;
let dataParticles = [];
let frequencyBars = [];

// Execute when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Set up cursor tracking
  document.addEventListener('mousemove', trackCursor);
  
  // Set up Enter key to transition to dashboard
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      transitionToDashboard();
    }
  });
  
  // Set up audio key events
  setupKeyPressEvents();
  
  // Initialize mission timer when needed
  initializeMissionTimer();
  
  // Add keyframe animation for alien glitch effect if it doesn't exist
  if (!document.getElementById('alienGlitchAnimation')) {
    const alienGlitchStyle = document.createElement('style');
    alienGlitchStyle.id = 'alienGlitchAnimation';
    alienGlitchStyle.textContent = `
      @keyframes alienGlitch {
        0% { transform: translate(0, 0); filter: hue-rotate(0deg); }
        20% { transform: translate(-5px, 2px); filter: hue-rotate(90deg); }
        40% { transform: translate(3px, -5px); filter: hue-rotate(180deg); }
        60% { transform: translate(0, 0); filter: hue-rotate(270deg); }
        80% { transform: translate(5px, 2px); filter: hue-rotate(360deg); }
        100% { transform: translate(0, 0); filter: hue-rotate(0deg); }
      }
    `;
    document.head.appendChild(alienGlitchStyle);
  }
  
  // Pre-load audio for better response
  document.querySelectorAll('audio').forEach(audio => {
    audio.load();
  });

  // Add TV static effect to the body
  addStaticEffect();
});

// Add TV static noise effect for more cinematic feel
function addStaticEffect() {
  if (!document.getElementById('static-overlay')) {
    const staticOverlay = document.createElement('div');
    staticOverlay.id = 'static-overlay';
    staticOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.03;
      z-index: 9997;
      background-image: url('data:image/png;base64,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');
      animation: staticNoise 0.2s infinite;
    `;
    document.body.appendChild(staticOverlay);
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes staticNoise {
        0% { background-position: 0 0; }
        100% { background-position: 100% 100%; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Track cursor for the custom cursor effect
function trackCursor(e) {
  document.documentElement.style.setProperty('--cursor-x', e.clientX + 'px');
  document.documentElement.style.setProperty('--cursor-y', e.clientY + 'px');
  
  // Create trailing effect for the cursor
  const trail = document.createElement('div');
  trail.className = 'cursor-trail';
  trail.style.left = e.clientX + 'px';
  trail.style.top = e.clientY + 'px';
  document.body.appendChild(trail);
  
  setTimeout(() => {
    trail.style.opacity = '0';
    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail);
      }
    }, 200);
  }, 100);
}

// Add a more dramatic transition to dashboard
function transitionToDashboard() {
  const landingPage = document.getElementById('landing-page');
  const dashboard = document.getElementById('alien-dashboard');
  
  // Add enhanced transition effect
  const transitionOverlay = document.createElement('div');
  transitionOverlay.className = 'transition-overlay';
  document.body.appendChild(transitionOverlay);
  
  // Add transition styles if they don't exist
  if (!document.getElementById('transition-styles')) {
    const transitionStyles = document.createElement('style');
    transitionStyles.id = 'transition-styles';
    transitionStyles.textContent = `
      .transition-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #0f0;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        animation: transitionFade 2.5s forwards;
      }
      
      @keyframes transitionFade {
        0% { opacity: 0; }
        25% { opacity: 0.8; }
        50% { opacity: 0; }
        60% { opacity: 0.5; }
        65% { opacity: 0; }
        70% { opacity: 0.3; }
        100% { opacity: 0; }
      }
      
      .cursor-trail {
        position: fixed;
        width: 5px;
        height: 5px;
        background: #0f0;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.6;
        transform: translate(-50%, -50%);
        transition: opacity 0.2s ease-out;
        box-shadow: 0 0 6px #0f0;
      }
      
      .dashboard-reveal {
        animation: revealDashboard 3s forwards;
      }
      
      @keyframes revealDashboard {
        0% { 
          opacity: 0;
          transform: scale(1.1);
          filter: blur(10px) brightness(2);
        }
        100% { 
          opacity: 1;
          transform: scale(1);
          filter: blur(0) brightness(1);
        }
      }
    `;
    document.head.appendChild(transitionStyles);
  }
  
  // Start transition with enhanced glitch effect
  addEnhancedGlitchEffect();
  
  setTimeout(() => {
    // Hide landing page and show dashboard
    landingPage.classList.add('hidden');
    dashboard.classList.remove('hidden');
    dashboard.classList.add('dashboard-reveal');
    
    // Initialize dashboard
    initializeDashboard();
    
    // Remove transition overlay after animation completes
    setTimeout(() => {
      if (transitionOverlay.parentNode) {
        transitionOverlay.parentNode.removeChild(transitionOverlay);
      }
    }, 3000);
    
    // Request fullscreen for immersive experience
    requestFullscreen(document.documentElement);
  }, 1500);
}

// Add enhanced glitch effect for a more alien transition
function addEnhancedGlitchEffect() {
  const glitchOverlay = document.createElement('div');
  glitchOverlay.className = 'glitch-overlay';
  document.body.appendChild(glitchOverlay);
  
  // Add glitch styles
  const glitchStyles = document.createElement('style');
  glitchStyles.textContent = `
    .glitch-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      pointer-events: none;
      z-index: 9998;
      animation: enhancedGlitch 2s forwards;
      mix-blend-mode: difference;
    }
    
    @keyframes enhancedGlitch {
      0% { 
        transform: translate(0);
        filter: hue-rotate(0deg);
        opacity: 0;
      }
      10% { 
        transform: translate(-10px, 5px);
        filter: hue-rotate(90deg) blur(2px);
        opacity: 0.8;
      }
      20% { 
        transform: translate(8px, -7px);
        filter: hue-rotate(180deg) contrast(1.5);
        opacity: 0.6;
      }
      30% { 
        transform: translate(0);
        filter: hue-rotate(0deg);
        opacity: 0.9;
      }
      30.1% { 
        transform: translate(0);
        filter: invert(1);
        opacity: 0.9;
      }
      30.2% { 
        transform: translate(0);
        filter: invert(0);
        opacity: 0.9;
      }
      40% { 
        transform: translate(5px, 8px);
        filter: hue-rotate(-90deg) saturate(1.5); 
        opacity: 0.5;
      }
      50% { 
        transform: translate(-5px, -3px);
        filter: hue-rotate(-180deg) brightness(1.5);
        opacity: 0.7;
      }
      60% { 
        transform: translate(0);
        filter: hue-rotate(0deg);
        opacity: 0.9;
      }
      60.1% { 
        transform: translate(0);
        filter: blur(5px);
        opacity: 0.9;
      }
      60.2% { 
        transform: translate(0);
        filter: blur(0);
        opacity: 0.9;
      }
      70% { 
        transform: translate(-7px, 3px) skew(-5deg);
        filter: hue-rotate(90deg);
        opacity: 0.8; 
      }
      80% { 
        transform: translate(7px, -7px) scale(1.05);
        filter: hue-rotate(180deg) saturate(1.3);
        opacity: 0.6;
      }
      90% { 
        transform: translate(0);
        filter: hue-rotate(0deg);
        opacity: 0.4;
      }
      100% { 
        transform: translate(0);
        filter: hue-rotate(0deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(glitchStyles);
  
  // Create digital distortion sound effect
  const glitchSound = document.createElement('audio');
  glitchSound.volume = 0.2;
  
  // Use oscillator to create digital glitch sound
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.1;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    
    // Modulate the frequency for glitch effect
    let i = 0;
    const glitchInterval = setInterval(() => {
      oscillator.frequency.value = 100 + Math.random() * 900;
      gainNode.gain.value = Math.min(0.2, Math.random() * 0.3);
      i++;
      if (i > 20) {
        clearInterval(glitchInterval);
        oscillator.stop();
      }
    }, 100);
    
  } catch (e) {
    console.error('Web Audio API not supported:', e);
  }
  
  // Remove glitch overlay after animation
  setTimeout(() => {
    if (glitchOverlay.parentNode) {
      glitchOverlay.parentNode.removeChild(glitchOverlay);
    }
    if (glitchStyles.parentNode) {
      glitchStyles.parentNode.removeChild(glitchStyles);
    }
  }, 2000);
}

// Initialize the alien dashboard
function initializeDashboard() {
  // Start mission timer
  startMissionTimer();
  
  // Create transmission wave visualization elements
  createTransmissionWaves();
  
  // Initialize data streams and particles
  initializeDataParticles();
  
  // Create frequency bars for visualizer
  createFrequencyBars();
  
  // Setup scanning beams and interference lines for circles
  setupScanningEffects();
  
  // Add the alien hex pattern background
  createAlienHexPattern();
  
  // Add ambient sound effects for alien atmosphere
  playAmbientSound();
  
  // Add the blip to radar with delay for effect
  setTimeout(() => {
    const blip = document.querySelector('.blip');
    if (blip) {
      blip.style.left = Math.random() * 80 + 10 + '%'; 
      blip.style.top = Math.random() * 80 + 10 + '%';
      blip.classList.remove('hidden');
      
      // Add log entry
      addLogEntry('ALIEN SIGNAL DETECTED', 'incoming');
    }
  }, 3000);
  
  // Add some initial system messages with delays
  setTimeout(() => addLogEntry('ESTABLISHING SECURE CONNECTION...'), 500);
  setTimeout(() => addLogEntry('CONNECTION ESTABLISHED'), 2000);
  setTimeout(() => addLogEntry('SCANNING FOR ALIEN FREQUENCIES...'), 4000);
  
  // Generate random alien coordinate data
  generateAlienCoordinates();
  
  // Add clear log functionality
  document.getElementById('clear-log')?.addEventListener('click', clearTransmissionLog);
  
  // Simulate occasional static interference
  setInterval(() => {
    if (Math.random() > 0.7) {
      simulateInterference();
    }
  }, 8000);
}

// Create alien hex pattern background for more unique UI
function createAlienHexPattern() {
  if (!document.querySelector('.hex-pattern')) {
    const hexPattern = document.createElement('div');
    hexPattern.className = 'hex-pattern';
    document.querySelector('.dashboard-container')?.appendChild(hexPattern);
  }
}

// Play ambient alien technology sound
function playAmbientSound() {
  const ambientSound = document.createElement('audio');
  ambientSound.loop = true;
  ambientSound.volume = 0.1;
  
  // Create a simple oscillator-based ambient sound using Web Audio API
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 50;
    gainNode.gain.value = 0.05;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    
    // Modulate the frequency for alien effect
    setInterval(() => {
      oscillator.frequency.value = 40 + Math.random() * 30;
    }, 2000);
    
    // Store the audio context for later cleanup
    window.alienAudioContext = audioCtx;
  } catch (e) {
    console.error('Web Audio API not supported:', e);
  }
}

// Generate random alien coordinate data
function generateAlienCoordinates() {
  const sectors = ['ZETA', 'ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'OMEGA'];
  const quadrants = ['37B', '42F', '19C', '78A', '53D'];
  
  const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
  const randomQuadrant = quadrants[Math.floor(Math.random() * quadrants.length)];
  
  const coordinates = document.querySelector('.coordinates');
  if (coordinates) {
    coordinates.innerHTML = `SECTOR: ${randomSector}-${Math.floor(Math.random() * 99)} • QUADRANT: ${randomQuadrant}`;
  }
  
  // Set random signal strength
  const signalValue = document.getElementById('signal-value');
  if (signalValue) {
    signalValue.textContent = Math.floor(75 + Math.random() * 20) + '%';
  }
  
  // Set random range value
  const rangeValue = document.getElementById('range-value');
  if (rangeValue) {
    rangeValue.textContent = Math.floor(100 + Math.random() * 900) + ' LY';
  }
}

// Clear transmission log
function clearTransmissionLog() {
  const log = document.querySelector('.transmission-log');
  if (log) {
    log.innerHTML = '';
    addLogEntry('LOG CLEARED', 'system');
  }
}

// Setup scanning beam and interference effects for ellipse/circles
function setupScanningEffects() {
  const circles = document.querySelectorAll('.circle');
  
  circles.forEach(circle => {
    // Add scanning beam to each circle
    const scanningBeam = document.createElement('div');
    scanningBeam.className = 'scanning-beam';
    circle.appendChild(scanningBeam);
    
    // Add interference lines to each circle
    const interferenceLines = document.createElement('div');
    interferenceLines.className = 'interference-lines';
    circle.appendChild(interferenceLines);
  });
}

// Create transmission wave visualization
function createTransmissionWaves() {
  // Get the panels where we'll add the waves
  const transmissionPanel = document.querySelector('.transmission-panel');
  const responsePanel = document.querySelector('.response-panel');
  
  if (transmissionPanel) {
    // Create wave container for transmission
    const waveContainer = document.createElement('div');
    waveContainer.className = 'transmission-wave-container';
    
    // Add transmission wave elements
    for (let i = 0; i < 3; i++) {
      const wave = document.createElement('div');
      wave.className = 'transmission-wave';
      wave.style.animationDelay = `${i * 0.3}s`;
      waveContainer.appendChild(wave);
    }
    
    // Insert before the connection-strength element
    const strengthIndicator = transmissionPanel.querySelector('.connection-strength');
    if (strengthIndicator) {
      transmissionPanel.insertBefore(waveContainer, strengthIndicator);
    } else {
      transmissionPanel.appendChild(waveContainer);
    }
  }
  
  if (responsePanel) {
    // Add data visualization elements to the response panel
    const responseScreen = responsePanel.querySelector('.response-screen');
    
    if (responseScreen) {
      // Add data particles container for alien transmission visualization
      const dataParticles = document.createElement('div');
      dataParticles.className = 'data-particles';
      responseScreen.appendChild(dataParticles);
    }
  }
}

// Initialize data particles for visual effects
function initializeDataParticles() {
  const container = document.querySelector('.data-particles');
  
  if (!container) return;
  
  // Clear existing particles
  container.innerHTML = '';
  
  // Create initial particles
  for (let i = 0; i < 20; i++) {
    createDataParticle(container);
  }
  
  // Continue creating particles at intervals
  setInterval(() => {
    if (document.querySelector('.data-particles')) {
      createDataParticle(document.querySelector('.data-particles'));
    }
  }, 300);
}

// Create an individual data particle
function createDataParticle(container) {
  const particle = document.createElement('div');
  particle.className = 'data-particle';
  
  // Random position
  const xPos = Math.random() * 100;
  particle.style.left = `${xPos}%`;
  
  // Random animation duration
  const duration = 2 + Math.random() * 3;
  particle.style.animationDuration = `${duration}s`;
  
  // Random size
  const size = 1 + Math.random() * 3;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  
  // Random opacity
  particle.style.opacity = 0.4 + Math.random() * 0.6;
  
  // Add to container
  container.appendChild(particle);
  
  // Remove after animation completes
  setTimeout(() => {
    if (particle.parentNode === container) {
      container.removeChild(particle);
    }
  }, duration * 1000);
  
  return particle;
}

// Create frequency bars for audio visualization
function createFrequencyBars() {
  const barContainer = document.createElement('div');
  barContainer.className = 'frequency-bars';
  
  // Create 32 bars
  for (let i = 0; i < 32; i++) {
    const bar = document.createElement('div');
    bar.className = 'freq-bar';
    
    // Set initial random height
    const height = Math.random() * 100;
    bar.style.height = `${height}%`;
    
    // Add to container
    barContainer.appendChild(bar);
    frequencyBars.push(bar);
  }
  
  // Find container for visualization panel
  const waveformContainer = document.querySelector('.waveform-container');
  if (waveformContainer) {
    waveformContainer.appendChild(barContainer);
  }
  
  // Animate bars
  setInterval(animateFrequencyBars, 100);
}

// Simulate interference in the transmission
function simulateInterference() {
  // Add a visual glitch effect to the whole dashboard
  const dashboardContainer = document.querySelector('.dashboard-container');
  
  if (dashboardContainer) {
    // Add glitch class
    dashboardContainer.classList.add('interference');
    
    // Add interference sound
    const staticSound = document.createElement('audio');
    staticSound.volume = 0.2;
    staticSound.src = 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABMYXZmNTguMTMuMTAyAAAAAAAAAAAAAA==';
    document.body.appendChild(staticSound);
    
    const playPromise = staticSound.play();
    if (playPromise) {
      playPromise.catch(e => {
        console.error("Audio play error:", e);
      });
    }
    
    // Log the interference
    addLogEntry('SIGNAL INTERFERENCE DETECTED', 'system');
    
    // Remove after short time
    setTimeout(() => {
      dashboardContainer.classList.remove('interference');
      
      // Remove and clean up audio element
      setTimeout(() => {
        if (staticSound.parentNode) {
          staticSound.parentNode.removeChild(staticSound);
        }
      }, 500);
    }, 500);
  }
}

// Start mission timer
function startMissionTimer() {
  let seconds = 0;
  const timerElement = document.getElementById('mission-timer');
  
  if (timerElement) {
    missionTimeInterval = setInterval(() => {
      seconds++;
      const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      timerElement.textContent = `${hours}:${mins}:${secs}`;
    }, 1000);
  }
}

// Initialize mission timer
function initializeMissionTimer() {
  const timerElement = document.getElementById('mission-timer');
  if (timerElement) {
    timerElement.textContent = '00:00:00';
  }
}

// Request fullscreen mode
function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen().catch(err => {
      // Silently handle errors, as some browsers may block this without user interaction
    });
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen().catch(err => {});
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen().catch(err => {});
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen().catch(err => {});
  }
}

// Set up key press events for the sound buttons
function setupKeyPressEvents() {
  const keys = ['B', 'C', 'D', 'E', 'F'];
  const keyCodes = { 'B': 66, 'C': 67, 'D': 68, 'E': 69, 'F': 70 };
  
  document.addEventListener('keydown', (e) => {
    const keyCode = e.keyCode || e.which;
    
    // Check if the pressed key is one of our target keys
    if (keys.includes(String.fromCharCode(keyCode))) {
      const key = String.fromCharCode(keyCode);
      
      console.log(`Key pressed: ${key}, keyCode: ${keyCode}`); // Debug log
      
      // Play the corresponding sound
      playSound(keyCode);
      
      // Visual feedback for key press
      showKeyPressEffect(key);
      
      // Visual feedback in the UI
      highlightKey(keyCode);
      
      // Show alien response with delay
      scheduleAlienResponse();
      
      // Add log entry
      addLogEntry(`TRANSMITTING TONE ${key}`, 'outgoing');

      // Add transmission wave effect
      activateTransmission();

      // Create ripple effect on waves
      createTransmissionRipple();
    }
  });
  
  // Add click handlers to keys in the UI
  document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
      const keyChar = key.textContent;
      const keyCode = keyCodes[keyChar];
      
      console.log(`Key clicked: ${keyChar}, keyCode: ${keyCode}`); // Debug log
      
      // Play sound and trigger effects
      playSound(keyCode);
      showKeyPressEffect(keyChar);
      highlightKey(keyCode);
      scheduleAlienResponse();
      addLogEntry(`TRANSMITTING TONE ${keyChar}`, 'outgoing');
      activateTransmission();
      createTransmissionRipple();
    });
  });
}

// Create ripple effect on waves to visualize transmission
function createTransmissionRipple() {
  // Find a random wave element to add the ripple effect
  const waves = document.querySelectorAll('.wave');
  
  if (waves.length > 0) {
    // Choose a random wave
    const randomIndex = Math.floor(Math.random() * waves.length);
    const wave = waves[randomIndex];
    
    // Add transmitting class for ripple effect
    wave.classList.add('transmitting');
    wave.classList.add('focus');
    
    // Remove classes after animation
    setTimeout(() => {
      wave.classList.remove('transmitting');
      wave.classList.remove('focus');
    }, 2000);
  }
}

// Activate transmission effects
function activateTransmission() {
  // Set flag
  transmissionActive = true;
  
  // Make meter levels more active
  const meterLevels = document.querySelectorAll('.meter-level');
  meterLevels.forEach(meter => {
    const randomLevel = Math.floor(Math.random() * 60) + 40; // 40-100%
    meter.style.transition = 'width 0.1s ease-in';
    meter.style.width = `${randomLevel}%`;
  });
  
  // Make strength bars active
  const strengthBars = document.querySelectorAll('.strength-bar');
  let activeCount = Math.floor(Math.random() * 3) + 3; // 3-5 active bars
  
  strengthBars.forEach((bar, index) => {
    if (index < activeCount) {
      bar.classList.add('active');
    }
  });
  
  // Reset transmission after delay
  setTimeout(() => {
    transmissionActive = false;
    
    // Reset meters
    meterLevels.forEach(meter => {
      meter.style.transition = 'width 2s ease-out';
      meter.style.width = '20%';
    });
    
    // Remove active from strength bars
    setTimeout(() => {
      strengthBars.forEach(bar => {
        bar.classList.remove('active');
      });
    }, 1000);
  }, 3000);
}

// Animate frequency bars for visualization
function animateFrequencyBars() {
  if (!frequencyBars.length) return;
  
  frequencyBars.forEach(bar => {
    // More dramatic movement when transmission is active
    let maxHeight = transmissionActive ? 100 : 40;
    let minHeight = transmissionActive ? 30 : 5;
    
    const height = Math.random() * (maxHeight - minHeight) + minHeight;
    bar.style.height = `${height}%`;
    
    // Adjust opacity based on height
    const opacity = 0.4 + (height / 100) * 0.6;
    bar.style.opacity = opacity;
  });
}

// Play sound for a specific key
function playSound(keyCode) {
  // Using ID selector for better compatibility
  let audio;
  
  // Match the audio element with the correct ID
  switch(keyCode) {
    case 66: // B
      audio = document.getElementById('audioB');
      break;
    case 67: // C
      audio = document.getElementById('audioC');
      break;
    case 68: // D
      audio = document.getElementById('audioD');
      break;
    case 69: // E
      audio = document.getElementById('audioE');
      break;
    case 70: // F
      audio = document.getElementById('audioF');
      break;
  }
  
  console.log(`Playing audio for keyCode ${keyCode}`, audio); // Debug log
  
  if (audio) {
    // Create a clone to allow overlapping sounds
    const soundClone = audio.cloneNode(true);
    soundClone.volume = 1.0;
    
    // Play the sound
    const playPromise = soundClone.play();
    if (playPromise) {
      playPromise.catch(e => {
        console.error("Audio play error:", e);
      });
    }
    
    // Remove clone after playing
    soundClone.addEventListener('ended', function() {
      this.remove();
    });
    
    // Visualize the sound
    animateFrequencyMeters();
  }
}

// Animate the frequency meters when a sound plays
function animateFrequencyMeters() {
  document.querySelectorAll('.meter-level').forEach(meter => {
    const randomLevel = Math.floor(Math.random() * 80) + 20; // 20-100%
    meter.style.transition = 'width 0.1s ease-in';
    meter.style.width = `${randomLevel}%`;
    
    // Reset after animation
    setTimeout(() => {
      meter.style.transition = 'width 2s ease-out';
      meter.style.width = '20%';
    }, 300);
  });
}

// Highlight a pressed key in the UI
function highlightKey(keyCode) {
  const key = document.querySelector(`.key[data-key="${keyCode}"]`);
  
  if (key) {
    key.classList.add('pressed');
    
    setTimeout(() => {
      key.classList.remove('pressed');
    }, 300);
  }
}

// Updated key press effect with more alien aesthetics
function showKeyPressEffect(key) {
  const effect = document.createElement('div');
  effect.className = 'key-press-effect';
  effect.textContent = key;
  
  // Add alien symbols around the key
  const symbolsContainer = document.createElement('div');
  symbolsContainer.className = 'alien-symbols';
  
  for (let i = 0; i < 6; i++) {
    const symbol = document.createElement('div');
    symbol.className = 'alien-symbol';
    symbol.style.transform = `rotate(${i * 60}deg) translateY(-40px)`;
    symbolsContainer.appendChild(symbol);
  }
  
  effect.appendChild(symbolsContainer);
  document.body.appendChild(effect);
  
  // Add styles for alien symbols if they don't exist
  if (!document.getElementById('alien-symbol-styles')) {
    const symbolStyles = document.createElement('style');
    symbolStyles.id = 'alien-symbol-styles';
    symbolStyles.textContent = `
      .key-press-effect {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 8rem;
        color: #0f0;
        text-shadow: 0 0 20px #0f0, 0 0 40px rgba(0, 255, 0, 0.7);
        opacity: 0;
        z-index: 100;
        pointer-events: none;
        animation: keyPressEffect 1.2s forwards;
      }
      
      @keyframes keyPressEffect {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(0deg); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2) rotate(-5deg); }
        40% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
        60% { transform: translate(-50%, -50%) scale(1) rotate(-3deg); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(0.9) rotate(0deg); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(0deg); }
      }
      
      .alien-symbols {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        animation: symbolsRotate 1s linear;
      }
      
      .alien-symbol {
        position: absolute;
        width: 15px;
        height: 15px;
        top: 50%;
        left: 50%;
        background-color: #0f0;
        border-radius: 50%;
        transform-origin: center center;
        animation: symbolPulse 0.5s infinite alternate;
        box-shadow: 0 0 10px #0f0;
      }
      
      @keyframes symbolsRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes symbolPulse {
        0% { opacity: 0.4; transform: scale(0.8); }
        100% { opacity: 0.9; transform: scale(1.2); }
      }
    `;
    document.head.appendChild(symbolStyles);
  }
  
  // Remove the effect element when animation completes
  setTimeout(() => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect);
    }
  }, 1200);
}

// Schedule alien response to appear
function scheduleAlienResponse() {
  // Clear any existing timeout
  if (alienResponseTimeout) {
    clearTimeout(alienResponseTimeout);
  }
  
  // Schedule new response
  alienResponseTimeout = setTimeout(() => {
    showAlienResponse();
  }, 2000);
}

// Show alien response with enhanced effects
function showAlienResponse() {
  const placeholder = document.querySelector('.response-placeholder');
  const responseImage = document.querySelector('.response-image');
  const image = document.getElementById('receivedImage');
  
  console.log("Showing alien response", { placeholder, responseImage, image }); // Debug log
  
  if (placeholder && responseImage && image) {
    // Set a specific alien image (using the space.jpg as fallback)
    image.src = 'assets/space.jpg';
    
    // Add more dramatic effects for the response with glitch overlays
    const glitchOverlay = document.createElement('div');
    glitchOverlay.className = 'image-glitch-overlay';
    responseImage.appendChild(glitchOverlay);
    
    // Add glitch styles if they don't exist
    if (!document.getElementById('glitch-styles')) {
      const glitchStyles = document.createElement('style');
      glitchStyles.id = 'glitch-styles';
      glitchStyles.textContent = `
        .image-glitch-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          mix-blend-mode: difference;
          z-index: 15;
          pointer-events: none;
          animation: imageGlitch 1s ease-in-out;
        }
        
        @keyframes imageGlitch {
          0%, 100% { 
            transform: translate(0);
            opacity: 0;
          }
          20% { 
            transform: translate(-10px, 5px) skew(-10deg, 5deg);
            opacity: 0.4;
          }
          40% { 
            transform: translate(10px, -5px) skew(10deg, -5deg);
            opacity: 0.2;
          }
          60% { 
            transform: translate(-5px, 2px) skew(5deg, -2deg);
            opacity: 0.6;
          }
          80% { 
            transform: translate(5px, -2px) skew(-5deg, 2deg);
            opacity: 0.3;
          }
        }
        
        .interference {
          animation: dashboardGlitch 0.5s ease-in-out;
        }
        
        @keyframes dashboardGlitch {
          0%, 100% {
            transform: translate(0);
            filter: brightness(1) contrast(1);
          }
          25% {
            transform: translate(-5px, 2px);
            filter: brightness(1.2) contrast(1.5) hue-rotate(30deg);
          }
          50% {
            transform: translate(5px, -2px);
            filter: brightness(0.8) contrast(0.9) hue-rotate(-30deg);
          }
          75% {
            transform: translate(-3px, -3px);
            filter: brightness(1.1) contrast(1.2) hue-rotate(15deg);
          }
        }
        
        /* Add active style for strength bars */
        .strength-bar.active {
          background-color: #0f0;
          box-shadow: 0 0 10px #0f0;
          animation: barPulse 1s infinite alternate;
        }
        
        @keyframes barPulse {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(glitchStyles);
    }
    
    // Hide placeholder
    placeholder.classList.add('hidden');
    
    // Show image response with glitch effect
    responseImage.classList.remove('hidden');
    image.style.animation = 'alienGlitch 0.5s ease-in-out';
    
    // Add log entry
    addLogEntry('RECEIVING ALIEN TRANSMISSION', 'incoming');
    
    // Add data particles burst
    const particles = document.querySelector('.data-particles');
    if (particles) {
      // Create more particles for the transmission event
      for (let i = 0; i < 30; i++) {
        createDataParticle(particles);
      }
    }
    
    // Reset image animation and remove glitch overlay after it completes
    setTimeout(() => {
      image.style.animation = '';
      if (glitchOverlay.parentNode) {
        glitchOverlay.parentNode.removeChild(glitchOverlay);
      }
    }, 1000);
    
    // Briefly show a blip on radar
    showRadarBlip();
  }
}

// Show a random blip on the radar with enhanced ping effect
function showRadarBlip() {
  const blip = document.querySelector('.blip');
  if (blip) {
    // Position the blip randomly
    blip.style.left = Math.random() * 80 + 10 + '%';
    blip.style.top = Math.random() * 80 + 10 + '%';
    
    // Add ping effect
    const ping = document.createElement('div');
    ping.className = 'radar-ping';
    ping.style.left = blip.style.left;
    ping.style.top = blip.style.top;
    
    // Add ping styles
    if (!document.getElementById('ping-styles')) {
      const pingStyles = document.createElement('style');
      pingStyles.id = 'ping-styles';
      pingStyles.textContent = `
        .radar-ping {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: transparent;
          border: 2px solid #0f0;
          transform: translate(-50%, -50%);
          animation: pingExpand 2s ease-out;
          pointer-events: none;
        }
        
        @keyframes pingExpand {
          0% {
            width: 10px;
            height: 10px;
            opacity: 1;
          }
          100% {
            width: 80px;
            height: 80px;
            opacity: 0;
            border-width: 1px;
          }
        }
      `;
      document.head.appendChild(pingStyles);
    }
    
    // Add to radar screen
    const radarScreen = document.querySelector('.radar-screen');
    if (radarScreen) {
      radarScreen.appendChild(ping);
    }
    
    // Ensure blip is visible with enhanced effect
    blip.classList.remove('hidden');
    blip.style.animation = 'blipPulse 0.5s infinite alternate';
    
    // Remove ping after animation finishes
    setTimeout(() => {
      if (ping.parentNode) {
        ping.parentNode.removeChild(ping);
      }
      blip.style.animation = '';
    }, 2000);
    
    // Hide blip again after some time
    setTimeout(() => {
      blip.classList.add('hidden');
    }, 4000);
  }
}

// Add log entry to transmission log
function addLogEntry(message, type = 'system') {
  const log = document.querySelector('.transmission-log');
  
  if (log) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    // Add timestamp
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    entry.textContent = `[${timestamp}] ${message}`;
    
    // Add to log
    log.appendChild(entry);
    
    // Auto-scroll to bottom
    log.scrollTop = log.scrollHeight;
  }
}

// Clean up intervals when page unloads
window.addEventListener('beforeunload', function() {
  if (missionTimeInterval) {
    clearInterval(missionTimeInterval);
  }
  
  if (alienResponseTimeout) {
    clearTimeout(alienResponseTimeout);
  }
  
  if (window.alienAudioContext) {
    window.alienAudioContext.close();
  }
});

