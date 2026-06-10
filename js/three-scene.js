/* ============================================================
   THREE.JS - Animated 3D Background Scene
   ============================================================
   Creates a subtle floating particle field with connected lines
   that responds to mouse movement. Lightweight and performant.
   ============================================================ */

(function () {
  'use strict';

  // ---- Configuration (edit these to change the effect) ----
  const CONFIG = {
    particleCount: 80,        // Number of floating particles
    particleSize: 2,          // Size of each particle
    connectionDistance: 150,   // Max distance to draw lines between particles
    particleColor: 0x6366f1,  // Indigo (matches accent color)
    lineColor: 0x6366f1,      // Line color
    lineOpacity: 0.08,        // Line transparency
    particleOpacity: 0.4,     // Particle transparency
    mouseInfluence: 50,       // How much mouse moves the camera
    rotationSpeed: 0.0003,    // Auto-rotation speed
  };

  let scene, camera, renderer;
  let particles, particleGeometry;
  let lineGeometry, lineMaterial, lines;
  let mouse = { x: 0, y: 0 };
  let animationId;

  // ---- Initialize Scene ----
  function init() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 300;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,        // Transparent background
      antialias: false,    // Better performance
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ---- Create Particles ----
    particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const velocities = [];

    for (let i = 0; i < CONFIG.particleCount; i++) {
      // Random positions in a cube
      positions[i * 3]     = (Math.random() - 0.5) * 500;  // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 500;  // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 500;  // z

      // Random velocities for floating effect
      velocities.push({
        x: (Math.random() - 0.5) * 0.3,
        y: (Math.random() - 0.5) * 0.3,
        z: (Math.random() - 0.5) * 0.3,
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle material
    const particleMaterial = new THREE.PointsMaterial({
      color: CONFIG.particleColor,
      size: CONFIG.particleSize,
      transparent: true,
      opacity: CONFIG.particleOpacity,
      sizeAttenuation: true,
    });

    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // ---- Create Connection Lines ----
    lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(CONFIG.particleCount * CONFIG.particleCount * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setDrawRange(0, 0);

    lineMaterial = new THREE.LineBasicMaterial({
      color: CONFIG.lineColor,
      transparent: true,
      opacity: CONFIG.lineOpacity,
    });

    lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Store velocities on window for animation loop access
    window.__particleVelocities = velocities;

    // ---- Event Listeners ----
    window.addEventListener('resize', onResize, false);
    document.addEventListener('mousemove', onMouseMove, false);

    // Start animation
    animate();
  }

  // ---- Animation Loop ----
  function animate() {
    animationId = requestAnimationFrame(animate);

    const positions = particleGeometry.attributes.position.array;
    const velocities = window.__particleVelocities;
    let lineIndex = 0;
    const linePositions = lineGeometry.attributes.position.array;

    // Update particle positions (floating motion)
    for (let i = 0; i < CONFIG.particleCount; i++) {
      positions[i * 3]     += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;

      // Bounce off boundaries
      for (let axis = 0; axis < 3; axis++) {
        if (Math.abs(positions[i * 3 + axis]) > 250) {
          velocities[i][['x', 'y', 'z'][axis]] *= -1;
        }
      }
    }

    // Update connection lines
    for (let i = 0; i < CONFIG.particleCount; i++) {
      for (let j = i + 1; j < CONFIG.particleCount; j++) {
        const dx = positions[i * 3]     - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONFIG.connectionDistance) {
          linePositions[lineIndex++] = positions[i * 3];
          linePositions[lineIndex++] = positions[i * 3 + 1];
          linePositions[lineIndex++] = positions[i * 3 + 2];
          linePositions[lineIndex++] = positions[j * 3];
          linePositions[lineIndex++] = positions[j * 3 + 1];
          linePositions[lineIndex++] = positions[j * 3 + 2];
        }
      }
    }

    lineGeometry.setDrawRange(0, lineIndex / 3);
    lineGeometry.attributes.position.needsUpdate = true;
    particleGeometry.attributes.position.needsUpdate = true;

    // Subtle auto-rotation
    particles.rotation.y += CONFIG.rotationSpeed;
    lines.rotation.y += CONFIG.rotationSpeed;

    // Mouse parallax effect
    camera.position.x += (mouse.x * CONFIG.mouseInfluence - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * CONFIG.mouseInfluence - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  // ---- Resize Handler ----
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ---- Mouse Move Handler ----
  function onMouseMove(event) {
    // Normalize to -1 to 1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
  }

  // ---- Cleanup (if ever needed) ----
  window.__destroyThreeScene = function () {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('mousemove', onMouseMove);
    renderer.dispose();
    particleGeometry.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();
  };

  // ---- Init on DOM ready ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
