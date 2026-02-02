<template>
  <div class="contact-page">
    
    <!-- Interaction Layer -->
    <div class="content-layer">
      <div class="header-area page-exit-item" style="--exit-order: 0;">
         <h2>CONTACT CHANNELS</h2>
         <div class="sub-line">COMM_MODULE // ACTIVE</div>
      </div>

      <!-- Invisible Click Areas for 3 Icons -->
      <!-- Adjusted to match particle positions in useAdvancedParticles (Left, Center, Right) -->
      <div class="click-zones">
         <a href="https://music.163.com/#/artist?id=100570638" target="_blank" class="zone-item page-exit-item" style="--exit-order: 1;">
            <div class="zone-label">MUSIC</div>
            <div class="zone-sub">MUSIC163</div>
         </a>
         
         <a href="mailto:Reliarc.me@outlook.com" class="zone-item page-exit-item" style="--exit-order: 2;">
            <div class="zone-label">MAIL</div>
            <div class="zone-sub">Reliarc.me@outlook.com</div>
         </a>
         
         <a href="https://github.com/qinghuan-yu" target="_blank" class="zone-item page-exit-item" style="--exit-order: 3;">
            <div class="zone-label">GITHUB</div>
            <div class="zone-sub">Source Code</div>
         </a>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.contact-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: transparent; 
  font-family: 'Space Grotesk', sans-serif; /* Unified Font */
}

.visual-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.content-layer {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let clicks pass to zones */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Page exit stagger animation */
.page-exit-item {
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: calc(var(--exit-order) * 0.1s);
}

.contact-page.page-leaving .page-exit-item {
  opacity: 0;
  transform: translateY(-30px);
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
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15rem; /* Match the 300px gap in particle system approximately */
  margin-top: 20px; /* 减少 margin，让文字更接近图标 */
  pointer-events: auto;
}

.zone-item {
  width: 200px;
  height: 200px; /* Approximate size of icon area */
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Align text to bottom */
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  padding-bottom: 2rem;
  transition: opacity 0.3s;
  /* border: 1px solid rgba(255,255,255,0.1); Debug border */
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
