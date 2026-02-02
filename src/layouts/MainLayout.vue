<template>
  <div class="app-container">
    <!-- Global Static Background -->
    <div class="cross-grid-background"></div>
    <div class="scan-effect"></div>

    <!-- 顶部导航 -->
    <nav class="top-nav">
      <div class="nav-left">
        <div class="brand">
          <span class="brand-name">RELIC</span>
          <span class="brand-sub">Data Hub</span>
        </div>
        <div class="nav-divider"></div>
        <div class="nav-links">
          <router-link to="/identity" class="nav-item">
            <span class="item-label">IDENTITY</span>
            <span class="item-sub">简介</span>
          </router-link>
          <router-link to="/projects" class="nav-item">
            <span class="item-label">PROJECTS</span>
            <span class="item-sub">项目</span>
          </router-link>
          <router-link to="/blog" class="nav-item">
            <span class="item-label">BLOG</span>
            <span class="item-sub">博客</span>
          </router-link>
          <router-link to="/contact" class="nav-item">
             <span class="item-label">CONTACT</span>
             <span class="item-sub">联系方式</span>
          </router-link>
        </div>
      </div>

      <div class="nav-right">
        <a href="https://terminal.reliarc.com" target="_blank" class="nav-item terminal-link">
          <span class="item-label">TERMINAL</span>
          <span class="item-sub">终端</span>
        </a>
      </div>
    </nav>

    <!-- 右侧进度条 -->
    <div class="right-sidebar">
      <div class="page-number">
        <transition name="num-slide" mode="out-in">
          <span :key="currentPageIndex" class="current-num dark-cyan">{{ currentPageIndex }}</span>
        </transition>
      </div>
      <div class="progress-track">
        <div class="progress-indicator" :style="{ top: indicatorPosition }">
          <div class="indicator-line"></div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition 
          name="parallax" 
          mode="out-in"
          @before-leave="onBeforeLeave"
        >
          <div :key="route.fullPath" class="view-wrapper">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      © 2026 RELIC-ARK ARCHIVE // Qing-UU
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const routesOrder = ['/identity', '/projects', '/blog', '/contact'];

let isNavigating = false;

const handleWheel = (e) => {
  if (isNavigating) return;
  
  const currentPath = route.path;
  const currentIndex = routesOrder.findIndex(p => currentPath.includes(p));
  
  if (currentIndex === -1) return;

  if (e.deltaY > 50) { // Scroll Down -> Next
    if (currentIndex < routesOrder.length - 1) {
      navigate(routesOrder[currentIndex + 1]);
    }
  } else if (e.deltaY < -50) { // Scroll Up -> Prev
    if (currentIndex > 0) {
      navigate(routesOrder[currentIndex - 1]);
    }
  }
};

const navigate = (path) => {
  isNavigating = true;
  router.push(path);
  setTimeout(() => {
    isNavigating = false;
  }, 1000); // Debounce duration matching transition time
};

const onBeforeLeave = (el) => {
  // Add page-leaving class to trigger stagger exit animation
  el.classList.add('page-leaving');
};

onMounted(() => {
  window.addEventListener('wheel', handleWheel);
});

onUnmounted(() => {
  window.removeEventListener('wheel', handleWheel);
});

const currentPageIndex = computed(() => {
  const path = route.path;
  if (path.includes('identity')) return '01';
  if (path.includes('projects')) return '02';
  if (path.includes('blog')) return '03'; // Blog / Archive
  if (path.includes('contact')) return '04';  // Contact
  return '00';
});

const indicatorPosition = computed(() => {
  const path = route.path;
  if (path.includes('identity')) return '0%';
  if (path.includes('projects')) return '33%';
  if (path.includes('blog')) return '66%';
  if (path.includes('contact')) return '100%';
  return '0%';
});
</script>

<style scoped>
/* 容器 */
.app-container {
  min-height: 100vh;
  background-color: #050505;
  color: white;
  font-family: 'Noto Sans SC', sans-serif;
  overflow: hidden;
  position: relative;
}

/* 背景特效 - 简洁网格背景 */
.cross-grid-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 1;
  background-color: #050505;
  background-image:
    /* 水平线 */
    linear-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px),
    /* 垂直线 */
    linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px);
  background-size: 160px 160px;
  background-position: 0 0;
}

