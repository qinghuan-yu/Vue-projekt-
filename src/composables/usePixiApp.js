import { Application, Graphics } from 'pixi.js';

export function usePixiApp() {
  let app;
  const particles = [];
  const graphics = new Graphics();
  
  // 参数配置
  const PARTICLE_COUNT = 150;        // 粒子数量 (如果卡顿可减少)
  const CONNECTION_DISTANCE = 120;   // 连线距离 (越大连线越多)
  const LINE_COLOR = 0x61b1d6;       // 连线颜色 (核心蓝)

  // 颜色定义
  const COLOR_ACCENT = 0x61b1d6; 
  const COLOR_DARK_1 = 0x333333;
  const COLOR_DARK_2 = 0x555555;

  class Particle {
    constructor(w, h) {
      this.init(w, h);
    }

    init(w, h) {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = (Math.random() - 0.5) * 0.4; // 速度
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1; // 半径 1-3
      
      // 颜色随机逻辑
      const rand = Math.random();
      if (rand > 0.9) {
        this.color = COLOR_ACCENT;
        this.alpha = 0.9;
      } else if (rand > 0.6) {
        this.color = COLOR_DARK_1; // 深灰
        this.alpha = 0.5;
      } else {
        this.color = COLOR_DARK_2; // 浅灰
        this.alpha = 0.4;
      }
    }

    update(w, h) {
      this.x += this.vx;
      this.y += this.vy;

      // 边界循环 (从左边出，从右边进)
      if (this.x < 0) this.x = w;
      if (this.x > w) this.x = 0;
      if (this.y < 0) this.y = h;
      if (this.y > h) this.y = 0;
    }
  }

  function createParticles(width, height) {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle(width, height));
    }
  }

  function animate() {
    if (!app || !app.renderer) return;
    
    // 1. 清除上一帧
    graphics.clear();
    
    const w = app.screen.width;
    const h = app.screen.height;

    // 2. 更新并绘制所有粒子
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update(w, h);

      // PixiJS v8 新语法: 使用 .circle().fill()
      graphics.circle(p.x, p.y, p.radius)
              .fill({ color: p.color, alpha: p.alpha });
    }

    // 3. 绘制连线 (PixiJS v8 新语法)
    // 注意：在 v8 中，每一条不同透明度的线都需要单独 stroke
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        
        // 计算距离
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        
        // 简单的碰撞检测优化：如果 x 或 y 轴差距过大，直接跳过开方运算
        if (Math.abs(dx) > CONNECTION_DISTANCE || Math.abs(dy) > CONNECTION_DISTANCE) continue;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          // 计算透明度：距离越近(0)，alpha越趋近 1
          // 距离越远(CONNECTION_DISTANCE)，alpha越趋近 0
          const alpha = 1 - (dist / CONNECTION_DISTANCE);

          // 只有当线条足够亮时才绘制（优化性能并保持视觉整洁）
          if (alpha > 0.05) {
             graphics.moveTo(p1.x, p1.y)
                     .lineTo(p2.x, p2.y)
                     .stroke({ 
                        width: 1, 
                        color: LINE_COLOR, 
                        alpha: alpha * 0.6 // 整体淡一点，防止过于杂乱
                     });
          }
        }
      }
    }
  }

  const init = async (container) => {
    app = new Application();
    
    // 初始化应用
    await app.init({
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundAlpha: 0, // 透明背景
      resizeTo: container,
      antialias: true,    // 抗锯齿，线条更平滑
      preference: 'webgl', // 强制使用 WebGL
    });

    container.appendChild(app.canvas);
    app.stage.addChild(graphics);

    createParticles(app.screen.width, app.screen.height);
    
    // 监听窗口大小变化，重新生成粒子分布
    app.renderer.on('resize', () => {
       createParticles(app.screen.width, app.screen.height);
    });

    app.ticker.add(animate);
  };

  const destroy = () => {
    if (app) {
      app.destroy(true, { children: true, texture: true, basePath: true });
    }
  };

  return {
    init,
    destroy,
  };
}