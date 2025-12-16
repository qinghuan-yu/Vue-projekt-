import { Application, Graphics } from 'pixi.js';

export function usePixiApp() {
  let app;
  const particles = [];
  const graphics = new Graphics();
  
  // --- 参数配置 ---
  const PARTICLE_COUNT = 300;          // 粒子数量
  const MAX_CONNECTION_DISTANCE = 200; // 连线阈值
  const DISTANCE_GROWTH_TIME = 15000;   // 连线范围展开时间
  
  const LINE_COLOR = 0x61b1d6;       
  const SCREEN_PADDING = 150; 
  const FADE_IN_SPEED = 0.015; 

  const COLOR_ACCENT = 0x61b1d6; 
  const COLOR_DARK_1 = 0x333333;
  const COLOR_DARK_2 = 0x555555;

  // 鼠标交互参数
  const MOUSE_RADIUS = 60;     // 鼠标影响范围加大，手感更明显
  const MOUSE_FORCE = 2;      // 斥力强度
  const RETURN_SPEED = 0.04;    // 粒子回归原位置的阻尼系数

  let startTime = null; 
  let mouseX = -9999;
  let mouseY = -9999;

  class Particle {
    constructor(w, h) {
      this.init(w, h, true); 
    }

    init(w, h, initial = false) {
      // 1. 运动基础属性
      this.baseVx = (Math.random() - 0.5) * 0.6;
      this.baseVy = (Math.random() - 0.5) * 0.6;
      
      // 当前速度 (会被斥力改变)
      this.vx = this.baseVx;
      this.vy = this.baseVy;

      this.radius = Math.random() * 2 + 1;
      
      // 2. 颜色与透明度
      const rand = Math.random();
      if (rand > 0.9) {
        this.baseColor = COLOR_ACCENT;
        this.maxAlpha = 0.9;
      } else if (rand > 0.6) {
        this.baseColor = COLOR_DARK_1;
        this.maxAlpha = 0.5;
      } else {
        this.baseColor = COLOR_DARK_2;
        this.maxAlpha = 0.4;
      }

      // 3. 呼吸效果参数 (新增)
      // 随机相位，保证粒子不同时闪烁
      this.breathPhase = Math.random() * Math.PI * 2; 
      // 呼吸速度 (0.02 ~ 0.05)
      this.breathSpeed = 0.02 + Math.random() * 0.03; 
      // 呼吸幅度 (相对于 maxAlpha 的比例)
      this.breathAmp = 0.3 + Math.random() * 0.2; 

      this.x = Math.random() * w;
      this.y = Math.random() * h;

      this.fadeInFactor = initial ? 1 : 0;
      this.currentRenderAlpha = 0; // 最终用于渲染的透明度
    }

    update(w, h) {
      // --- A. 鼠标斥力逻辑 ---
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const distSq = dx * dx + dy * dy; // 使用平方距离减少开方运算，稍微优化性能

      // 如果在鼠标范围内 (200*200 = 40000)
      if (distSq < MOUSE_RADIUS * MOUSE_RADIUS) {
        const dist = Math.sqrt(distSq);
        const forceFactor = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const angle = Math.atan2(dy, dx);
        
        this.vx += Math.cos(angle) * forceFactor * MOUSE_FORCE;
        this.vy += Math.sin(angle) * forceFactor * MOUSE_FORCE;
      }

      // --- B. 速度回归 (弹性阻尼) ---
      this.vx += (this.baseVx - this.vx) * RETURN_SPEED;
      this.vy += (this.baseVy - this.vy) * RETURN_SPEED;

      // --- C. 位置更新 ---
      this.x += this.vx;
      this.y += this.vy;

      // --- D. 呼吸与透明度计算 ---
      if (this.fadeInFactor < 1) {
        this.fadeInFactor += FADE_IN_SPEED;
        if (this.fadeInFactor > 1) this.fadeInFactor = 1;
      }

      // 边界淡出
      let edgeFadeFactor = 1;
      if (this.x < 0) edgeFadeFactor = Math.min(1, 1 - Math.abs(this.x) / SCREEN_PADDING);
      else if (this.x > w) edgeFadeFactor = Math.min(1, 1 - (this.x - w) / SCREEN_PADDING);
      if (this.y < 0) edgeFadeFactor = Math.min(1, 1 - Math.abs(this.y) / SCREEN_PADDING);
      else if (this.y > h) edgeFadeFactor = Math.min(1, 1 - (this.y - h) / SCREEN_PADDING);

      // 呼吸正弦波: 结果在 (1 - amp) 到 1 之间波动
      this.breathPhase += this.breathSpeed;
      const breathFactor = 1 - (Math.sin(this.breathPhase) * 0.5 + 0.5) * this.breathAmp;

      // 综合计算最终透明度
      this.currentRenderAlpha = this.maxAlpha * edgeFadeFactor * this.fadeInFactor * breathFactor;

      // --- E. 边界重置 ---
      const isDead = 
        this.x < -SCREEN_PADDING || 
        this.x > w + SCREEN_PADDING || 
        this.y < -SCREEN_PADDING || 
        this.y > h + SCREEN_PADDING;

      if (isDead) {
        this.init(w, h, false); 
      }
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
    
    if (startTime === null) startTime = performance.now();
    const now = performance.now();
    const elapsed = now - startTime;
    // 缓动展开连线距离
    const progress = Math.min(elapsed / DISTANCE_GROWTH_TIME, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
    const currentConnectionDistance = easeProgress * MAX_CONNECTION_DISTANCE;

    graphics.clear();
    const w = app.screen.width;
    const h = app.screen.height;

    // 1. 更新并绘制粒子
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update(w, h);

      if (p.currentRenderAlpha <= 0.01) continue;

      graphics.circle(p.x, p.y, p.radius)
              .fill({ color: p.baseColor, alpha: p.currentRenderAlpha });
    }

    if (currentConnectionDistance < 5) return;

    // 2. 绘制连线
    // 使用双重循环检查距离
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      if (p1.currentRenderAlpha <= 0.05) continue;

      // j = i + 1 避免重复连线
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        if (p2.currentRenderAlpha <= 0.05) continue;
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        
        // 简单的包围盒检测，优化性能
        if (Math.abs(dx) > currentConnectionDistance || Math.abs(dy) > currentConnectionDistance) continue;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < currentConnectionDistance) {
          // 连线透明度：距离越近越亮，且受到两端粒子本身透明度(含呼吸)的影响
          const distAlpha = 1 - (dist / currentConnectionDistance);
          // 取两个粒子透明度的较小值，乘上距离系数
          const finalAlpha = distAlpha * Math.min(p1.currentRenderAlpha, p2.currentRenderAlpha) * 0.8;

          if (finalAlpha > 0.02) {
             graphics.moveTo(p1.x, p1.y)
                     .lineTo(p2.x, p2.y)
                     .stroke({ 
                        width: 1, 
                        color: LINE_COLOR, 
                        alpha: finalAlpha 
                     });
          }
        }
      }
    }
  }

  // 使用 window 监听，确保鼠标在UI元素上时背景依然有反应
  const handleMouseMove = (e) => {
    if (!app || !app.canvas) return;
    const rect = app.canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  };

  const handleMouseLeave = () => {
    mouseX = -9999;
    mouseY = -9999;
  };

  const init = async (container) => {
    startTime = null; 

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
    app.stage.addChild(graphics);

    createParticles(app.screen.width, app.screen.height);
    
    // 监听 window 的鼠标移动，体验更好
    window.addEventListener('mousemove', handleMouseMove);
    // 监听 canvas 的移出（或者也可以监听 window 的 mouseout）
    document.body.addEventListener('mouseleave', handleMouseLeave);
    
    app.renderer.on('resize', () => {
       createParticles(app.screen.width, app.screen.height);
    });

    app.ticker.add(animate);
  };

  const destroy = () => {
    if (app) {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      app.destroy(true, { children: true, texture: true, basePath: true });
    }
    startTime = null; 
  };

  return {
    init,
    destroy,
  };
}