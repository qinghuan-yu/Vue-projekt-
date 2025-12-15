<template>
  <div id="app-layout" @wheel.prevent="handleWheel">
    <div ref="pixiContainer" id="pixi-container"></div>

    <div :class="['sidebar', { open: isSidebarOpen }]">
      <div class="sidebar-line"></div>
      
      <router-link to="/intro" class="sidebar-item">
        <span>介绍</span><span class="sidebar-sub">INTRO</span>
      </router-link>
      <router-link to="/collab" class="sidebar-item">
        <span>合作</span><span class="sidebar-sub">COLLAB</span>
      </router-link>
      <router-link to="/contact" class="sidebar-item">
        <span>联系方式</span><span class="sidebar-sub">CONTACT</span>
      </router-link>
    </div>

    <div class="menu-trigger" @click="toggleSidebar">
      MENU
    </div>

    <section id="main-stage" @click="handleStageClick">
      
      <div class="timeline-bar">
        <div class="timeline-line"></div>
        
        <div 
          v-for="(item, index) in rightNavItems" 
          :key="index"
          :class="['nav-node', { active: currentRoute === item.to }]"
          @click="navigate(item.to)"
        >
          <div class="nav-label">
            <span class="zh">{{ item.name }}</span>
            <span class="en">{{ item.en_name }}</span>
          </div>
          <div class="nav-node-circle"></div>
        </div>
      </div>

      <div class="content-card group">
        <div class="corner tl"></div><div class="corner tr"></div>
        <div class="corner bl"></div><div class="corner br"></div>

        <div class="status-row">
          <div class="status-dot"></div>
          <span class="status-text">SYSTEM // STANDBY</span>
        </div>

        <h1 class="glitch-title">
          INFO<br>
          <span style="color: var(--color-accent);">UNLOCKING</span>
        </h1>
        
        <div class="view-container">
           <router-view />
        </div>
      </div>
    </section>

    <div class="bottom-bar">
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePixiApp } from '../composables/usePixiApp.js';

const router = useRouter();
const route = useRoute();

// --- 状态与数据 ---
const isSidebarOpen = ref(false);
let isThrottled = false;

const handleWheel = (event) => {
  if (isSidebarOpen.value) return;
  if (isThrottled) return;
  isThrottled = true;

  setTimeout(() => {
    isThrottled = false;
  }, 500); // 500ms throttle period

  const navItems = rightNavItems.value;
  if (navItems.length <= 1) return;

  const currentIndex = navItems.findIndex(item => item.to === currentRoute.value);
  if (currentIndex === -1) return;

  const direction = event.deltaY > 0 ? 1 : -1;
  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) {
    nextIndex = 0;
  } else if (nextIndex >= navItems.length) {
    nextIndex = navItems.length - 1;
  }

  if (nextIndex !== currentIndex) {
    navigate(navItems[nextIndex].to);
  }
};


const rightNavItems = computed(() => {
  const currentTopLevelRoute = route.path.split('/')[1];
  switch (currentTopLevelRoute) {
    case 'intro':
      return [
        { to: '/intro/personal', name: '个人', en_name: 'Personal' },
        { to: '/intro/skills', name: '技能', en_name: 'Skills' },
        { to: '/intro/ongoing', name: '项目', en_name: 'Ongoing' },
        { to: '/intro/finished', name: '作品', en_name: 'Finished' },
        { to: '/intro/links', name: '链接', en_name: 'Links' },
      ];
    case 'collab':
      return [
        { to: '/collab/music', name: '音乐', en_name: 'Music' },
        { to: '/collab/dev', name: '开发', en_name: 'Dev' },
      ];
    case 'contact':
       return [
        { to: '/contact', name: '联系', en_name: 'Contact' },
      ];
    default:
      return [];
  }
});

const currentRoute = computed(() => route.path);

// --- 交互逻辑 ---
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const handleStageClick = () => {
  if (isSidebarOpen.value) {
    isSidebarOpen.value = false;
  }
};

const navigate = (path) => {
  if (route.path !== path) {
    router.push(path);
  }
};

// --- PixiJS 集成 ---
const pixiContainer = ref(null);
const { init, destroy } = usePixiApp();

onMounted(async () => {
  if (pixiContainer.value) {
    await init(pixiContainer.value);
  }
});

onUnmounted(() => {
  destroy();
});
</script>

<style>
/* --- 全局样式设定 (移植自目标代码) --- */
:root {
  --color-bg: #050505;
  --color-text-main: #e6e6e6;
  --color-text-dim: #666;
  --color-accent: #61b1d6; /* 核心蓝色 */
  --border-tech: rgba(255, 255, 255, 0.15); 
  --sidebar-width: 360px;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--color-bg);
}

#app-layout {
  font-family: 'JetBrains Mono', 'Noto Sans SC', monospace;
  color: var(--color-text-main);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

