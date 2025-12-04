<template>
  <div class="saturn-container" ref="containerRef">
    <div class="ui-overlay">
      <div class="controls">
        <div class="control-group">
          <label for="scale">缩放 (Scale): {{ scale.toFixed(2) }}</label>
          <input type="range" id="scale" min="0.5" max="15" step="0.1" v-model.number="scale">
        </div>
        <div class="control-group">
          <label for="diffusion">扩散 (Chaos): {{ diffusion.toFixed(2) }}</label>
          <input type="range" id="diffusion" min="0" max="1" step="0.01" v-model.number="diffusion">
        </div>
      </div>
      <button class="fullscreen-btn" @click="toggleFullscreen">
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';

const containerRef = ref(null);
const scale = ref(1.0);
const diffusion = ref(0.0);
const isFullscreen = ref(false);

let scene, camera, renderer, particlesCore, particlesRing;
let ringOriginalPositions, ringVelocities;
const clock = new THREE.Clock();

onMounted(() => {
  init();
  animate();
});

onUnmounted(() => {
  // Cleanup
  window.removeEventListener('resize', handleResize);
  renderer.dispose();
  particlesCore.geometry.dispose();
  particlesCore.material.dispose();
  particlesRing.geometry.dispose();
  particlesRing.material.dispose();
});

function init() {
  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 25;
  camera.position.y = 10;
  camera.lookAt(scene.position);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  containerRef.value.appendChild(renderer.domElement);
  
  // Particles - Core
  const coreCount = 50000;
  const corePositions = new Float32Array(coreCount * 3);
  for (let i = 0; i < coreCount; i++) {
    const r = Math.random() * 4.0;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    corePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    corePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    corePositions[i * 3 + 2] = r * Math.cos(phi);
  }
  const coreGeometry = new THREE.BufferGeometry();
  coreGeometry.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
  const coreMaterial = new THREE.PointsMaterial({
    color: 0xffddaa,
    size: 0.08,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.8
  });
  particlesCore = new THREE.Points(coreGeometry, coreMaterial);
  scene.add(particlesCore);

  // Particles - Ring
  const ringCount = 100000;
  const ringPositions = new Float32Array(ringCount * 3);
  ringVelocities = new Float32Array(ringCount);
  ringOriginalPositions = new Float32Array(ringCount * 3);
  
  const innerRadius = 8;
  const outerRadius = 14;
  for (let i = 0; i < ringCount; i++) {
    const radius = Math.sqrt(Math.random()) * (outerRadius - innerRadius) + innerRadius;
    const theta = Math.random() * 2 * Math.PI;
    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    const y = (Math.random() - 0.5) * 0.2; // slight vertical deviation

    ringPositions[i * 3] = x;
    ringPositions[i * 3 + 1] = y;
    ringPositions[i * 3 + 2] = z;
    
    // Kepler's Law: velocity inversely proportional to sqrt of radius
    const keplerConstant = 8; // tweaked for visual speed
    ringVelocities[i] = keplerConstant / Math.sqrt(radius);

    ringOriginalPositions[i*3] = x;
    ringOriginalPositions[i*3+1] = y;
    ringOriginalPositions[i*3+2] = z;
  }
  const ringGeometry = new THREE.BufferGeometry();
  ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
  const ringMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.07,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.6
  });
  particlesRing = new THREE.Points(ringGeometry, ringMaterial);
  particlesRing.rotation.x = -0.2; // Tilt the rings
  scene.add(particlesRing);
  
  // Event Listeners
  window.addEventListener('resize', handleResize);
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // Animate Core
  particlesCore.rotation.y += 0.0005;

  // Animate Ring
  const positions = particlesRing.geometry.attributes.position.array;
  const chaosThreshold = 18; // Distance from center to start applying chaos
  const chaosStrength = 40; // Multiplier for chaos effect

  for (let i = 0; i < positions.length / 3; i++) {
    const i3 = i * 3;
    const radius = Math.sqrt(ringOriginalPositions[i3]**2 + ringOriginalPositions[i3+2]**2);
    
    // Check for chaos effect
    if (radius * scale.value > chaosThreshold && diffusion.value > 0) {
        const chaosFactor = Math.pow(diffusion.value, 2) * chaosStrength * deltaTime;
        positions[i3] += (Math.random() - 0.5) * chaosFactor;
        positions[i3 + 1] += (Math.random() - 0.5) * chaosFactor;
        positions[i3 + 2] += (Math.random() - 0.5) * chaosFactor;
    } else {
        const angleOffset = deltaTime * ringVelocities[i];
        const currentAngle = Math.atan2(positions[i3 + 2], positions[i3]);
        const newAngle = currentAngle + angleOffset;
        
        positions[i3] = radius * Math.cos(newAngle);
        positions[i3 + 2] = radius * Math.sin(newAngle);
        // Slowly return to original y
        positions[i3 + 1] += (ringOriginalPositions[i3 + 1] - positions[i3 + 1]) * 0.01;
    }
  }
  particlesRing.geometry.attributes.position.needsUpdate = true;
  
  renderer.render(scene, camera);
}

watch(scale, (newScale) => {
    const scaleVec = new THREE.Vector3(newScale, newScale, newScale);
    particlesCore.scale.copy(scaleVec);
    particlesRing.scale.copy(scaleVec);
    
    // Brightness control
    const coreMat = particlesCore.material;
    const ringMat = particlesRing.material;
    
    coreMat.opacity = THREE.MathUtils.clamp(0.4 + (newScale - 0.5) / 14.5 * 0.6, 0, 1);
    ringMat.opacity = THREE.MathUtils.clamp(0.3 + (newScale - 0.5) / 14.5 * 0.7, 0, 1);
});

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      isFullscreen.value = false;
    }
  }
}

// Handle fullscreen change (e.g., user pressing Esc)
document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
});

</script>

<style scoped>
.saturn-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background-color: #000;
}

canvas {
  display: block;
}

.ui-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
  font-family: sans-serif;
}

.controls {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 15px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: white;
  min-width: 220px;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.control-group label {
  margin-bottom: 5px;
  font-size: 14px;
}

input[type="range"] {
  width: 100%;
  cursor: pointer;
}

.fullscreen-btn {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: 1px solid white;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.fullscreen-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>