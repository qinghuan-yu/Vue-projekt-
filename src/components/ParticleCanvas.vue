<!--<template>-->
<!--  <canvas ref="canvas" class="particle-canvas"></canvas>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  name: "ParticleCanvas",-->
<!--  data() {-->
<!--    return {-->
<!--      canvas: null,-->
<!--      ctx: null,-->
<!--      particles: [],-->
<!--      particleCount: 100, // 粒子数量-->
<!--    };-->
<!--  },-->
<!--  methods: {-->
<!--    initializeCanvas() {-->
<!--      this.canvas = this.$refs.canvas;-->
<!--      this.ctx = this.canvas.getContext("2d");-->

<!--      // 设置 canvas 大小-->
<!--      this.canvas.width = window.innerWidth;-->
<!--      this.canvas.height = window.innerHeight;-->

<!--      // 创建粒子-->
<!--      this.createParticles();-->

<!--      // 开始动画-->
<!--      this.animate();-->
<!--    },-->
<!--    createParticles() {-->
<!--      const { canvas, particleCount } = this;-->

<!--      for (let i = 0; i < particleCount; i++) {-->
<!--        this.particles.push({-->
<!--          x: Math.random() * canvas.width, // 随机横坐标-->
<!--          y: Math.random() * canvas.height, // 随机纵坐标-->
<!--          radius: Math.random() * 3 + 1, // 粒子大小-->
<!--          color: `rgba(255, 255, 255, ${Math.random()})`, // 粒子颜色-->
<!--          speedX: (Math.random() - 0.5) * 2, // 水平方向速度-->
<!--          speedY: (Math.random() - 0.5) * 2, // 垂直方向速度-->
<!--        });-->
<!--      }-->
<!--    },-->
<!--    drawParticles() {-->
<!--      const { ctx, particles } = this;-->

<!--      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // 清空画布-->

<!--      particles.forEach((particle) => {-->
<!--        ctx.beginPath();-->
<!--        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);-->
<!--        ctx.fillStyle = particle.color;-->
<!--        ctx.fill();-->

<!--        // 更新粒子位置-->
<!--        particle.x += particle.speedX;-->
<!--        particle.y += particle.speedY;-->

<!--        // 边界检测-->
<!--        if (particle.x > this.canvas.width || particle.x < 0) particle.speedX *= -1;-->
<!--        if (particle.y > this.canvas.height || particle.y < 0) particle.speedY *= -1;-->
<!--      });-->
<!--    },-->
<!--    animate() {-->
<!--      this.drawParticles();-->
<!--      requestAnimationFrame(this.animate); // 循环调用-->
<!--    },-->
<!--    resizeCanvas() {-->
<!--      this.canvas.width = window.innerWidth;-->
<!--      this.canvas.height = window.innerHeight;-->
<!--    },-->
<!--  },-->
<!--  mounted() {-->
<!--    this.initializeCanvas();-->

<!--    // 窗口大小变化时调整 canvas 尺寸-->
<!--    window.addEventListener("resize", this.resizeCanvas);-->
<!--  },-->
<!--  beforeUnmount() {-->
<!--    window.removeEventListener("resize", this.resizeCanvas);-->
<!--  },-->
<!--};-->

<!--</script>-->

<!--<style scoped>-->
<!--.particle-canvas {-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  display: block;-->
<!--  background-color: rgba(0, 0, 0, 0.8); /* 背景颜色 */-->
<!--  z-index: -1; /* 在内容后面显示 */-->
<!--}-->
<!--</style>-->

<template>
  <div>
    <!-- Canvas 元素用于显示粒子效果 -->
    <canvas id="akCanvas"></canvas>
  </div>
</template>

<script>
// 如果你有相应的粒子类，请确保引入它
import DameDaneParticle from './js/canvasClass';  // 根据实际路径引入

export default {
  name: "ParticleEffectDemo",
  mounted() {
    this.initParticleEffect();
  },
  methods: {
    initParticleEffect() {
      // 获取 canvas DOM 元素
      const canvas = document.getElementById("akCanvas");

      // 创建粒子效果实例
      let DameDaneParticleDemo = new DameDaneParticle(canvas, {
        src: require('@/assets/image/longmen.png'),  // 图片路径
        renderX: 10,  // 渲染时的 X 坐标
        renderY: 100,  // 渲染时的 Y 坐标
        w: 300,  // 图片宽度
        size: 1,  // 粒子大小
        spacing: 1,  // 粒子间距
        validColor: {
          min: 300,  // 有效颜色范围的最小值
          max: 800,  // 有效颜色范围的最大值
          invert: false,  // 是否反转颜色
        },
        effectParticleMode: 'repulsion',  // 粒子效果模式
        Thickness: 25,  // 粒子厚度
      });

      // 如果有播放或其他操作方法，可以调用
      DameDaneParticleDemo.start?.(); // 假设有一个 start 方法来启动动画
    },
  },
};
</script>

<style scoped>
/* 可以根据需求设置 canvas 元素的样式 */
#akCanvas {
  width: 100%;
  height: 200px;  /* 或者自定义大小 */
  //display: block;
  margin: 0 auto;
  z-index: -1; /* 确保不会覆盖导航栏 */
  background-color: #000;  /* 如果需要背景颜色 */
}
</style>