#pixi-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* --- 侧边栏 --- */
.sidebar {
  position: fixed; top: 0; left: 0; height: 100vh; width: var(--sidebar-width);
  background: rgba(10, 10, 10, 0.75); backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-tech); z-index: 90;
  transform: translateX(-100%); transition: transform 0.4s cubic-bezier(0.42, 0, 0.58, 1);
  display: flex; flex-direction: column; justify-content: center; padding-left: 60px;
}
.sidebar.open { transform: translateX(0); }
.sidebar-line { position: absolute; left: 40px; top: 0; bottom: 0; width: 1px; background: var(--border-tech); }
.sidebar-item {
  font-size: 1.3rem; margin-bottom: 3rem; cursor: pointer; color: #888;
  transition: all 0.3s; position: relative; display: flex; align-items: center;
  text-decoration: none;
}
.sidebar-item:hover { color: #fff; padding-left: 5px; }
.sidebar-item::before {
  content: ''; position: absolute; left: -15px; width: 2px; height: 0%;
  background: var(--color-accent); transition: all 0.3s;
}
.sidebar-item:hover::before { height: 100%; }
.sidebar-item.router-link-active { color: #fff; padding-left: 5px; }
.sidebar-item.router-link-active::before { height: 100%; background: var(--color-accent); }
.sidebar-sub { font-size: 0.9rem; margin-left: 10px; font-family: monospace; opacity: 0.3; }
.mt-large { margin-top: 3rem; }

/* --- 菜单触发器 --- */
.menu-trigger {
  position: fixed; top: 40px; left: 40px; z-index: 100;
  font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: 0.1em;
  font-size: 1.4rem;
  cursor: pointer; color: var(--color-text-main); transition: all 0.3s ease;
  display: flex; align-items: center; gap: 12px; opacity: 0.8;
}
.menu-trigger::before {
  content: ''; display: block; width: 7px; height: 7px; background: #fff;
  border-radius: 50%; transition: all 0.3s;
}
.menu-trigger:hover { opacity: 1; color: var(--color-accent); }
.menu-trigger:hover::before { background: var(--color-accent); box-shadow: 0 0 10px var(--color-accent); }

/* --- 主舞台 --- */
#main-stage {
  flex: 1; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}

/* --- 右侧时间轴导航 --- */
.timeline-bar {
  position: absolute; right: 0; top: 0; bottom: 0; width: 120px;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  z-index: 20;
}
.timeline-line {
  width: 1px; height: 70%; background: var(--border-tech); position: absolute; right: 50px;
}
.nav-node {
  position: relative; margin: 1.8rem 0; cursor: pointer;
  display: flex; align-items: center; justify-content: flex-end;
  width: 100%; padding-right: 47px;
}
.nav-node-circle {
  width: 7px; height: 7px; background: #111; border: 1px solid #444;
  border-radius: 50%; transition: all 0.3s ease; z-index: 2;
}
.nav-label {
  position: absolute; right: 72px; text-align: right; opacity: 0;
  transform: translateX(20px); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}
.nav-label .zh { display: block; font-size: 1.1rem; color: #fff; font-weight: 500; }
.nav-label .en { display: block; font-size: 0.6rem; color: var(--color-accent); letter-spacing: 0.1em; text-transform: uppercase; }

.nav-node:hover .nav-node-circle { background: var(--color-accent); border-color: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }
.nav-node:hover .nav-label { opacity: 1; transform: translateX(0); }

.nav-node.active { padding-right: 44px; }
.nav-node.active .nav-node-circle {
  width: 12px; height: 12px; background: #000; border: 2px solid var(--color-accent);
  box-shadow: 0 0 10px rgba(97, 177, 214, 0.4);
}
.nav-node.active .nav-label { opacity: 1; transform: translateX(0); }

/* --- 中央内容卡片 --- */
.content-card {
  background: rgba(10, 10, 10, 0.6); backdrop-filter: blur(5px);
  border: 1px solid var(--border-tech); padding: 3rem; max-width: 600px; width: 100%;
  position: relative; z-index: 10; transition: border-color 0.3s;
}
.content-card:hover { border-color: rgba(255, 255, 255, 0.3); }

/* 角落装饰 */
.corner {
  position: absolute; width: 8px; height: 8px; border-color: #fff;
  border-style: solid; opacity: 0.3; transition: all 0.3s;
}
.tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
.tr { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
.bl { bottom: -1px; left: -1px; border-width: 0 0 1px 1px; }
.br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
.content-card:hover .corner { width: 15px; height: 15px; opacity: 1; border-color: var(--color-accent); }

/* 状态与文本 */
.status-row { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; opacity: 0.5; }
.status-dot { width: 6px; height: 6px; background: #999; border-radius: 50%; animation: pulse 2s infinite; }
.status-text { font-size: 0.7rem; letter-spacing: 0.2em; font-weight: bold; }
@keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }

.glitch-title {
  font-family: 'Space Grotesk', sans-serif; font-size: 3rem; margin: 0 0 1rem 0;
  line-height: 0.9; color: #fff;
}
@keyframes glitch-skew {
  0% { transform: skew(0deg); } 20% { transform: skew(-1deg); }
  40% { transform: skew(1deg); } 60% { transform: skew(0deg); } 100% { transform: skew(0deg); }
}

.view-container {
    min-height: 60px;
    color: #888;
    line-height: 1.6;
}

/* --- 底部栏 --- */
.bottom-bar {
  height: 80px; display: flex; justify-content: center; align-items: center;
  z-index: 10; pointer-events: none;
}
.info-trigger {
  pointer-events: auto; display: flex; flex-direction: column; align-items: center;
  cursor: pointer; transition: opacity 0.3s; opacity: 0.6;
}
.info-trigger:hover { opacity: 1; }
.info-trigger .zh { font-size: 1.2rem; letter-spacing: 0.3em; color: #fff; margin-bottom: 2px; }
.info-trigger .en { font-size: 0.7rem; letter-spacing: 0.1em; color: #666; transition: color 0.3s; }
.info-trigger:hover .en { color: var(--color-accent); }
</style>