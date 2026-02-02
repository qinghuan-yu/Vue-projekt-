import { Application } from 'pixi.js';
import { useAdvancedParticles } from './useAdvancedParticles.js';

/*
  usePixiApp
  - 目的是包装 Pixi `Application` 的创建与销毁，并初始化 `useAdvancedParticles` 粒子系统。
  - init(container): 异步初始化 Pixi，并将 canvas 挂载到传入的 DOM 容器上。
      返回对象包含 `morphToShapes` 控制函数用于触发粒子变形。
  - destroy(): 销毁粒子系统与 Pixi 实例，清理资源。
*/

let app = null;
let particles = null;
let exposedMorphToShapes = null;
let initPromise = null;

export function usePixiApp() {
  const init = async (container) => {
    // If initialization is already in progress, wait for it
    if (initPromise) {
      await initPromise;
      // If we provided a new container and app exists, move it.
      if (app && container && app.canvas.parentNode !== container) {
        container.appendChild(app.canvas);
        app.resizeTo = container;
        app.resize();
      }
      return { morphToShapes: exposedMorphToShapes };
    }

    // Start initialization (lock)
    initPromise = (async () => {
      // If called without container and no app, we can't init
      if (!container && !app) {
        throw new Error("usePixiApp: Cannot initialize without a container.");
      }

      if (app) return; // Should be covered by initPromise check but double check

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

      // 初始化并启动高级粒子系统（内部基于 app.screen 进行布局）
      particles = useAdvancedParticles(app);
      particles.init(); // Sync init

      exposedMorphToShapes = particles.morphToShapes;
    })();

    await initPromise;
    return { morphToShapes: exposedMorphToShapes };
  };

  const destroy = () => {
    if (particles) { particles.destroy(); particles = null; }
    if (app) { app.destroy(true, { children: true, texture: true, basePath: true }); app = null; }
    exposedMorphToShapes = null;
    initPromise = null; // Reset promise
  };

  const getParticleControls = () => {
    return { morphToShapes: exposedMorphToShapes };
  };

  return { init, destroy, getParticleControls };
}
