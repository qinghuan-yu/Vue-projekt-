<template>
  <div id="app" @wheel="handleScroll">
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
  },
}
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.transition-viewport {
  position: relative;
}
</style>
