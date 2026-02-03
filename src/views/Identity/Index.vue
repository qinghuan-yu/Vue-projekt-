<template>
  <section class="identity-container">
    <!-- Content Layer -->
    <div class="layer-content">
      <div class="identity-wrapper">
        <!-- 1. Title Group (First) -->
        <h1 class="main-title stagger-item" style="--i: 1;"><span class="relic-text">I am Relic</span><br><span class="blue-text">I am Ark</span></h1>

        <!-- 2. Profile Tag & Details (Second) -->
        <div class="profile-header stagger-item" style="--i: 8;">
          <div class="h-line-anim"></div>
          <span class="header-tag">Profile Authenticated</span>
        </div>
        
        <div class="detail-grid">
          <div class="detail-left">
            <div class="detail-item group stagger-item" style="--i: 9;">
              <div class="icon-wrap">[MONITOR]</div>
              <div>
                <p class="detail-sub">Status / Objective</p>
                <p class="detail-main">JUFE Sophomore / Kaggle Preparing</p>
              </div>
            </div>
            
            <div class="detail-item group stagger-item" style="--i: 10;">
              <div class="icon-wrap">[MUSIC]</div>
              <div>
                <p class="detail-sub">Artist IN</p>
                <p class="detail-main">Animenz-Style-Pianist</p>
              </div>
            </div>
          </div>

          <div class="detail-right">
            <div class="signature-box stagger-item" style="--i: 11;">
               <p class="sig-label">Signature</p>
               <p class="sig-val" style="font-family: 'Noto Sans SC', serif;">清棫</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 检查是否是网站首次加载（整个会话的第一次访问）
  const isFirstVisit = !sessionStorage.getItem('hasVisited');
  const container = document.querySelector('.identity-container');
  // App Loading Finished Time (approx 3.5s)
  
  if (isFirstVisit && container) {
    sessionStorage.setItem('hasVisited', 'true');
    setTimeout(() => {
        container.classList.add('animate-entry');
    }, 3500); 
  } else if (container) {
    // 强制先移除（防止缓存导致的类名残留），再延迟添加
    container.classList.remove('animate-entry'); 
    
    // 延迟 100ms 确保每一轮进入都能触发完整的 transition 动画
    // 这对于保留"进场感"非常重要
    setTimeout(() => {
         container.classList.add('animate-entry');
    }, 100);
  }
});
</script>

<style scoped>
.blue-text {
  color: #22d3ee;
}

.relic-text {
  color: #888888;
}

.identity-container {
  min-height: 80vh; 
  height: 100%;
  position: relative;
  overflow: hidden;
  /* Default state handled by items */
}

/* Stagger Animation System */
.stagger-item {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

/* When container has 'animate-entry', trigger children */
.identity-container.animate-entry .stagger-item {
  opacity: 1;
  transform: translateY(0);
  transition-delay: calc(var(--i) * 0.1s); /* Speed up base logic slightly */
}

/* 1. Title appears FIRST (Solo) */
/* Instant or very fast */
.identity-container.animate-entry .main-title.stagger-item {
   transition-delay: 0.1s;
}

/* 2. Figure 2 Content - Layered Stagger */
/* Profile Header (Top of Fig 2) */
/* Shorter Gap: 0.8s -> 0.5s */
.identity-container.animate-entry .profile-header.stagger-item {
   transition-delay: 0.5s !important; 
}

/* Left Column Details (Monitor, Music) */
.identity-container.animate-entry .detail-left .stagger-item:nth-child(1) {
   transition-delay: 0.7s !important;
}
.identity-container.animate-entry .detail-left .stagger-item:nth-child(2) {
   transition-delay: 0.9s !important;
}

/* Right Column (Signature) */
.identity-container.animate-entry .signature-box.stagger-item {
   transition-delay: 1.1s !important;
}

/* ... existing styles ... */

.identity-container.page-leaving .page-exit-item {
  opacity: 0;
  transform: translateY(-30px);
}

.layer-content {
  display: flex;
  align-items: center;
  padding: 0 24px;
}
@media (min-width: 1024px) {
  .layer-content { padding: 0 96px; }
}

.identity-wrapper {
  position: relative;
  z-index: 10;
  width: 100%;
}
@media (min-width: 1024px) {
  .identity-wrapper { width: 66.66%; }
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.h-line-anim {
  height: 2px;
  width: 48px;
  background-color: #22d3ee;
}

.header-tag {
  font-size: 12px;
  letter-spacing: 0.5em;
  color: #22d3ee;
  font-weight: 500;
  text-transform: uppercase;
}

.main-title {
  font-size: 72px;
  font-weight: 500;
  font-style: normal;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: 32px;
  margin-top: 0;
  text-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
@media (min-width: 1024px) {
  .main-title { font-size: 160px; }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 40px;
}
@media (min-width: 768px) {
  .detail-grid { grid-template-columns: repeat(2, 1fr); }
}

.detail-left {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.icon-wrap {
  color: #22d3ee;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  min-width: 85px; /* Ensure alignment between items */
}

.detail-sub {
  font-size: 10px;
  opacity: 0.4;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 4px;
  margin-top: 0;
}

.detail-main {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1em;
  margin: 0;
}

.detail-right {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  text-align: right;
}

.signature-box {
  background: transparent;
  border-left: 2px solid #22d3ee;
  padding: 24px;
  width: 100%;
  backdrop-filter: none;
}
@media (min-width: 768px) {
  .signature-box { width: 288px; }
}

.sig-label {
  font-size: 9px;
  opacity: 0.4;
  margin-bottom: 8px;
  letter-spacing: 0.1em;
  margin-top: 0;
}

.sig-val {
  font-size: 20px;
  font-family: monospace;
  font-weight: 500;
  letter-spacing: -0.05em;
  color: #22d3ee;
  margin: 0;
}

.background-text {
  position: absolute;
  bottom: -5%;
  right: 0;
  pointer-events: none;
  opacity: 0.03;
  user-select: none;
}

.background-text h2 {
  font-size: 25vw;
  font-weight: 500;
  font-style: normal;
  line-height: 1;
  margin: 0;
}
</style>
