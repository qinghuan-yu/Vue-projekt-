import { Application, Graphics } from 'pixi.js';

export function usePixiApp() {
  let app;
  const particles = [];
  const graphics = new Graphics();
  
  // --- 参数配置 ---
  const PARTICLE_COUNT = 300;          // 最终粒子总数
  const PARTICLE_GROWTH_TIME = 8000;   // [新增] 粒子数量从0增长到300所需的时间 (毫秒)
  
  const MAX_CONNECTION_DISTANCE = 200; // 连线阈值
  const DISTANCE_GROWTH_TIME = 10000;  // 连线范围展开时间
  
  const LINE_COLOR = 0x61b1d6;       
  const SCREEN_PADDING = 150; 
  const FADE_IN_SPEED = 0.015; 

  const COLOR_ACCENT = 0x61b1d6; 
  const COLOR_DARK_1 = 0x333333;
  const COLOR_DARK_2 = 0x555555;

  // 鼠标交互参数
  const MOUSE_RADIUS = 60;     
  const MOUSE_FORCE = 2;      
  const RETURN_SPEED = 0.04;    

  let startTime = null; 
  let mouseX = -9999;
  let mouseY = -9999;

  class Particle {
    // [修改] 构造函数增加 initial 参数，默认为 false (非初始粒子需淡入)
    constructor(w, h, initial = false) {
      this.init(w, h, initial); 
    }

    init(w, h, initial = false) {
      // 1. 运动基础属性
      this.baseVx = (Math.random() - 0.5) * 0.6;
      this.baseVy = (Math.random() - 0.5) * 0.6;
      
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

      // 3. 呼吸效果参数
      this.breathPhase = Math.random() * Math.PI * 2; 
      this.breathSpeed = 0.02 + Math.random() * 0.03; 
      this.breathAmp = 0.3 + Math.random() * 0.2; 

      this.x = Math.random() * w;
      this.y = Math.random() * h;

      // 如果是 initial=true (比如调整窗口大小时保留的粒子)，则直接显示
      // 如果是 initial=false (动态生成的)，则从0开始淡入
      this.fadeInFactor = initial ? 1 : 0;
      this.currentRenderAlpha = 0; 
    }

    update(w, h) {
      // --- A. 鼠标斥力逻辑 ---
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const distSq = dx * dx + dy * dy; 

      if (distSq < MOUSE_RADIUS * MOUSE_RADIUS) {
        const dist = Math.sqrt(distSq);
        const forceFactor = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const angle = Math.atan2(dy, dx);
        
        this.vx += Math.cos(angle) * forceFactor * MOUSE_FORCE;
        this.vy += Math.sin(angle) * forceFactor * MOUSE_FORCE;
      }

      // --- B. 速度回归 ---
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

      this.breathPhase += this.breathSpeed;
      const breathFactor = 1 - (Math.sin(this.breathPhase) * 0.5 + 0.5) * this.breathAmp;

      this.currentRenderAlpha = this.maxAlpha * edgeFadeFactor * this.fadeInFactor * breathFactor;

      // --- E. 边界重置 ---
      const isDead = 
        this.x < -SCREEN_PADDING || 
        this.x > w + SCREEN_PADDING || 
        this.y < -SCREEN_PADDING || 
        this.y > h + SCREEN_PADDING;

      if (isDead) {
        // 重置时视为新生成的，稍微淡入一下看起来更自然，也可以设为 true 立即出现
        this.init(w, h, false); 
      }
    }
  }

  // [修改] 现在这个函数只负责清空数组，不再一次性填满
  // 填充逻辑移交给了 animate 函数
  function createParticles() {
    particles.length = 0; 
  }

  function animate() {
    if (!app || !app.renderer) return;
    
    if (startTime === null) startTime = performance.now();
    const now = performance.now();
    const elapsed = now - startTime;

    // --- 1. 连线距离缓动 ---
    const distProgress = Math.min(elapsed / DISTANCE_GROWTH_TIME, 1);
    const easeDist = 1 - Math.pow(1 - distProgress, 3); 
    const currentConnectionDistance = easeDist * MAX_CONNECTION_DISTANCE;

    // --- 2. [新增] 粒子数量缓动 ---
    // 计算当前时刻应该有多少个粒子
    const countProgress = Math.min(elapsed / PARTICLE_GROWTH_TIME, 1);
    // 使用 Cubic Ease Out 让增长曲线更自然（前期快，后期慢）
    const easeCount = 1 - Math.pow(1 - countProgress, 3);
    const currentTargetCount = Math.floor(easeCount * PARTICLE_COUNT);

    const w = app.screen.width;
    const h = app.screen.height;

    // 如果当前粒子数少于目标数，补齐粒子
    // 每次循环补充，直到达到当前时刻应有的数量
    while (particles.length < currentTargetCount) {
        // 传入 false，让新产生的粒子执行 fade-in 动画
        particles.push(new Particle(w, h, false));
    }

    graphics.clear();
    
    // --- 3. 更新并绘制粒子 ---
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update(w, h);

      if (p.currentRenderAlpha <= 0.01) continue;

      graphics.circle(p.x, p.y, p.radius)
              .fill({ color: p.baseColor, alpha: p.currentRenderAlpha });
    }

    if (currentConnectionDistance < 5) return;

    // --- 4. 绘制连线 ---
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      if (p1.currentRenderAlpha <= 0.05) continue;

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        if (p2.currentRenderAlpha <= 0.05) continue;
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        
        if (Math.abs(dx) > currentConnectionDistance || Math.abs(dy) > currentConnectionDistance) continue;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < currentConnectionDistance) {
          const distAlpha = 1 - (dist / currentConnectionDistance);
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
    
    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    
    app.renderer.on('resize', () => {
       // 窗口变化时重置粒子数组，如果想要重播动画，可以把 startTime 设为 null
       // 如果希望窗口变化时直接铺满（不重播动画），则不需要操作，只需要 reset 边界逻辑
       // 这里为了简单，选择清空重来
       createParticles(app.screen.width, app.screen.height);
       startTime = null; // 可选：加上这行会在resize时重新播放增长动画
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