<template>
  <div id="app" @wheel="handleScroll">
    <div :class="['sidebar-toggle', { 'is-active': isSidebarOpen }]" @click="toggleSidebar">
      MENU
    </div>

    <transition name="fade">
      <div
        class="overlay"
        v-if="isSidebarOpen"
        @click="toggleSidebar"
      ></div>
    </transition>

    <nav :class="['sidebar', { 'is-open': isSidebarOpen }]">
      <div class="sidebar-content">
        <div class="vertical-line"></div>
        <div class="sidebar-buttons">
          <button class="sidebar-button">介绍</button>
          <button class="sidebar-button">合作</button>
          <button class="sidebar-button" @click="navigateToSaturn">3D星系</button>
          <button class="sidebar-button">联系方式</button>
        </div>
      </div>
    </nav>

    <div class="navbar">
      <router-link
        v-for="(item, index) in navItems"
        :key="index"
        :to="item.to"
        class="nav-button"
      >
        <div class="nav-text">
          <span class="cn-text">{{ item.name }}</span>
          <span class="en-text">{{ item.en_name }}</span>
        </div>
      </router-link>
    </div>

    <div class="page-container">
      <hr class="divider" />
      <div class="transition-viewport">
        <router-view v-slot="{ Component }">
            <component :is="Component" class="page-transition-item" />
        </router-view>

        <transition name="info-fade">
          <div v-if="showDescription" class="info-overlay">
            <div class="info-overlay__content">
              <p v-if="$route.path === '/'">在炎国的土地上，巨兽学士揭开亘古巨物的面纱一角；奇人异士在真龙的率领下敕封神明。无论风起云涌，炎国宇内始终安泰祥和。</p>
              <p v-else-if="$route.path === '/川蜀'">天有烘炉，地生五金；山脉层峦叠嶂，建筑依山而建，与自然相映成趣。</p>
              <p v-else-if="$route.path === '/勾吴'">水乡泽国，河网密布；白墙黑瓦，小桥流水，构成江南画卷。</p>
              <p v-else-if="$route.path === '/闽台'">地理环境多样；传统木构架体现农业文明与匠心审美。</p>
              <p v-else-if="$route.path === '/三秦'">山地城市，层峦叠嶂；尚蜀蜀道，百折千回。</p>
              <p v-else-if="$route.path === '/玉门'">风沙古道，关隘雄浑；西域通衢的边塞风情。</p>
            </div>
          </div>
        </transition>
      </div>
      <hr class="divider" />
    </div>

    <div class="info-panel">
      <button class="info-toggle" @click="toggleDescription">
        {{ showDescription ? '关闭' : '信息' }}
      </button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'App',
  data() {
    return {
      isSidebarOpen: false,
      showDescription: false,
      navItems: [
        { to: '/', name: '首页', en_name: 'Index' },
        { to: '/川蜀', name: '川蜀', en_name: 'ChuanShu' },
        { to: '/勾吴', name: '勾吴', en_name: 'GouWu' },
        { to: '/闽台', name: '闽台', en_name: 'MinTai' },
        { to: '/三秦', name: '三秦', en_name: 'SanQin' },
        { to: '/玉门', name: '玉门', en_name: 'YuMen' },
      ],
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    handleScroll(event) {
      const delta = Math.sign(event.deltaY)
      const currentIndex = this.navItems.findIndex(item => item.to === this.$route.path)
      const nextIndex = currentIndex + delta
      if (nextIndex >= 0 && nextIndex < this.navItems.length) {
        this.$router.push(this.navItems[nextIndex].to)
      }
    },
    toggleDescription() {
      this.showDescription = !this.showDescription
    },
    navigateToSaturn() {
      this.$router.push('/saturn-system');
      this.isSidebarOpen = false;
    },
  },
}
</script>
<style>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.transition-viewport {
  position: relative;
  flex-grow: 1;
  z-index: 1;
}

