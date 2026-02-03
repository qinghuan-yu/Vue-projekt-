<template>
  <div class="contact-page">
    
    <!-- Interaction Layer -->
    <div class="content-layer">
      <!-- Title Appears First -->
      <div class="header-area stagger-item" style="--i: 1;">
         <h2>CONTACT CHANNELS</h2>
         <div class="sub-line">COMM_MODULE // ACTIVE</div>
      </div>

      <!-- Invisible Click Areas for 3 Icons -->
      <!-- Adjusted to match particle positions in useAdvancedParticles (Left, Center, Right) -->
      <div class="click-zones">
         <a href="https://music.163.com/#/artist?id=100570638" target="_blank" class="zone-item stagger-item" style="--i: 3;">
            <div class="zone-label">MUSIC</div>
            <div class="zone-sub">MUSIC163</div>
         </a>
         
         <a href="mailto:Reliarc.me@outlook.com" class="zone-item stagger-item" style="--i: 4;">
            <div class="zone-label">MAIL</div>
            <div class="zone-sub">Reliarc.me@outlook.com</div>
         </a>
         
         <a href="https://github.com/qinghuan-yu" target="_blank" class="zone-item stagger-item" style="--i: 5;">
            <div class="zone-label">GITHUB</div>
            <div class="zone-sub">Source Code</div>
         </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    const container = document.querySelector('.contact-page');
    if(container) {
        // Trigger generic animation class
        setTimeout(() => container.classList.add('animate-entry'), 100);
    }
});
</script>

<style scoped>
/* Page exit stagger animation */
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.contact-page.animate-entry .stagger-item {
  opacity: 1;
  transform: translateY(0);
  transition-delay: calc(var(--i) * 0.15s);
}

.contact-page.page-leaving .stagger-item {
  opacity: 0;
  transform: translateY(-30px);
  transition-delay: 0s;
}

.contact-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: transparent; 
  font-family: 'Space Grotesk', sans-serif; /* Unified Font */
}

/* Moved content-layer definition here for clarity */
.content-layer {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.header-area {
  position: absolute;
  top: 15%;
  width: 100%;
  text-align: center;
  color: white;
}

.header-area h2 {
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.1em;
}

.sub-line {
  font-family: 'Space Grotesk', monospace;
  color: #22d3ee;
  margin-top: 12px;
}

.click-zones {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15rem; 
  pointer-events: auto;
  width: 100%;
}

.zone-item {
  width: 200px;
  height: 300px; /* Increased height to encompass icon area + text below */
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Text at bottom */
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  padding-bottom: 2rem;
  transition: opacity 0.3s;
}

.zone-item:hover .zone-label {
  color: #22d3ee;
  transform: scale(1.1);
}

.zone-label {
  color: white;
  font-weight: bold;
  font-size: 24px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.zone-sub {
  color: rgba(255,255,255,0.5);
  font-size: 12px;
  font-family: 'Space Grotesk', monospace; 
}

/* Response to mobile */
@media (max-width: 768px) {
  .click-zones {
    flex-direction: column;
    gap: 8rem;
  }
}
</style>
