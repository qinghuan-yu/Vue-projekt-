import { Application } from 'pixi.js';
import { useAdvancedParticles } from './useAdvancedParticles.js';

let app = null;
let particles = null;

export function usePixiApp() {
  
  // 暴露给Vue组件的接口
  let exposedMorphToShapes = null;

  const init = async (container) => {
    // 防止重复初始化
    if (app) {
      return { morphToShapes: exposedMorphToShapes };
    }

    app = new Application();
    await app.init({
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundAlpha: 0,
      resizeTo: container,
      antialias: true,
      preference: 'webgl',
    });

    container.appendChild(app.canvas);

    // 初始化高级粒子系统
    particles = useAdvancedParticles(app);
    particles.init();

    // 当窗口大小改变时，Pixi的resizeTo会自动处理画布
    // 我们这里不需要额外操作，因为ParticleMorpher内部的逻辑是基于app.screen的
    
    // 保存控制函数，以便在init和destroy之间共享
    exposedMorphToShapes = particles.morphToShape;

    return { morphToShapes: exposedMorphToShapes };
  };

  const destroy = () => {
    if (particles) {
      particles.destroy();
      particles = null;
    }
    if (app) {
      app.destroy(true, { children: true, texture: true, basePath: true });
      app = null;
    }
    exposedMorphToShapes = null;
  };

  return {
    init,
    destroy,
  };
}
