<template>
  <div ref="pixiContainer" class="pixi-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { usePixiApp } from '@/composables/usePixiApp.js';
import qqQrCode from '@/assets/QQ.png';
import wechatQrCode from '@/assets/WeChat.png';

const pixiContainer = ref(null);
const { init, destroy } = usePixiApp();
let morphToShapes = null;

onMounted(async () => {
  if (pixiContainer.value) {
    const appControl = await init(pixiContainer.value);
    morphToShapes = appControl.morphToShapes;
    
    // Define the shapes to display
    const shapes = [
      {
        source: qqQrCode,
        options: {
          type: 'image',
          scale: 0.8, // Adjust scale as needed
        }
      },
      {
        source: wechatQrCode,
        options: {
          type: 'image',
          scale: 0.8, // Adjust scale as needed
        }
      },
      {
        source: 'Reliarc.me@outlook.com',
        options: {
          type: 'text',
          fontSize: 48, // Adjust font size as needed
          fontFamily: 'Arial',
          color: '#61b1d6'
        }
      }
    ];

    if (morphToShapes) {
      morphToShapes(shapes);
    }
  }
});

onUnmounted(() => {
  // Go back to network mode before destroying
  if (morphToShapes) {
    morphToShapes([]);
  }
  destroy();
});
</script>

<style scoped>
.pixi-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1; /* Place it behind other content if necessary */
}
</style>
