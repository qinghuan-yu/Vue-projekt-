<template>
  <section class="projects-container">
    <!-- Visual Layer: Pixi Canvas Removed (Global in MainLayout) -->

    <!-- UI Layer -->
    <div class="layer-content">
      
      <!-- VIEW 1: Project List -->
      <!-- Wrapper for list view content, handled by internal staggering -->
      <transition name="list-section">
      <div v-show="selectedIndex === -1" class="view-list">
          <div class="list-header page-exit-item" style="--exit-order: 0;">
            <h3 class="projects-title">Projects</h3>
            <p class="projects-subtitle">Ongoing Development Logs</p>
          </div>

          <transition-group 
             tag="div" 
             name="staggered-list" 
             class="project-items"
             appear
          >
            <div 
              v-for="(proj, i) in (selectedIndex === -1 ? projects : [])" 
              :key="proj.title" 
              class="project-row group page-exit-item"
              :style="{ '--i': i, '--exit-order': i + 1 }"
              @click="selectProject(i)"
            >
              <div class="row-left">
                <span class="row-id">0{{ i + 1 }}</span>
                <span class="row-type">{{ proj.type }}</span>
              </div>
              <h4 class="row-title">{{ proj.title }}</h4>
              <div class="row-arrow">→</div>
            </div>
          </transition-group>
      </div>
      </transition>

      <!-- VIEW 2: Project Detail -->
      <div v-if="selectedIndex !== -1" class="view-detail">
        <transition name="project-switch" mode="out-in">
          <!-- Wrapper keyed by project to force re-render transition -->
          <div :key="currentProject.title" class="switch-container">
            
            <!-- ContentWrapper: Right Aligned Text -->
            <div class="detail-wrapper">
               <div class="detail-content-area">
                  <h2 class="detail-title-cn stagger-item s-1">{{ currentProject.title }}</h2>
                  <h2 class="detail-title-en stagger-item s-2">{{ currentProject.descTitle || 'PROJECT DETAILS' }}</h2>
                  
                  <div class="detail-separator stagger-item s-2">
                     <div class="dashed-line"></div>
                  </div>

                  <p class="detail-desc stagger-item s-2">
                    {{ currentProject.desc }}
                  </p>
                  <div class="detail-action stagger-item s-2">
                     <a :href="currentProject.link" target="_blank" class="text-link-box">
                        <span class="link-label">LAUNCH PROJECT</span>
                        <span class="link-arrow">↗</span>
                     </a>
                  </div>
               </div>
            </div>

            <!-- Right Side World/Index Indicator (as per image) -->
            <div class="right-indicator">
                <div class="indicator-group-custom">
                   <div class="digit-row">
                       <!-- Digit 0: Cut 50% by overflow -->
                       <div class="digit-clip-box clip-half">
                           <span class="idx-digit stagger-exit e-1">0</span>
                       </div>
                       <!-- Digit N: Cut ~20% by overflow -->
                       <div class="digit-clip-box clip-small">
                           <span class="idx-digit stagger-exit e-1">{{ selectedIndex + 1 }}</span>
                       </div>
                   </div>
                   <!-- Text below digits -->
                   <div class="txt-proj stagger-exit e-2">PROJ</div>
                   <div class="txt-info stagger-exit e-2">INFORMATION</div>
                </div>
            </div>

          </div>
        </transition>

        <!-- Navigation Switchers (Out of Transition, Persistent) -->
        <button @click="prevProject" class="nav-arrow nav-prev hover-glow">
            <svg viewBox="0 0 24 24" width="48" height="48"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        
        <button @click="nextProject" class="nav-arrow nav-next hover-glow">
            <svg viewBox="0 0 24 24" width="48" height="48"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>

      </div>

      <!-- Bottom Bar with Transition (Moved Outside view-detail) -->
      <transition 
        name="bottom-bar"
        appear
        @before-enter="onBottomBarBeforeEnter"
        @enter="onBottomBarEnter"
        @after-enter="onBottomBarAfterEnter"
        @before-leave="onBottomBarBeforeLeave"
        @leave="onBottomBarLeave"
        @after-leave="onBottomBarAfterLeave"
      >
        <div v-if="selectedIndex !== -1" class="bottom-bar-area">
           <div class="bar-progress-bg">
              <div class="bar-progress-fill" :style="{ width: ((selectedIndex + 1) / projects.length) * 100 + '%' }"></div>
           </div>
           
           <button @click="closeDetail" class="back-btn-block">
               <div class="back-bg"></div>
               <div class="back-content">
                  <div class="back-icon">‹</div>
                  <div class="back-text">
                      <span>返回</span>
                      <span class="back-en">GO BACK</span>
                  </div>
               </div>
           </button>
        </div>
      </transition>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { usePixiApp } from '@/composables/usePixiApp';

