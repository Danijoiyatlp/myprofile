/* ============================================================
   PORTFOLIO - Main Application Script
   ============================================================
   Handles:
   1. Dark / Light theme toggle (with localStorage persistence)
   2. Tab navigation with smooth switching
   3. Skill bar animations (triggered on tab open)
   4. Timeline scroll animations
   5. Intersection Observer for reveal-on-scroll
   ============================================================ */

(function () {
  'use strict';

  // =====================================================
  //  1. THEME TOGGLE
  // =====================================================
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  /** Load saved theme (or default to dark) */
  function loadTheme() {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light') {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
  }

  /** Toggle between dark and light */
  function toggleTheme() {
    html.classList.toggle('dark');
    const mode = html.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('portfolio-theme', mode);
  }

  themeToggle.addEventListener('click', toggleTheme);
  loadTheme();

  // =====================================================
  //  2. TAB NAVIGATION
  // =====================================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels  = document.querySelectorAll('.tab-panel');

  /**
   * Switch to a given tab by name.
   * Handles panel show/hide and triggers animations.
   */
  function switchTab(tabName) {
    // Deactivate all tabs & panels
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    // Activate selected tab button
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    // Activate selected panel
    const activePanel = document.getElementById(`panel-${tabName}`);
    if (activePanel) {
      activePanel.classList.add('active');

      // Trigger section-specific animations
      if (tabName === 'skills')     animateSkillBars(activePanel);
      if (tabName === 'education')  animateTimeline(activePanel);
      if (tabName === 'experience') animateTimeline(activePanel);
    }
  }

  // Add click handlers to each tab button
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // =====================================================
  //  3. SKILL BAR ANIMATIONS
  // =====================================================

  /**
   * Animate skill bars to their data-level percentage.
   * Also staggers the .skill-item visibility.
   */
  function animateSkillBars(panel) {
    const items = panel.querySelectorAll('.skill-item');
    const bars  = panel.querySelectorAll('.skill-bar');

    // Reset first
    items.forEach(item => item.classList.remove('visible'));
    bars.forEach(bar  => bar.style.width = '0');

    // Stagger skill items
    items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, i * 120);
    });

    // Animate bars after items appear
    bars.forEach((bar, i) => {
      const level = bar.getAttribute('data-level');
      setTimeout(() => {
        bar.style.width = level + '%';
        bar.classList.add('animated');
      }, 300 + i * 150);
    });
  }

  // =====================================================
  //  4. TIMELINE ANIMATIONS
  // =====================================================

  /**
   * Stagger-reveal timeline items within a panel.
   */
  function animateTimeline(panel) {
    const items = panel.querySelectorAll('.timeline-item');
    items.forEach(item => item.classList.remove('visible'));

    items.forEach((item, i) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, i * 200);
    });
  }

  // =====================================================
  //  5. INITIAL ANIMATIONS (on page load)
  // =====================================================
  document.addEventListener('DOMContentLoaded', () => {
    // The first tab (About/Personal) is already active via HTML.
    // No extra init needed unless you want entrance animations there too.

    // Optional: Add keyboard navigation for tabs (arrow keys)
    document.addEventListener('keydown', (e) => {
      const nav = document.getElementById('tab-nav');
      if (!nav.contains(document.activeElement)) return;

      const tabs = Array.from(tabButtons);
      const current = tabs.indexOf(document.activeElement);
      let next = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (current + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (current - 1 + tabs.length) % tabs.length;
      }

      if (next !== -1) {
        e.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      }
    });
  });

  // =====================================================
  //  6. SMOOTH SCROLL FROM HERO TO CONTENT
  // =====================================================
  // The bounce arrow in the hero section scrolls to content
  const scrollArrow = document.querySelector('.animate-bounce');
  if (scrollArrow) {
    scrollArrow.style.cursor = 'pointer';
    scrollArrow.addEventListener('click', () => {
      document.getElementById('content').scrollIntoView({ behavior: 'smooth' });
    });
  }

})();
