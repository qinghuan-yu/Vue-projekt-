import { Graphics } from 'pixi.js';

// --- 1. 设备检测与动态配置 ---
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 移动端降级配置：减少粒子数，增大采样间距
const PARTICLE_COUNT = isMobile ? 3000 : 6000; 
const SAMPLING_STEP = isMobile ? 3 : 2; 

// 粒子尺寸
const PARTICLE_SIZE_MIN = isMobile ? 1.0 : 0.8;
const PARTICLE_SIZE_MAX = isMobile ? 2.0 : 1.5;

// --- 神经网络 (NETWORK) 呼吸动画配置 ---
const NETWORK_CONFIG = {
    MAX_COUNT: isMobile ? 150 : 300,        // 网络节点最大数量
    MAX_DIST: isMobile ? 150 : 200,         // 最大连线距离
    GROWTH_TIME: 4000,                      // 初始加载：从0增长到最大值的时间 (ms)
    
    // 呼吸波动配置 (正弦波)
    // 波动范围：在 Max 和 Max * RATIO 之间变化
    MIN_RATIO: 0.5,                         // 最小值为最大值的 50%
    
    // 频率 (值越小变化越慢)
    FREQ_COUNT: 0.0008,                     // 粒子数量变化的频率
    FREQ_DIST: 0.0004,                      // 连线距离变化的频率 (两者不同步)
    
    LINE_COLOR: 0x61b1d6,
    SCREEN_PADDING: 100,
    MOUSE_RADIUS: 80,
    MOUSE_FORCE: 2,
    RETURN_SPEED: 0.04
};

// --- 变形 (MORPH) 配置 ---
const MORPH_CONFIG = {
    DRAG: 0.50,               // 阻力：0.9 代表空气摩擦，越小停得越快
    EASE: 0.08,               // 弹簧拉力：越小越软，越大归位越快
    
    // 斥力配置 (增强版)
    MOUSE_REPULSION_RADIUS: 50,   // 斥力半径 (像素)
    MOUSE_REPULSION_FORCE: 1,    // 斥力强度 (倍率)
    
    // 随机扰动 (让文字看起来在微颤，像全息投影)
    JITTER: 0.02 
};

// --- 颜色配置 ---
const COLOR_ACCENT = 0x61b1d6; // 默认科技蓝
const COLOR_DARK_1 = 0x333333;
const COLOR_DARK_2 = 0x555555;

