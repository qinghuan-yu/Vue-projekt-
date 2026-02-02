<template>
  <div ref="container" class="pixi-background"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePixiApp } from '@/composables/usePixiApp';

// 资源导入
import pcbUrl from '@/assets/pcb.png';
import pcb2Url from '@/assets/pcb2.png';
import pianoUrl from '@/assets/piano.png';
import aiUrl from '@/assets/AI.png';
import musicPng from '@/assets/music.png';
import mailPng from '@/assets/mail.png';
import githubPng from '@/assets/github.png';

const container = ref(null);
const route = useRoute();

const { init } = usePixiApp();  // 只解构 init，不要 destroy
let morphToShapes = null;

onMounted(async () => {
  console.log('PixiBackground: Starting initialization...');
  if (container.value) {
    const controls = await init(container.value);
    console.log('PixiBackground: PixiJS initialized', controls);
    morphToShapes = controls.morphToShapes;
    console.log('PixiBackground: morphToShapes assigned', !!morphToShapes);

    // 根据初始路由显示对应效果
    await updateParticlesByRoute(route.path);
  }
});

onUnmounted(() => {
  console.log('PixiBackground: Component unmounting (but NOT destroying global Pixi app)');
  // 注意：不销毁全局 app，因为这是全局单例背景
  // 只清理局部引用
  morphToShapes = null;
});

// 监听路由变化，更新粒子效果（immediate: false 避免初始化前触发）
watch(() => route.path, (newPath) => {
  if (morphToShapes) {
    updateParticlesByRoute(newPath);
  }
}, { immediate: false });

const updateParticlesByRoute = async (path) => {
  console.log('🚀 updateParticlesByRoute called with path:', path);
  if (!morphToShapes) {
    console.error('updateParticlesByRoute: morphToShapes is null!');
    return;
  }

  const commonOptions = { type: 'image', sampleRate: 4 };

  if (path.includes('identity')) {
    // Identity 页面：散点模式
    await morphToShapes([]);
  } else if (path.includes('projects')) {
    // Projects 页面：默认显示 PCB1 (pcbUrl) 在右侧 (0.75)，列表在左侧
    await morphToShapes([
      { source: pcbUrl, options: { ...commonOptions, layoutX: 0.75 } }
    ]);
  } else if (path.includes('contact')) {
    // Contact 页面：显示三个图标
    await morphToShapes([
      { source: musicPng, options: { ...commonOptions, sampleRate: 3 } },
      { source: mailPng, options: { ...commonOptions, sampleRate: 3 } },
      { source: githubPng, options: { ...commonOptions, sampleRate: 3 } }
    ]);
  } else if (path.includes('blog')) {
    // Blog 页面：散点模式
    await morphToShapes([]);
  } else {
    // 默认：散点模式
    await morphToShapes([]);
  }
};

// 暴露方法给外部调用（用于 Projects 页面的项目切换）
const updateProjectImage = async (imageUrl, layoutX = 0.35) => {
  console.log('📸 updateProjectImage called:', { morphToShapes: !!morphToShapes, imageUrl, layoutX });
  if (!morphToShapes) {
    console.error('updateProjectImage: morphToShapes is null!');
    return;
  }
  console.log('📸 Calling morphToShapes with config...');
  const result = await morphToShapes([
    { source: imageUrl, options: { type: 'image', sampleRate: 4, layoutX } }
  ]);
  console.log('📸 morphToShapes completed:', result);
};

defineExpose({
  updateProjectImage
});
</script>

<style scoped>
.pixi-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* z-index is handled by parent/MainLayout to ensure correct stacking context */
  pointer-events: none;
  background: transparent; 
}
</style>
