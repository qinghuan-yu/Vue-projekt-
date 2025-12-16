<template>
  <div id="app-layout" @wheel.prevent="handleWheel">
    <div ref="pixiContainer" id="pixi-container"></div>

    <div :class="['sidebar', { open: isSidebarOpen }]" ref="sidebarRef" style="opacity: 0; visibility: hidden;">
      <div class="sidebar-line"></div>
      <router-link to="/intro" class="sidebar-item"><span>介绍</span><span class="sidebar-sub">INTRO</span></router-link>
      <router-link to="/collab" class="sidebar-item"><span>合作</span><span class="sidebar-sub">COLLAB</span></router-link>
      <router-link to="/contact" class="sidebar-item"><span>联系方式</span><span class="sidebar-sub">CONTACT</span></router-link>
    </div>

    <div class="menu-trigger" @click="toggleSidebar" ref="menuTriggerRef" style="opacity: 0; visibility: hidden;">MENU</div>

    <section id="main-stage" @click="handleStageClick">
      <div v-if="isIntroPlaying" ref="loaderTextRef" class="loader-container">
        <div class="loader-text-zh">神经元正在连接</div>
        <div class="loader-text-en">NEURAL CONNECTION ESTABLISHING</div>
      </div>

      <div class="timeline-bar" ref="timelineBarRef" style="opacity: 0; visibility: hidden;">
        <div class="timeline-line"></div>
        <div v-for="(item, index) in rightNavItems" :key="index" :class="['nav-node', { active: currentRoute === item.to }]" @click="navigate(item.to)">
          <div class="nav-label"><span class="zh">{{ item.name }}</span><span class="en">{{ item.en_name }}</span></div>
          <div class="nav-node-circle"></div>
        </div>
      </div>

      <div class="content-card" ref="contentCardRef">
        <div class="corner tl"></div><div class="corner tr"></div>
        <div class="corner bl"></div><div class="corner br"></div>

        <div class="card-header" ref="cardHeaderRef" style="opacity: 0; visibility: hidden;">
            <div class="status-row"><div class="status-dot"></div><span class="status-text">SYSTEM // ONLINE</span></div>
            <h1 class="glitch-title">I am Relic<br><span style="color: var(--color-accent);">I am Ark</span></h1>
        </div>

        <div class="clipper-box" ref="clipperRef" style="overflow: hidden; position: relative;">
            <div ref="innerWrapperRef" style="position: relative;">
                
                <router-view v-slot="{ Component }">
                    <transition 
                        :css="false" 
                        mode="out-in" 
                        @leave="onLeave" 
                        @enter="onEnter"
                    >
                        <component :is="Component" :key="route.path" />
                    </transition>
                </router-view>

            </div>
        </div>
      </div>
    </section>

    <div class="bottom-bar"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'; // Removed unused 'watch'
import { useRouter, useRoute } from 'vue-router';
import gsap from 'gsap';
import { usePixiApp } from '../composables/usePixiApp.js';

const router = useRouter();
const route = useRoute();
const { init, destroy } = usePixiApp();

// Refs
const pixiContainer = ref(null);
const sidebarRef = ref(null);
const menuTriggerRef = ref(null);
const timelineBarRef = ref(null);
const contentCardRef = ref(null); 
const cardHeaderRef = ref(null);  
const clipperRef = ref(null);     
const innerWrapperRef = ref(null);
const loaderTextRef = ref(null);

// State
const isIntroPlaying = ref(true);
const isSidebarOpen = ref(false);
let isThrottled = false; // 用于滚轮节流

// --- 动画逻辑 ---

// 1. 离开动画
const onLeave = (el, done) => {
  gsap.to(el, { 
      opacity: 0, 
      duration: 0.3, 
      ease: "power2.in", 
      onComplete: done 
  });
};

// 2. 进入动画
const onEnter = (el, done) => {
  gsap.set(el, { opacity: 0 });

  nextTick(() => {
    document.fonts.ready.then(() => {
        if (!clipperRef.value || !innerWrapperRef.value) { done(); return; }

        const startHeight = clipperRef.value.offsetHeight;
        
        clipperRef.value.style.height = 'auto';
        const targetHeight = innerWrapperRef.value.offsetHeight;
        clipperRef.value.style.height = `${startHeight}px`;

        const tl = gsap.timeline({
            onComplete: () => {
                if(clipperRef.value) clipperRef.value.style.height = 'auto';
                done();
            }
        });

        tl.to(clipperRef.value, {
            height: targetHeight,
            duration: 0.5,
            ease: "power3.inOut" 
        });

        tl.to(el, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
        }, "-=0.2");
    });
  });
};