// Asset Imports
import pcbUrl from '@/assets/pcb.png';
import pcb2Url from '@/assets/pcb2.png';
import pianoUrl from '@/assets/piano.png';
import aiUrl from '@/assets/AI.png';
// Fallback if needed
const defaultPcb = pcbUrl;

const projects = [
  { 
    type: 'IOT', 
    title: 'GIF 播放器',
    descTitle: 'GIF-PLAYER',
    desc: '基于ESP-32以及 TFT 显示屏的便携式 GIF 播放器。支持多种动画格式和自定义播放列表。',
    link: 'https://github.com/qinghuan-yu/gif-player',
    image: pcb2Url
  },
  { 
    type: 'VUE', 
    title: 'Vue 钢琴',
    descTitle: 'VUE-PIANO',
    desc: '基于 Vue.js 构建的交互式虚拟钢琴。内含天际线算法提取主旋律，可转化为token进行训练',
    link: 'https://github.com/qinghuan-yu/vue-piano',
    image: pianoUrl
  },
  { 
    type: 'DEEP-LEARNING', 
    title: '演奏分析', 
    descTitle: 'PIANALYSIS',
    desc: '基于Transformer框架的深度学习钢琴音色补全方法，可使用训练好的模型对MIDI文件进行织体补全。',
    link: 'https://github.com/qinghuan-yu/Pianalysis',
    image: aiUrl
  },
];

const selectedIndex = ref(-1);
let morphToShapes = null;

const currentProject = computed(() => {
  if (selectedIndex.value === -1) return {};
  return projects[selectedIndex.value];
});

// --- Actions ---

const updateParticles = async (imgUrl, layoutX = 0.35) => {
  if (!morphToShapes) return;
  // Use morphToShapes with layout option
  // layoutX: 0.35 (Left - Detail View), 0.75 (Right - List View)
  await morphToShapes([
    { source: imgUrl, options: { type: 'image', sampleRate: 4, layoutX: layoutX } } 
  ]);
};

const selectProject = (index) => {
  selectedIndex.value = index;
  // Switch to Detail View: Image on Left (0.35)
  updateParticles(projects[index].image, 0.35);
};

const nextProject = () => {
  let next = selectedIndex.value + 1;
  if (next >= projects.length) next = 0;
  selectedIndex.value = next;
  // Detail View Switching: Image on Left
  updateParticles(projects[next].image, 0.35);
};

const prevProject = () => {
  let prev = selectedIndex.value - 1;
  if (prev < 0) prev = projects.length - 1;
  selectedIndex.value = prev;
  // Detail View Switching: Image on Left
  updateParticles(projects[prev].image, 0.35);
};

const closeDetail = () => {
  selectedIndex.value = -1;
  // Return to List View: Image on RIGHT (0.75) to avoid overlap with Left List
  updateParticles(defaultPcb, 0.75);
};

// Bottom Bar Transition Hooks
const onBottomBarBeforeEnter = (el) => {};
const onBottomBarEnter = (el) => {};
const onBottomBarAfterEnter = (el) => {};
const onBottomBarBeforeLeave = (el) => {};
const onBottomBarLeave = (el) => {};
const onBottomBarAfterLeave = (el) => {};