// 工具：洗牌算法
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class Particle {
    constructor(w, h) {
        this.init(w, h, true);
    }
    
    init(w, h, initial = false) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.radius = Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN;
        this.currentRenderAlpha = 0;
        this.visible = false; // 默认为 false，由管理器控制显示
        
        this.vx = 0;
        this.vy = 0;

        // 基础漂浮速度
        this.baseVx = (Math.random() - 0.5) * 0.6;
        this.baseVy = (Math.random() - 0.5) * 0.6;

        // 随机分配基础颜色 (背景深色粒子)
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

        this.currentColor = this.baseColor;
        this.targetColor = this.baseColor;

        // 呼吸闪烁参数
        this.breathPhase = Math.random() * Math.PI * 2;
        this.breathSpeed = 0.02 + Math.random() * 0.03;
        
        this.fadeInFactor = initial ? 0 : 0; // 初始为0，慢慢浮现

        this.targetX = this.x;
        this.targetY = this.y;
    }

    // --- 模式 1: 网络漂浮 ---
    updateNetwork(w, h, mouseX, mouseY) {
        // 1. 物理运动
        this.vx += (this.baseVx - this.vx) * NETWORK_CONFIG.RETURN_SPEED;
        this.vy += (this.baseVy - this.vy) * NETWORK_CONFIG.RETURN_SPEED;

        // 鼠标排斥/吸引
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < NETWORK_CONFIG.MOUSE_RADIUS * NETWORK_CONFIG.MOUSE_RADIUS) {
            const dist = Math.sqrt(distSq);
            const forceFactor = (NETWORK_CONFIG.MOUSE_RADIUS - dist) / NETWORK_CONFIG.MOUSE_RADIUS;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * forceFactor * NETWORK_CONFIG.MOUSE_FORCE;
            this.vy += Math.sin(angle) * forceFactor * NETWORK_CONFIG.MOUSE_FORCE;
        }

        this.x += this.vx;
        this.y += this.vy;

        // 2. 边界检查 (无限循环)
        const pad = NETWORK_CONFIG.SCREEN_PADDING;
        if (this.x < -pad) this.x = w + pad;
        else if (this.x > w + pad) this.x = -pad;
        if (this.y < -pad) this.y = h + pad;
        else if (this.y > h + pad) this.y = -pad;

        // 3. Alpha 动画 (浮现 + 呼吸)
        if (this.fadeInFactor < 1) this.fadeInFactor += 0.02;
        
        this.breathPhase += this.breathSpeed;
        const breathFactor = 0.5 + 0.5 * Math.sin(this.breathPhase); // 0.5 ~ 1.0
        
        this.currentRenderAlpha = this.maxAlpha * this.fadeInFactor * breathFactor;

        // 4. 颜色回归基础色 (Lerp)
        if (this.currentColor !== this.baseColor) {
            this.currentColor = this.lerpColor(this.currentColor, this.baseColor, 0.05);
        }
    }

    // --- 模式 2: 图片/形状构成 ---
    // --- 模式 2: 图片/形状构成 (高互动版) ---
    updateMorph(mouseX, mouseY) {
        // 1. 计算与目标位置的距离 (弹簧拉力)
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        // 基础拉力：让粒子飞向目标
        let ax = dx * MORPH_CONFIG.EASE;
        let ay = dy * MORPH_CONFIG.EASE;

        // 2. 计算鼠标斥力
        // 只有当鼠标在画布内时才计算
        if (mouseX > -9000) {
            const mDx = this.x - mouseX;
            const mDy = this.y - mouseY;
            const distSq = mDx * mDx + mDy * mDy;
            const radiusSq = MORPH_CONFIG.MOUSE_REPULSION_RADIUS * MORPH_CONFIG.MOUSE_REPULSION_RADIUS;

            // 如果鼠标进入斥力范围
            if (distSq < radiusSq) {
                // 计算斥力因子：距离中心越近，力越大 (0.0 ~ 1.0)
                const dist = Math.sqrt(distSq);
                let force = (MORPH_CONFIG.MOUSE_REPULSION_RADIUS - dist) / MORPH_CONFIG.MOUSE_REPULSION_RADIUS;
                
                // 使用指数函数让斥力中心更猛烈，边缘更柔和
                force = Math.pow(force, 2) * MORPH_CONFIG.MOUSE_REPULSION_FORCE;

                // 叠加斥力到加速度
                ax += mDx * force;
                ay += mDy * force;
            }
        }

        // 3. 添加微小的随机扰动 (全息杂色感)
        ax += (Math.random() - 0.5) * MORPH_CONFIG.JITTER;
        ay += (Math.random() - 0.5) * MORPH_CONFIG.JITTER;

        // 4. 物理积分 (速度 + 加速度 + 阻力)
        this.vx += ax;
        this.vy += ay;
        
        this.vx *= MORPH_CONFIG.DRAG;
        this.vy *= MORPH_CONFIG.DRAG;
        
        this.x += this.vx;
        this.y += this.vy;

        // 5. 颜色渐变 (保持不变)
        this.currentColor = this.lerpColor(this.currentColor, this.targetColor, 0.1);

        // 6. 快速显形逻辑
        if (this.fadeInFactor < 1) this.fadeInFactor += 0.05;
        this.currentRenderAlpha = 1.0 * this.fadeInFactor; 
    }

    // 重置并随机散开 (修复：不再需要 w, h 参数)
    releaseToNetwork() {
        // 不重置位置，只赋予随机速度，让它从当前形状位置散开
        this.baseVx = (Math.random() - 0.5) * 1.5; // 散开速度稍快
        this.baseVy = (Math.random() - 0.5) * 1.5;
        this.vx = this.baseVx * 5; // 爆发初速度
        this.vy = this.baseVy * 5;
        this.targetColor = this.baseColor;
    }

    moveTo(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.visible = true;
        this.vx = 0;
        this.vy = 0;
        // 这里的 targetColor 会在外部被 scanCanvas 赋予
    }

    // 辅助：颜色插值
    lerpColor(c1, c2, t) {
        const r1 = (c1 >> 16) & 0xFF;
        const g1 = (c1 >> 8) & 0xFF;
        const b1 = c1 & 0xFF;
        const r2 = (c2 >> 16) & 0xFF;
        const g2 = (c2 >> 8) & 0xFF;
        const b2 = c2 & 0xFF;

        const r = r1 + (r2 - r1) * t;
        const g = g1 + (g2 - g1) * t;
        const b = b1 + (b2 - b1) * t;
        
        return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
    }
}