// --- 生命周期 ---
onMounted(async () => {
  if (pixiContainer.value) await init(pixiContainer.value);

  gsap.set([sidebarRef.value, menuTriggerRef.value, timelineBarRef.value, cardHeaderRef.value], { autoAlpha: 0 });
  gsap.set(clipperRef.value, { height: 0 });

  const introTl = gsap.timeline({
    onComplete: () => {
      isIntroPlaying.value = false;
      if (clipperRef.value) clipperRef.value.style.height = 'auto';
    }
  });

  introTl
    .to(loaderTextRef.value, { autoAlpha: 0, duration: 0.5, delay: 1.5 })
    .add(() => gsap.set(contentCardRef.value, { backgroundColor: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(5px)' }))
    .to(contentCardRef.value, { borderTopColor: 'var(--border-tech)', borderBottomColor: 'var(--border-tech)', duration: 0.5 }, "<")
    .to(clipperRef.value, { height: () => innerWrapperRef.value.offsetHeight, duration: 0.8, ease: 'power3.inOut' }, "<")
    .to(innerWrapperRef.value, { autoAlpha: 1, duration: 0.5 })
    .to([sidebarRef.value, menuTriggerRef.value, timelineBarRef.value, cardHeaderRef.value], { autoAlpha: 1, duration: 0.5, stagger: 0.1 });
    
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  destroy();
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
    if (!isIntroPlaying.value && clipperRef.value && innerWrapperRef.value) {
        clipperRef.value.style.height = 'auto';
    }
}

// --- 导航逻辑 ---
const currentRoute = computed(() => route.path);
const rightNavItems = computed(() => {
    const section = route.path.split('/')[1];
    if (section === 'intro') return [
        { to: '/intro/personal', name: '个人', en_name: 'Personal' },
        { to: '/intro/skills', name: '技能', en_name: 'Skills' },
        { to: '/intro/ongoing', name: '项目', en_name: 'Ongoing' },
        { to: '/intro/finished', name: '作品', en_name: 'Finished' },
        { to: '/intro/links', name: '链接', en_name: 'Links' },
    ];
    if (section === 'collab') return [
        { to: '/collab/music', name: '音乐', en_name: 'Music' },
        { to: '/collab/dev', name: '开发', en_name: 'Dev' },
    ];
    return [];
});

const toggleSidebar = () => { if (!isIntroPlaying.value) isSidebarOpen.value = !isSidebarOpen.value; };
const handleStageClick = () => { if (isSidebarOpen.value) isSidebarOpen.value = false; };
const navigate = (path) => { if (route.path !== path) router.push(path); };

// 滚轮切换逻辑 (恢复了完整逻辑，修复了 unused vars 错误)
const handleWheel = (event) => {
  if (isSidebarOpen.value || isIntroPlaying.value) return;
  if (isThrottled) return;
  isThrottled = true;
  setTimeout(() => { isThrottled = false; }, 500);

  const navItems = rightNavItems.value;
  if (navItems.length <= 1) return;
  const currentIndex = navItems.findIndex(item => item.to === currentRoute.value);
  if (currentIndex === -1) return;
  
  const direction = event.deltaY > 0 ? 1 : -1;
  let nextIndex = currentIndex + direction;
  
  if (nextIndex < 0) nextIndex = 0;
  else if (nextIndex >= navItems.length) nextIndex = navItems.length - 1;
  
  if (nextIndex !== currentIndex) navigate(navItems[nextIndex].to);
};

</script>

<style>
/* 全局变量 */
:root {
  --color-bg: #050505;
  --color-text-main: #e6e6e6;
  --color-text-dim: #666;
  --color-accent: #61b1d6;
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

/* Loader */
.loader-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column; /* 关键：改为垂直方向分布，即上下排列 */
  align-items: center;    /* 水平居中 */
  justify-content: center;
  z-index: 999;
  text-align: center;
}

/* 中文文本：去掉竖排属性，增加字间距以保持科技感 */
.loader-text-zh {
  /* writing-mode: vertical-rl;  <-- 删除或注释掉这一行 */
  writing-mode: horizontal-tb; /* 强制设为横向 */
  
  font-size: 24px;       /* 根据需要调整大小 */
  font-weight: bold;
  letter-spacing: 0.5em; /* 增加字间距，横向排版时这样更有设计感 */
  margin-bottom: 10px;   /* 中文和英文之间的间距 */
  color: #fff;           /* 确保颜色正确 */
  text-shadow: 0 0 10px rgba(97, 177, 214, 0.5); /* 保持发光效果 */
}

/* 英文文本：通常不需要大改，保持字间距即可 */
.loader-text-en {
  font-size: 12px;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.6); /* 假设你用了等宽字体 */
}

/* 侧边栏 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-tech);
  z-index: 90;
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.42, 0, 0.58, 1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 60px;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-line {
  position: absolute;
  left: 40px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--border-tech);
}

.sidebar-item {
  font-size: 1.3rem;
  margin-bottom: 3rem;
  cursor: pointer;
  color: #888;
  transition: all 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.sidebar-item:hover {
  color: #fff;
  padding-left: 5px;
}

.sidebar-item::before {
  content: '';
  position: absolute;
  left: -15px;
  width: 2px;
  height: 0%;
  background: var(--color-accent);
  transition: all 0.3s;
}

.sidebar-item:hover::before {
  height: 100%;
}

.sidebar-item.router-link-active {
  color: #fff;
  padding-left: 5px;
}

.sidebar-item.router-link-active::before {
  height: 100%;
  background: var(--color-accent);
}

.sidebar-sub {
  font-size: 0.9rem;
  margin-left: 10px;
  font-family: monospace;
  opacity: 0.3;
}

/* 菜单触发器 */
.menu-trigger {
  position: fixed;
  top: 40px;
  left: 40px;
  z-index: 100;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  letter-spacing: 0.1em;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--color-text-main);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0.8;
}

.menu-trigger::before {
  content: '';
  display: block;
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.3s;
}

.menu-trigger:hover {
  opacity: 1;
  color: var(--color-accent);
}

.menu-trigger:hover::before {
  background: var(--color-accent);
  box-shadow: 0 0 10px var(--color-accent);
}

/* 主舞台 */
#main-stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右侧时间轴 */
.timeline-bar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.timeline-line {
  width: 1px;
  height: 70%;
  background: var(--border-tech);
  position: absolute;
  right: 50px;
}

.nav-node {
  position: relative;
  margin: 1.8rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding-right: 47px;
}

.nav-node-circle {
  width: 7px;
  height: 7px;
  background: #111;
  border: 1px solid #444;
  border-radius: 50%;
  transition: all 0.3s ease;
  z-index: 2;
}

.nav-label {
  position: absolute;
  right: 72px;
  text-align: right;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.nav-label .zh {
  display: block;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 500;
}

.nav-label .en {
  display: block;
  font-size: 0.6rem;
  color: var(--color-accent);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.nav-node:hover .nav-node-circle {
  background: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: 0 0 8px var(--color-accent);
}

.nav-node:hover .nav-label {
  opacity: 1;
  transform: translateX(0);
}

.nav-node.active {
  padding-right: 44px;
}

.nav-node.active .nav-node-circle {
  width: 12px;
  height: 12px;
  background: #000;
  border: 2px solid var(--color-accent);
  box-shadow: 0 0 10px rgba(97, 177, 214, 0.4);
}

.nav-node.active .nav-label {
  opacity: 1;
  transform: translateX(0);
}

/* 内容卡片 */
.content-card {
  box-sizing: border-box;
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid var(--border-tech);
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  position: relative;
  z-index: 10;
  transition: border-color 0.3s;
  overflow: visible;
}

.content-card:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

/* Clipper 容器：动画核心 */
.clipper-box {
    overflow: hidden;
    height: auto;
    position: relative;
    will-change: height;
}

/* 角落装饰 */
.corner {
  position: absolute;
  width: 8px;
  height: 8px;
  border-color: #fff;
  border-style: solid;
  opacity: 0.3;
  transition: all 0.3s;
}

.tl {
  top: -1px;
  left: -1px;
  border-width: 1px 0 0 1px;
}

.tr {
  top: -1px;
  right: -1px;
  border-width: 1px 1px 0 0;
}

.bl {
  bottom: -1px;
  left: -1px;
  border-width: 0 0 1px 1px;
}

.br {
  bottom: -1px;
  right: -1px;
  border-width: 0 1px 1px 0;
}

.content-card:hover .corner {
  width: 15px;
  height: 15px;
  opacity: 1;
  border-color: var(--color-accent);
}

/* 状态与文本 */
.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #999;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  font-weight: bold;
}

@keyframes pulse {
  0% { opacity: 0.3; }
  50% { opacity: 1; }
  100% { opacity: 0.3; }
}

.glitch-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 3rem;
  margin: 0 0 1rem 0;
  line-height: 0.9;
  color: #fff;
}

/* 底部栏 */
.bottom-bar {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  pointer-events: none;
}
</style>