// --- Lifecycle ---

onMounted(async () => {
  // Get partial control of global Pixi instance
  const { init } = usePixiApp();
  // We can call init() without container, it will wait for the global initialization to complete
  try {
    const controls = await init(); 
    morphToShapes = controls.morphToShapes;
    
    // Initial State is handled by PixiBackground global watcher now.
    // Removed duplicate call to avoid double loading.
  } catch (e) {
    console.warn("Pixi helper not ready yet or failed:", e);
  }
});

onUnmounted(() => {
  // Do not destroy global app
  morphToShapes = null;
});
</script>

<style scoped>


/* Adjust Transitions */
.list-section-enter-active, .list-section-leave-active {
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.list-section-enter-from, .list-section-leave-to {
  /* Only animate opacity for container or minor transform, 
     Let staggered list items handle the big movement */
   opacity: 0;
}

/* List Header Animation (Projects Title) */
.list-section-leave-active .list-header {
    transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    transform: translateY(-50px);
    opacity: 0;
}

/* Staggered List Items */
.staggered-list-enter-active,
.staggered-list-leave-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.staggered-list-enter-from,
.staggered-list-leave-to {
  opacity: 0;
  transform: translateY(-30px); /* Leave Upwards */
}

/* Stagger Delays for Leaving List */
/* We need to reverse staggered delay for leaving or just apply consistent delay.
   Vue doesn't automatically stagger 'leave' without hooks or CSS tricks.
   We can calculate delay based on index in style tag.
*/
.staggered-list-leave-active {
   transition-delay: calc(var(--i) * 0.1s);
}


/* Stagger Animations for Project Detail Entering */
.project-switch-enter-active {
    transition: all 1.0s cubic-bezier(0.22, 1, 0.36, 1);
}
.project-switch-leave-active {
    transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.project-switch-enter-from {
    opacity: 0; 
}
.project-switch-leave-to {
    opacity: 0;
}

/* Entering Elements (Detail) */
.stagger-item {
    opacity: 0;
    transform: translateY(20px);
    animation: simple-fade-up 1.0s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* Exiting Elements (Detail) - Specifically the Indicator parts */
.project-switch-leave-active .stagger-exit {
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    opacity: 1;
    transform: translateY(0);
}
.project-switch-leave-to .stagger-exit {
    opacity: 0;
    transform: translateY(-20px); /* Move Up out */
}

/* Delays Enter */
.right-indicator .idx-big {
    display: inline-block;
    /* Use simple fade up to match everything else, no bespoke bounce */
    animation: simple-fade-up 1.0s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: 0.4s;
    opacity: 0;
    transform: translateY(20px);
}

/* 
@keyframes bounce-enter {
   0% { opacity: 0; transform: translateY(40px); }
   50% { opacity: 1; transform: translateY(-15px); }
   100% { opacity: 1; transform: translateY(0); }
} 
*/


/* Delays Exit (Top to Bottom) */
.project-switch-leave-active .e-1 { transition-delay: 0.0s; } /* Big starts first */
.project-switch-leave-active .e-2 { transition-delay: 0.2s; } /* Text starts later */
.project-switch-leave-active .e-3 { transition-delay: 0.3s; }


@keyframes simple-fade-up {
    to { opacity: 1; transform: translateY(0); }
}

.projects-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: transparent; /* MainLayout handles background */
}

/* Page exit stagger animation */
.page-exit-item {
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: calc(var(--exit-order) * 0.1s);
}

.projects-container.page-leaving .page-exit-item {
  opacity: 0;
  transform: translateY(-30px);
}

/* --- Pixi Layer --- */
.pixi-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none; /* Let clicks pass through */
}

/* --- UI Layer --- */
.layer-content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100vh;
  padding: 96px 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* --- View 1: List Styles --- */
.view-list {
  width: 100%;
  max-width: 600px;
  position: relative; /* Ensure z-index works contextually */
  z-index: 20; 
} 

.projects-title {
  font-size: 48px;
  color: #22d3ee;
  margin: 0;
  letter-spacing: -0.05em;
  font-weight: 500;
}

.projects-subtitle {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.4em;
  text-transform: uppercase;
  margin-bottom: 48px;
}

.project-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Staggered transition handled by TransitionGroup */
}