export function useAdvancedParticles(app) {
    const graphics = new Graphics();
    const particles = [];
    let state = 'NETWORK';
    
    // 动画计时器
    let startTime = null; 
    // [修复] 删除了未使用的 networkTime 变量

    let mouseX = -9999;
    let mouseY = -9999;
    
    // 离屏渲染 (用于解析图片)
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    function init() {
        app.stage.addChild(graphics);
        startTime = performance.now();
        // [修复] 删除 networkTime 赋值
        particles.length = 0;
        
        const w = app.screen.width;
        const h = app.screen.height;
        
        // 初始化对象池
        for(let i=0; i<PARTICLE_COUNT; i++) {
            particles.push(new Particle(w, h));
        }

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);
        app.ticker.add(animate);
    }
    
    function destroy() {
        app.ticker.remove(animate);
        window.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseleave', handleMouseLeave);
        graphics.destroy();
        particles.length = 0;
    }

    function animate() {
        graphics.clear();
        const w = app.screen.width;
        const h = app.screen.height;

        if (state === 'NETWORK') {
            const now = performance.now();
            const elapsed = now - startTime;
            updateAndDrawNetwork(w, h, elapsed);
        } else if (state === 'MORPH') {
            updateAndDrawMorph();
        }
    }

    // --- 核心逻辑：带正弦波动的网络动画 ---
    function updateAndDrawNetwork(w, h, elapsed) {
        let currentTargetCount, currentConnDist;

        // 阶段 1: 初始增长期 (0 -> Max)
        if (elapsed < NETWORK_CONFIG.GROWTH_TIME) {
            const progress = elapsed / NETWORK_CONFIG.GROWTH_TIME;
            const ease = 1 - Math.pow(1 - progress, 3); // Cubic Out
            
            currentTargetCount = Math.floor(ease * NETWORK_CONFIG.MAX_COUNT);
            currentConnDist = ease * NETWORK_CONFIG.MAX_DIST;
        } 
        // 阶段 2: 稳定正弦波动期 (Max <-> 0.5 Max)
        else {
            // 我们使用一个独立的时间累加器，确保波形平滑
            // elapsed 减去 GROWTH_TIME 得到波动开始后的时间
            const waveTime = elapsed - NETWORK_CONFIG.GROWTH_TIME;
            
            // 计算粒子数量的波动因子 (0.5 ~ 1.0)
            // Math.sin 的范围是 -1 ~ 1
            // 我们想要 range: [MIN_RATIO, 1.0]
            // Center = (1 + MIN) / 2
            // Amplitude = (1 - MIN) / 2
            const center = (1 + NETWORK_CONFIG.MIN_RATIO) / 2; // 0.75
            const amp = (1 - NETWORK_CONFIG.MIN_RATIO) / 2;    // 0.25
            
            // 数量因子
            const countFactor = center + amp * Math.sin(waveTime * NETWORK_CONFIG.FREQ_COUNT);
            currentTargetCount = Math.floor(NETWORK_CONFIG.MAX_COUNT * countFactor);

            // 距离因子 (注意使用了不同的频率 FREQ_DIST)
            const distFactor = center + amp * Math.sin(waveTime * NETWORK_CONFIG.FREQ_DIST);
            currentConnDist = NETWORK_CONFIG.MAX_DIST * distFactor;
        }

        // 渲染循环
        let activeCount = 0;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            // 只有前 currentTargetCount 个粒子是活跃的
            if (i < currentTargetCount) {
                if (!p.visible) {
                    // 如果刚被激活，重置一下状态
                    p.visible = true; 
                    p.fadeInFactor = 0; // 让它慢慢显示出来
                }
                activeCount++;
            } else {
                p.visible = false;
                continue; // 跳过不渲染
            }

            p.updateNetwork(w, h, mouseX, mouseY);

            // 绘制点
            if (p.currentRenderAlpha > 0.01) {
                graphics.circle(p.x, p.y, p.radius).fill({ color: p.currentColor, alpha: p.currentRenderAlpha });
            }
        }
        
        // 绘制连线 (只连接活跃粒子)
        // 优化：双重循环只遍历 activeCount
        if (currentConnDist < 5) return;

        for (let i = 0; i < activeCount; i++) {
            const p1 = particles[i];
            if (p1.currentRenderAlpha <= 0.05) continue;

            for (let j = i + 1; j < activeCount; j++) {
                const p2 = particles[j];
                if (p2.currentRenderAlpha <= 0.05) continue;

                // 简单的距离剔除
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                if (Math.abs(dx) > currentConnDist || Math.abs(dy) > currentConnDist) continue;

                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < currentConnDist) {
                    const distAlpha = 1 - (dist / currentConnDist);
                    // 连线透明度 = 距离因子 * 粒子透明度
                    const finalAlpha = distAlpha * Math.min(p1.currentRenderAlpha, p2.currentRenderAlpha) * 0.8;
                    
                    if (finalAlpha > 0.02) {
                        graphics.moveTo(p1.x, p1.y)
                                .lineTo(p2.x, p2.y)
                                .stroke({ width: 1, color: NETWORK_CONFIG.LINE_COLOR, alpha: finalAlpha });
                    }
                }
            }
        }
    }
    
    function updateAndDrawMorph() {
        for (const p of particles) {
            if (p.visible) {
                p.updateMorph(mouseX, mouseY);
                if (p.currentRenderAlpha > 0.01) {
                    graphics.circle(p.x, p.y, p.radius).fill({ color: p.currentColor, alpha: p.currentRenderAlpha });
                }
            }
        }
    }

    function handleMouseMove(e) {
        if (!app.canvas) return;
        const rect = app.canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }
    function handleMouseLeave() {
        mouseX = -9999;
        mouseY = -9999;
    }

    // --- 资源解析：Ark-Imitate 风格的高精度扫描 ---
    function getPointsFromSource(source, options = {}) {
        return new Promise((resolve) => {
            const { type = 'text', scale = 1, color = '#FFFFFF' } = options;
            
            if (type === 'image') {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = source;
                img.onload = () => {
                    // 计算缩放后尺寸
                    const scaledWidth = Math.floor(img.width * scale);
                    const scaledHeight = Math.floor(img.height * scale);
                    
                    offscreenCanvas.width = scaledWidth;
                    offscreenCanvas.height = scaledHeight;
                    // 平滑绘制
                    offscreenCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                    resolve(scanCanvas(scaledWidth, scaledHeight));
                };
                img.onerror = (err) => {
                    console.error('Image failed to load:', source, err);
                    resolve([]);
                }
            } else { // text
                const fontSize = options.fontSize || 120;
                const fontFamily = options.fontFamily || 'Arial Black, Arial'; // 用粗体效果更好
                offscreenCtx.font = `bold ${fontSize}px ${fontFamily}`;
                const textMetrics = offscreenCtx.measureText(source);
                
                const w = Math.ceil(textMetrics.width);
                const h = Math.ceil(fontSize * 1.2);

                offscreenCanvas.width = w;
                offscreenCanvas.height = h;
                
                offscreenCtx.font = `bold ${fontSize}px ${fontFamily}`;
                offscreenCtx.fillStyle = color;
                offscreenCtx.textBaseline = 'middle';
                offscreenCtx.textAlign = 'center';
                offscreenCtx.fillText(source, w / 2, h / 2);

                resolve(scanCanvas(w, h));
            }
        });
    }

    // --- 核心扫描算法 (集成自 Ark-Particle-Imitate) ---
    function scanCanvas(width, height) {
        const points = [];
        const imageData = offscreenCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // 根据设备动态调整步长
        const step = SAMPLING_STEP;

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                // 核心判定：
                // 1. Alpha > 0 (不是完全透明)
                // 2. 亮度 > 20 (过滤掉纯黑背景，这解决了你之前二维码黑块的问题)
                const brightness = (r + g + b) / 3;
                
                if (a > 50 && brightness > 30) {
                    // 提取颜色
                    const color = (r << 16) | (g << 8) | b; 
                    
                    points.push({ 
                        x, 
                        y, 
                        color // 将颜色数据绑定到坐标点上
                    });
                }
            }
        }
        return points;
    }

    async function morphToShapes(configs) {
        const w = app.screen.width;
        const h = app.screen.height;

        // 1. 恢复到网络状态
        if (!configs || configs.length === 0) {
            if (state === 'NETWORK') return; 
            state = 'NETWORK';
            startTime = performance.now(); // 重置时间以触发 Growth 动画
            
            // 释放所有粒子，[修复] 不再传递参数
            for (const p of particles) {
                if(p.visible) p.releaseToNetwork();
            }
            return;
        }

        state = 'MORPH';
        
        // 2. 解析所有配置
        const shapesData = await Promise.all(
            configs.map(config => 
                getPointsFromSource(config.source, config.options)
                .then(points => {
                    if (points.length === 0) return null;
                    const bounds = {
                        minX: Math.min(...points.map(p => p.x)),
                        maxX: Math.max(...points.map(p => p.x)),
                        minY: Math.min(...points.map(p => p.y)),
                        maxY: Math.max(...points.map(p => p.y)),
                    };
                    return { 
                        points, 
                        width: bounds.maxX - bounds.minX, 
                        height: bounds.maxY - bounds.minY,
                        bounds,
                        type: config.options.type || 'text' 
                    };
                })
            )
        );

        const validShapes = shapesData.filter(Boolean);
        if (validShapes.length === 0) {
            morphToShapes([]);
            return;
        }
        
        // --- 智能布局 (Smart Layout) ---
        const qrShapes = validShapes.filter(s => s.type === 'image');
        const textShapes = validShapes.filter(s => s.type === 'text');

        let particleIndex = 0;
        const centerX = w / 2;
        const centerY = h / 2;
        
        // 针对移动端的布局调整
        const centerSafeZone = isMobile ? 0 : 450; 
        const qrOffset = isMobile ? -100 : -50;
        const textOffset = isMobile ? 150 : 220;

        // A. 左侧二维码
        if (qrShapes[0]) {
            const shape = qrShapes[0];
            // 移动端若有二维码，居中显示；PC端偏左
            const tx = isMobile ? centerX - shape.width/2 : centerX - (centerSafeZone / 2) - shape.width;
            const ty = centerY - (shape.height / 2) + qrOffset;
            fillParticles(shape, tx, ty);
        }

        // B. 右侧二维码 (移动端通常只显示一个，这里若有第二个则不显示或堆叠，视需求而定)
        if (qrShapes[1] && !isMobile) {
            const shape = qrShapes[1];
            const tx = centerX + (centerSafeZone / 2);
            const ty = centerY - (shape.height / 2) + qrOffset;
            fillParticles(shape, tx, ty);
        }

        // C. 底部文字
        if (textShapes[0]) {
            const shape = textShapes[0];
            const tx = centerX - (shape.width / 2);
            const ty = centerY + textOffset;
            fillParticles(shape, tx, ty);
        }

        function fillParticles(shape, startX, startY) {
            shuffleArray(shape.points);
            // 遍历形状的点
            for (const point of shape.points) {
                if (particleIndex < particles.length) {
                    const p = particles[particleIndex++];
                    const tx = point.x + (startX - shape.bounds.minX);
                    const ty = point.y + (startY - shape.bounds.minY);
                    
                    p.moveTo(tx, ty);
                    
                    // 核心整合：应用图片原色
                    if (point.color !== undefined) {
                        p.targetColor = point.color;
                    } else {
                        p.targetColor = COLOR_ACCENT;
                    }
                }
            }
        }

        // 隐藏多余粒子
        for (let i = particleIndex; i < particles.length; i++) {
            particles[i].visible = false;
        }
    }

    return {
        init,
        destroy,
        morphToShapes
    };
}