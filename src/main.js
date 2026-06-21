import './style.css';
import trigTopic from './topics/trigonometric_functions.js';
import diffTopic from './topics/differential_equations.js';
import intTopic from './topics/integrals.js';
import polarTopic from './topics/polar_coordinates.js';
import normTopic from './topics/normal_distribution.js';

// Topic Map
const topics = {
  trig: trigTopic,
  diff: diffTopic,
  int: intTopic,
  polar: polarTopic,
  norm: normTopic
};

let activeTopicKey = 'trig';
let currentCleanup = null;

// DOM Elements
const topicTitle = document.getElementById('topic-title');
const topicSubtitle = document.getElementById('topic-subtitle');
const elifContent = document.getElementById('topic-elif-content');
const visualizerContainer = document.getElementById('visualizer-container');
const visualizerControls = document.getElementById('visualizer-controls');
const formulaContent = document.getElementById('topic-formula-content');
const formulaToggle = document.getElementById('formula-toggle');
const formulaWrapper = document.getElementById('formula-wrapper');
const mobileToggle = document.getElementById('mobile-toggle');
const sidebar = document.querySelector('.sidebar');

// Create Overlay for Mobile
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

// Mobile Nav Logic
function toggleMobileNav() {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

mobileToggle.addEventListener('click', toggleMobileNav);
overlay.addEventListener('click', toggleMobileNav);

// Formula Toggle Logic
formulaToggle.addEventListener('click', () => {
  const isOpen = formulaToggle.classList.toggle('open');
  formulaWrapper.classList.toggle('open');
  
  if (isOpen) {
    renderKaTeX(formulaContent);
  }
});

// Reset Formula Drawer
function resetFormulaDrawer() {
  formulaToggle.classList.remove('open');
  formulaWrapper.classList.remove('open');
}

// Render KaTeX markup inside a container
function renderKaTeX(container) {
  if (!window.katex) {
    console.warn('KaTeX not loaded yet.');
    return;
  }
  const mathElements = container.querySelectorAll('[data-math]');
  mathElements.forEach(el => {
    const expression = el.getAttribute('data-math');
    const displayMode = el.getAttribute('data-display') !== 'inline';
    try {
      window.katex.render(expression, el, {
        displayMode: displayMode,
        throwOnError: false
      });
    } catch (err) {
      el.textContent = expression;
      console.error('KaTeX rendering error:', err);
    }
  });
}

// Load Topic Content
function loadTopic(topicKey) {
  // Clean up previous topic visualizer if any
  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  const topic = topics[topicKey];
  if (!topic) return;

  activeTopicKey = topicKey;

  // Update layout contents
  topicTitle.textContent = topic.title;
  topicSubtitle.textContent = topic.subtitle;
  elifContent.innerHTML = topic.elif;
  formulaContent.innerHTML = topic.formula;

  // Clear previous visualizer elements
  visualizerContainer.innerHTML = '';
  visualizerControls.innerHTML = '';

  // Reset the formula drawer
  resetFormulaDrawer();

  // Initialize new visualizer
  currentCleanup = topic.initVisualizer(visualizerContainer, visualizerControls);

  // Set active class on buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-topic') === topicKey) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Smooth scroll main content to top on mobile
  if (window.innerWidth <= 1024) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Hook up Navigation Button Listeners
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const topicKey = btn.getAttribute('data-topic');
    if (topicKey && topicKey !== activeTopicKey) {
      loadTopic(topicKey);
    }
  });
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  loadTopic('trig');
});