/* 侧边栏开关按钮 (MENU) */
.sidebar-toggle {
  position: fixed; /* 固定位置 */
  top: 20px;
  left: 40px;
  z-index: 1001; /* 置于顶层 */
  cursor: pointer; /* 鼠标指针样式 */
  background: none; /* 无背景 */
  border: none; /* 无边框 */
  font-family: 'Font', sans-serif; /* 字体 */
  font-size: 24px; /* 字体大小 */
  color: #fff; /* 字体颜色 */
  transition: color 0.5s ease; /* 颜色变化的平滑过渡 */
}

/* MENU按钮激活时的样式 */
.sidebar-toggle.is-active {
  color: #61b1d6; /* 激活时文本颜色改变，与导航栏统一 */
}

/* 遮罩层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
  z-index: 999; /* 位于侧边栏下方 */
}

/* 遮罩层淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease; /* 动画时长和缓动函数 */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0; /* 初始和结束状态为透明 */
}

/* 侧边栏容器 */
.sidebar {
  position: fixed;
  left: -360px; /* 初始状态下隐藏在左侧 */
  top: 0;
  height: 100%;
  width: 360px; /* 侧边栏宽度 */
  background: transparent; /* 透明背景 */
  z-index: 1000; /* 层级 */
  transition: left 0.6s ease; /* 左侧位置变化的动画 */
  display: flex;
}

/* 侧边栏打开时的状态 */
.sidebar.is-open {
  left: 0; /* 移动到屏幕左侧边缘 */
}

.sidebar-content {
  display: flex;
  width: 100%;
  position: relative;
}

/* 侧边栏的竖线 */
.vertical-line {
  width: 1px; /* 竖线宽度 */
  background-color: #fff; /* 竖线颜色 */
  position: absolute;
  left: 100%; /* 定位到侧边栏的右边缘 */
  top: 0;
  bottom: 0;
  transform: translateX(-100%);
  transition: transform 0.4s ease; /* 移动动画 */
}

.sidebar.is-open .vertical-line {
  transform: translateX(0);
}

/* 侧边栏内部按钮的容器 */
.sidebar-buttons {
  margin-top: 100px; /* 距离顶部的间距 */
  margin-left: 40px; /* 距离左侧的间距 */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* 侧边栏按钮样式 */
.sidebar-button {
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 90px; /* 按钮之间的垂直间距 */
  font-family: 'Font', sans-serif; /* 字体 */
  font-size: 30px; /* 字体大小 */
  color: #fff; /* 字体颜色 */
  cursor: pointer;
  transform: translateX(-100%); /* 初始状态下向左偏移 */
  opacity: 0; /* 初始状态下透明 */
  transition: transform 0.4s ease, opacity 0.4s ease; /* 移入和淡入动画 */
}

/* 侧边栏打开时，按钮的最终状态 */
.sidebar.is-open .sidebar-button {
  transform: translateX(0); /* 移动到原始位置 */
  opacity: 1; /* 完全不透明 */
}

/* 按钮依次出现的动画 (Staggered Animation) */
.sidebar.is-open .sidebar-button:nth-child(1) {
  transition-delay: 0.1s; /* 第一个按钮的延迟 */
}
.sidebar.is-open .sidebar-button:nth-child(2) {
  transition-delay: 0.3s; /* 第二个按钮的延迟 */
}
.sidebar.is-open .sidebar-button:nth-child(3) {
  transition-delay: 0.5s; /* 第三个按钮的延迟 */
}
.sidebar.is-open .sidebar-button:nth-child(4) {
  transition-delay: 0.7s; /* a new button's delay */
}

/* 当侧边栏打开时，调整主内容区域的样式 */
.page-container {
  transition: filter 0.4s ease; /* 滤镜效果的动画 */
}

/* 使用 ~ 选择器确保无论中间有什么元素，只要.sidebar.is-open存在，就应用样式 */
.sidebar.is-open ~ .page-container {
  filter: grayscale(80%); /* 应用灰度滤镜 */
}
</style>