.project-row {
  display: flex;
  align-items: center;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
}

.project-row:hover {
  border-color: #22d3ee;
  transform: translateX(20px);
  background: rgba(34, 211, 238, 0.05);
}

.row-left {
  display: flex;
  flex-direction: column;
  margin-right: 32px;
  min-width: 80px;
}

.row-id {
  font-family: monospace;
  color: #22d3ee;
  font-size: 12px;
}

.row-type {
  font-size: 9px;
  opacity: 0.5;
  letter-spacing: 0.1em;
}

.row-title {
  flex: 1;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.05em;
  margin: 0;
  text-transform: uppercase;
}

.row-arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
  color: #22d3ee;
}

.project-row:hover .row-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* --- View 2: Detail Styles (Revamped) --- */
.view-detail {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Make content wrapper occupy right half approx. */
.detail-wrapper {
  position: absolute;
  top: 50%;
  left: 55%; /* Start from slightly right of center */
  transform: translateY(-50%);
  width: 35%; /* Reduced width to avoid overlap with right arrow */
  pointer-events: none; /* Container passes clicks */
  text-align: left;
  z-index: 50;
}

.detail-content-area {
  color: white;
  pointer-events: auto; /* Text content captures clicks */
}

.detail-title-cn {
  font-size: 48px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.detail-title-en {
  font-size: 24px;
  font-weight: 700;
  font-family: 'Arial Black', sans-serif;
  color: white;
  margin: 0 0 16px 0;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.detail-separator {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin-bottom: 24px;
  position: relative;
}

.detail-desc {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  max-width: 400px;
}

/* Nav Arrows */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle border to define hit area visually if needed, or remove */
  background: rgba(0,0,0,0.2); /* Slight background to capture clicks */
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  pointer-events: auto; /* CRITICAL */
  transition: all 0.3s;
  padding: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 99999; /* Max Z-Index */
}
.nav-arrow:hover {
  color: #22d3ee;
  transform: translateY(-50%) scale(1.1);
  background: rgba(34, 211, 238, 0.1);
  border-color: #22d3ee;
}
.nav-prev { left: 48px; }
.nav-next { right: 48px; } 

/* Ensure no other element blocks clicks */
.right-indicator {
  position: absolute;
  right: 0;
  top: 52%; 
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-right: 140px; /* Make space for the button */
  z-index: 50; 
  opacity: 0.8;
  pointer-events: none; /* Container is passthrough */
}
.right-indicator * {
  pointer-events: none; /* Children are passthrough */
}

.idx-big {
  font-size: 80px;
  font-weight: 700;
  color: #22d3ee;
  line-height: 0.8;
  font-family: 'Arial', sans-serif; /* Cleaner font */
}

.text-link-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #22d3ee;
  padding: 12px 24px;
  text-decoration: none;
  color: #22d3ee;
  font-size: 12px;
  letter-spacing: 0.1em;
  transition: all 0.3s;
  background: rgba(0,0,0,0.5);
}

/* --- Custom Split Indicator Style --- */
.indicator-group-custom {
   position: relative;
   display: flex;
   flex-direction: column;
   align-items: flex-start; /* Align left mostly */
}

.digit-row {
  display: flex;
  align-items: flex-end;
  line-height: 1;
  margin-bottom: 5px;
}

/* Clip containers for digits - use overflow to cut from bottom */
.digit-clip-box {
  overflow: hidden; /* Cut the digit */
  position: relative;
}

/* Both digits same height for alignment */
.clip-half {
  height: 80px;
}

.clip-small {
  height: 80px;
}

.idx-digit {
  font-size: 150px;
  font-weight: 900;
  color: #22d3ee;
  line-height: 0.8; /* 150 * 0.8 = 120px actual height */
  letter-spacing: -0.05em;
  font-family: 'Arial Black', sans-serif;
  display: block;
  position: relative;
  top: 0;
}

.txt-proj {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-left: 8px;
  margin-bottom: 2px;
}

.txt-info {
  font-size: 15px;
  font-weight: 700;
  color: rgba(255,255,255,0.95);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-left: 8px;
}

/* Delays Enter: Target the separated digits */
.indicator-group-custom .idx-digit {
    animation: simple-fade-up 1.0s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: 0.4s;
    opacity: 0;
    transform: translateY(20px);
}

/* Bottom Bar Transition */
.bottom-bar-enter-active,
.bottom-bar-appear-active {
  transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: 0.5s; /* Delay after detail content appears */
}
.bottom-bar-leave-active {
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.bottom-bar-enter-from,
.bottom-bar-appear-from {
  opacity: 0;
  transform: translateY(50px);
}
.bottom-bar-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Bottom Bar */
.bottom-bar-area {
  position: absolute;
  bottom: 120px; /* Lifted up as requested */
  left: 0;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: flex-end;
  pointer-events: auto;
  z-index: 150;
  padding: 0 48px; /* Match layer padding */
}

.bar-progress-bg {
  flex: 1;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 31px; /* Center with button vertical align */
  position: relative;
  margin-right: 24px;
}

.bar-progress-fill {
  height: 100%;
  background: #22d3ee;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px #22d3ee;
  position: relative;
}
.bar-progress-fill::after {
   content: '';
   position: absolute;
   right: -4px;
   top: -3px;
   width: 8px;
   height: 8px;
   background: #22d3ee;
   border-radius: 50%;
   box-shadow: 0 0 10px #22d3ee;
}

.back-btn-block {
  width: 180px;
  height: 64px;
  background: transparent;
  padding: 0;
  border: none;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-bg {
   position: absolute;
   inset: 0;
   background: rgba(255,255,255,0.05);
   border: 1px solid rgba(255,255,255,0.1);
   /* Removed skewX(-15deg) as requested for rectangle */
   transition: all 0.3s ease;
}

.back-btn-block:hover .back-bg {
   background: rgba(34, 211, 238, 0.1);
   border-color: #22d3ee;
   box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
}

.back-content {
   position: relative;
   z-index: 2;
   display: flex;
   align-items: center;
   color: white;
   gap: 12px;
}

.back-icon {
  font-size: 24px;
  font-weight: 300;
  transition: transform 0.3s;
}
.back-btn-block:hover .back-icon {
   transform: translateX(-4px);
}

.back-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.back-en {
  font-size: 10px;
  letter-spacing: 0.1em;
  opacity: 0.6;
}

/* --- Transitions --- */
.list-hidden {
  pointer-events: none;
}

.switch-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Staggered List Item Transitions */
.staggered-list-enter-active {
  transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 0.1s);
}
.staggered-list-leave-active {
  transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  /* Reverse stagger for leaving? Or standard stagger. 
     Standard stagger works if items removed together and CSS delay applies. 
     But v-if removes all at once. The v-for trick handles this. */
  transition-delay: calc(var(--i) * 0.05s);
}

/* Enter: Slide from left */
.staggered-list-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

/* Leave: Slide out to left */
.staggered-list-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* Project Switch Parallax (Internal Toggle) */
.project-switch-enter-active,
.project-switch-leave-active {
  transition: all 1.0s cubic-bezier(0.22, 1, 0.36, 1);
}

.project-switch-enter-from {
  opacity: 0;
  transform: translateY(40px); /* Enter from below */
}

.project-switch-leave-to {
  opacity: 0;
  transform: translateY(-40px); /* Leave to top */
}

.project-switch-enter-to,
.project-switch-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>