.cross-grid-background::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background-image: radial-gradient(circle, rgba(97, 177, 214, 0.4) 1px, transparent 1px);
  background-size: 40px 40px;
}

.scan-effect {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  opacity: 0.03;
  mix-blend-mode: overlay;
  background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.04));
  background-size: 100% 4px, 3px 100%;
}

/* 顶部导航 */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 96px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  box-sizing: border-box;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.05em;
  color: #22d3ee;
}

.brand-sub {
  font-size: 8px;
  letter-spacing: 0.3em;
  opacity: 0.5;
  text-transform: uppercase;
}

.nav-divider {
  height: 32px;
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  display: none;
}
@media (min-width: 640px) { .nav-divider { display: block; } }

.nav-links {
  display: none;
  gap: 32px;
}
@media (min-width: 768px) { .nav-links { display: flex; } }

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-decoration: none;
  color: #6b7280;
  transition: all 0.3s;
}

.nav-item:hover, .nav-item.router-link-active {
  color: #22d3ee;
}
.nav-item.router-link-active .item-label, .nav-item:hover .item-label {
  color: #22d3ee;
}

.item-label {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.item-sub {
  font-size: 9px;
  opacity: 0.6;
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* Terminal Link Styling */
.terminal-link {
  padding: 8px 16px;
  border: 1px solid rgba(34, 211, 238, 0.3);
  border-radius: 4px;
  transition: all 0.3s;
  background: rgba(34, 211, 238, 0.05);
}

.terminal-link:hover {
  border-color: #22d3ee;
  background: rgba(34, 211, 238, 0.15);
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
  transform: translateY(-2px);
}

.terminal-link .item-label {
  color: #22d3ee;
}

.terminal-link .item-sub {
  color: rgba(34, 211, 238, 0.7);
}

.icon-link {
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  opacity: 0.8;
  transition: color 0.3s;
}
.icon-link:hover {
  color: #22d3ee;
}

/* 右侧侧边栏 */
.right-sidebar {
  position: fixed;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none; /* Make click-through */
}

.page-number {
  position: relative;
  margin-bottom: 24px;
  text-align: center;
  width: 64px;  /* Fixed width to prevent collapse */
  height: 48px; /* Fixed height matching font-size */
  display: flex;     /* Use flex to center absolute child if needed, though text-align works for inline blocks usually */
  justify-content: center;
}

.current-num {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  color: #22d3ee;
  display: block;
  width: 100%;
  /* Horizontal cut at the bottom 25% */
  clip-path: inset(0 0 25% 0);
}

.page-label {
  position: absolute;
  right: -32px;
  top: 4px;
  font-size: 10px;
  opacity: 0.3;
  font-family: monospace;
  font-style: normal; /* Removed italic */
  white-space: nowrap;
}

.progress-track {
  height: 192px;
  width: 1px;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
}

.progress-indicator {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 16px;
  border: 1px solid #22d3ee;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: top 0.5s ease-in-out;
}

.indicator-line {
  width: 1px;
  height: 8px;
  background: #22d3ee;
}

/* 主内容区 */
.main-content {
  padding-top: 96px;
  min-height: 100vh;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  background-color: transparent; /* 透明以显示底层格子背景 */
}

/* 视图包装器 - 防止过渡时白屏 */
.view-wrapper {
  width: 100%;
  min-height: calc(100vh - 96px);
  background-color: transparent; /* 透明以显示底层格子背景 */
}

/* Footer */
.app-footer {
  position: fixed;
  bottom: 0px;
  left: 24px;
  z-index: 90;
  font-size: 8px;
  letter-spacing: 0.4em;
  opacity: 0.3;
  text-transform: uppercase;
  padding-bottom: 16px; 
}

/* 颜色工具类 */
.dark-cyan { color: #22d3ee; }

/* 路由转场: 垂直向上 (Revert to Vertical Up) */
/* Enter from Bottom, Leave to Top */

.parallax-enter-active,
.parallax-leave-active {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Entering page (from Bottom) */
.parallax-enter-from {
  opacity: 0;
  transform: translateY(60px);
}

/* Leaving page (to Top) */
.parallax-leave-to {
  opacity: 0;
  transform: translateY(-60px);
}

.parallax-enter-to,
.parallax-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
