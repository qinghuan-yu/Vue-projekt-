<template>
  <div id="app">
    <!-- 1. 粒子背景 (Canvas) -->
    <canvas ref="bgCanvas" id="bg-canvas"></canvas>

    <!-- 2. 侧边栏 (Sidebar) -->
    <div :class="['sidebar', { open: isSidebarOpen }]">
      <div class="sidebar-line"></div>
      
      <!-- 侧边栏菜单项 (保留了你之前的链接逻辑) -->
      <div class="sidebar-item" @click="handleSidebarNav('/')">
        <span>介绍</span><span class="sidebar-sub">INTRO</span>
      </div>
      <div class="sidebar-item" @click="handleSidebarNav('/')">
        <span>合作</span><span class="sidebar-sub">COLLAB</span>
      </div>
      <div class="sidebar-item" @click="handleSidebarNav('/')">
        <span>联系方式</span><span class="sidebar-sub">CONTACT</span>
      </div>
      
      <!-- 终端触发器 (新功能) -->
      <div class="sidebar-item mt-large" @click="runTerminal">
        <span style="color: var(--color-accent);">系统终端</span>
        <span class="sidebar-sub" style="color: var(--color-accent); opacity: 0.5;">ROOT</span>
      </div>
    </div>

    <!-- 3. 左上角菜单按钮 (Menu Trigger) -->
    <div class="menu-trigger" @click="toggleSidebar">
      MENU
    </div>

    <!-- 4. 主舞台 (包含右侧导航和中央卡片) -->
    <section id="main-stage" @click="handleStageClick">
      
      <!-- 右侧时间轴导航 (替代原顶部导航) -->
      <div class="timeline-bar">
        <div class="timeline-line"></div>
        
        <div 
          v-for="(item, index) in navItems" 
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

      <!-- 中央内容卡片 (Pharmacore 风格容器) -->
      <div class="content-card group">
        <!-- 四角装饰 -->
        <div class="corner tl"></div><div class="corner tr"></div>
        <div class="corner bl"></div><div class="corner br"></div>

        <!-- 系统状态指示 -->
        <div class="status-row">
          <div class="status-dot"></div>
          <span class="status-text">SYSTEM // STANDBY</span>
        </div>

        <!-- 主标题 (这里保留静态标题，或者你可以根据路由变成动态的) -->
        <h1 class="glitch-title">
          INFO<br>
          <span style="color: var(--color-accent);">UNLOCKING</span>
        </h1>
        
        <!-- 描述文本 / 路由视图区域 -->
        <!-- 如果你想显示路由内容，可以将下方 <p> 替换为 <router-view> -->
        <p class="desc-text">
          测试文字 Test text
        </p>

      </div>
    </section>

    <!-- 5. 底部信息栏 -->
    <div class="bottom-bar">
      <div class="info-trigger" @click="runTerminal">
        <span class="zh">信息</span>
        <span class="en">UNLOCKING</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      isSidebarOpen: false,
      // 导航配置
      navItems: [
        { to: '/', name: '首页', en_name: 'Index' },
        { to: '/川蜀', name: '川蜀', en_name: 'ChuanShu' },
        { to: '/勾吴', name: '勾吴', en_name: 'GouWu' },
        { to: '/闽台', name: '闽台', en_name: 'MinTai' },
        { to: '/三秦', name: '三秦', en_name: 'SanQin' },
        { to: '/玉门', name: '玉门', en_name: 'YuMen' },
      ],
      // 粒子系统变量
      canvas: null,
      ctx: null,
      particles: [],
      animationFrameId: null,
    };
  },
  computed: {
    currentRoute() {
      return this.$route.path;
    }
  },
  mounted() {
    this.initParticles();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    // --- 导航与交互 ---
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    },
    handleSidebarNav(path) {
      this.$router.push(path);
      this.isSidebarOpen = false;
    },
    handleStageClick() {
      if (this.isSidebarOpen) this.isSidebarOpen = false;
    },
    navigate(path) {
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
    },
    runTerminal() {
      alert("TERMINAL // ACCESS_GRANTED");
      this.isSidebarOpen = false;
    },

    // --- 粒子系统 ---
    initParticles() {
      this.canvas = this.$refs.bgCanvas;
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      this.createParticles();
      this.animateParticles();
    },
    resizeCanvas() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },
    handleResize() {
      this.resizeCanvas();
      this.createParticles();
    },
    createParticles() {
      this.particles = [];
      const count = 200;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: Math.random() * 2.5,
          color: Math.random() > 0.9 ? '#61b1d6' : (Math.random() > 0.5 ? '#333' : '#555')
        });
      }
    },
    animateParticles() {
      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.clearRect(0, 0, w, h);
      
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        for (let j = i; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const d = Math.sqrt((p.x - p2.x)**2 + (p.y - p2.y)**2);
          if (d < 100) {
            this.ctx.strokeStyle = `rgba(97, 177, 214, ${0.4 * (1 - d / 100)})`;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }
      this.animationFrameId = requestAnimationFrame(this.animateParticles);
    }
  }
};
</script>

<style>
/* CSS 变量与全局设置 (移植自生成的 styles) */
:root {
  --color-bg: #050505;
  --color-text-main: #e6e6e6;
  --color-text-dim: #666;
  --color-accent: #61b1d6; /* 核心蓝色 */
  --border-tech: rgba(255, 255, 255, 0.15); 
  --sidebar-width: 360px;
}

/* 基础重置 */
#app {
  font-family: 'JetBrains Mono', 'Noto Sans SC', monospace;
  background-color: var(--color-bg);
  color: var(--color-text-main);
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 1. 粒子 Canvas */
#bg-canvas {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%; z-index: 0;
}

/* 2. 侧边栏样式 */
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
}
.sidebar-item:hover { color: #fff; padding-left: 5px; }
.sidebar-item::before {
  content: ''; position: absolute; left: -15px; width: 2px; height: 0%;
  background: var(--color-accent); transition: all 0.3s;
}
.sidebar-item:hover::before { height: 100%; }
.sidebar-sub { font-size: 0.9rem; margin-left: 10px; font-family: monospace; opacity: 0.3; }
.mt-large { margin-top: 3rem; }

/* 3. 菜单按钮 */
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

/* 4. 主舞台与右侧时间轴 */
#main-stage {
  flex: 1; position: relative; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}

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

.nav-node.active {
  padding-right: 44px;
}
.nav-node.active .nav-node-circle {
  width: 12px; height: 12px; background: #000; border: 2px solid var(--color-accent);
  box-shadow: 0 0 10px rgba(97, 177, 214, 0.4);
}
.nav-node.active .nav-label { opacity: 1; transform: translateX(0); }

/* 5. 中央卡片 */
.content-card {
  background: rgba(10, 10, 10, 0.6); backdrop-filter: blur(5px);
  border: 1px solid var(--border-tech); padding: 3rem; max-width: 600px;
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

/* 内容文本 */
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

.desc-text { font-size: 0.9rem; line-height: 1.6; color: #888; margin-bottom: 2rem; min-height: 60px; }

/* AI 按钮 */
.ai-btn {
  border: 1px solid rgba(255,255,255,0.2); color: #fff; background: transparent;
  padding: 10px 20px; font-size: 0.7rem; letter-spacing: 0.1em; cursor: pointer;
  transition: all 0.3s; display: inline-flex; align-items: center; gap: 8px;
}
.ai-btn:hover { border-color: var(--color-accent); color: var(--color-accent); box-shadow: 0 0 15px rgba(97, 177, 214, 0.2); }

/* 6. 底部栏 */
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