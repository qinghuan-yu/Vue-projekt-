import { Graphics } from 'pixi.js';

/*
    useAdvancedParticles
    - 目的: 在传入的 Pixi `app` 上渲染一个带网络和形状变形两种模式的高级粒子系统。
    - 导出: { init(), destroy(), morphToShapes(configs) }
        - init(containerApp): 将 graphics 添加到 app.stage 并开始动画
        - destroy(): 停止动画并释放资源
        - morphToShapes(configs): 接受形状配置数组，将粒子排列为文字或图片形状；传入空数组或 null 恢复网络模式
    - 设计要点: 根据设备（isMobile）自动降级参数；支持离屏 canvas 扫描颜色与点位
*/

// --- 1. 设备检测与动态配置 ---
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 移动端降级配置：减少粒子数
const PARTICLE_COUNT = isMobile ? 4000 : 8000; 

// 粒子尺寸（稍微调大，以适应拉大的间距）
const PARTICLE_SIZE_MIN = isMobile ? 1.0 : 1.5;
const PARTICLE_SIZE_MAX = isMobile ? 2.0 : 2.2;

// --- 变形 (MORPH) 配置 ---
const MORPH_CONFIG = {
    DRAG: 0.60,               // 阻力 (Reduced friction slightly to allow more drift, but controlled)
    EASE: 0.03,               // 弹簧拉力 (Lowered significantly for slower aggregation)
    THICKNESS: 50,           // 鼠标排斥力度参数
    
    // 斥力配置 (增强版)
    MOUSE_REPULSION_RADIUS: 50,   // 斥力半径 (像素)
    MOUSE_REPULSION_FORCE: 1,    // 斥力强度 (倍率)
    
    // 随机扰动
    JITTER: 0.02 
};

// --- 颜色配置 ---
const COLOR_ACCENT = 0x999999; // 灰色
const COLOR_DARK_1 = 0x333333; // 深灰
const COLOR_DARK_2 = 0x555555; // 中灰
const COLOR_WARNING = 0xCCCCCC; // 浅灰/白

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
        // 记录原始随机位置 (For Scatter Mode logic reference)
        this.orx = this.x;
        this.ory = this.y;

        this.radius = Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN;
        this.currentRenderAlpha = 0;
        this.visible = false; 
        
        this.vx = 0;
        this.vy = 0;

        // 随机分配基础颜色
        const rand = Math.random();
        if (rand < 0.5) {
            this.baseColor = COLOR_WARNING;
            this.maxAlpha = 0.9;
        } else {
            const sub = Math.random();
            if (sub > 0.8) {
                this.baseColor = COLOR_ACCENT;
                this.maxAlpha = 0.9;
            } else if (sub > 0.4) {
                this.baseColor = COLOR_DARK_1;
                this.maxAlpha = 0.5;
            } else {
                this.baseColor = COLOR_DARK_2;
                this.maxAlpha = 0.4;
            }
        }

        this.currentColor = this.baseColor;
        this.targetColor = this.baseColor;
        this.fadeInFactor = initial ? 0 : 0; 
        
        // 目标位置
        this.targetX = this.x;
        this.targetY = this.y;
        
        this.depth = 0.5 + Math.random(); 
    }

    // --- 统一更新逻辑 (Ref: DameDaneParticle + Pixi Adaptation) ---
    // PolymerizeFlag: true = Form Shape (MORPH), false = Scatter (SCATTER)
    update(w, h, mouseX, mouseY, polymerizeFlag) {
        // --- 1. 计算位移速度 (Spring / Linear Approach) ---
        // Ref: this.spx = (this.nx - this.x) / (ParticlePolymerizeFlag ? 30 : 60);
        
        // 目标位置判定
        const destX = polymerizeFlag ? this.targetX : this.orx; // Use random original pos for scatter
        const destY = polymerizeFlag ? this.targetY : this.ory;

        // 计算基础速度（弹簧）
        // Pixi 实现中我们使用 vx/vy 累加做动量，但为了模仿 Reference 的效果，
        // 我们引入 reference 中的 "Thickness" 逻辑
        
        // 鼠标交互计算
        let finalVx = 0;
        let finalVy = 0;

        if (mouseX > -9000) {
            const curDx = mouseX - this.x;
            const curDy = mouseY - this.y;
            const distSq = curDx * curDx + curDy * curDy;
            
            // Ref: let f = Thickness / d1;
            // Square the thickness as per reference (options.Thickness *= options.Thickness)
            const thicknessSq = MORPH_CONFIG.THICKNESS * MORPH_CONFIG.THICKNESS * 2; // Increase slightly for effect
            
            let f = thicknessSq / distSq;
            if (f < 0.1) f = 0.1;
            if (f > 7) f = 7; // Clamp repulsion

            const angle = Math.atan2(curDy, curDx);
            const vx = f * Math.cos(angle);
            const vy = f * Math.sin(angle);
            
            // "Repulsion" logic (-vx)
            finalVx = -vx; 
            finalVy = -vy;
        }

        // --- 2. 物理积分 ---
        // Ref: let finalX = ((... * Drag) + ((this.orx - this.x) * Ease) / 400
        // 我们将 "Drag" 视为外部力衰减，"Ease" 视为归位弹力
        
        const springX = (destX - this.x) * MORPH_CONFIG.EASE; // Spring force towards target
        const springY = (destY - this.y) * MORPH_CONFIG.EASE;

        // Apply forces
        this.vx += finalVx + springX * 0.5; // Mouse force + Spring force
        this.vy += finalVy + springY * 0.5;
        
        // Friction / Drag
        this.vx *= MORPH_CONFIG.DRAG;
        this.vy *= MORPH_CONFIG.DRAG;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // --- 3. Alpha & Color ---
        
        // Critical Fix: unused particles should fade out
        if (!this.visible) {
             // Force fade out if not marked visible
             this.currentRenderAlpha = this.lerp(this.currentRenderAlpha, 0.0, 0.1);
        } else {
             // Ref: polymerize logic for opacity
             if (!polymerizeFlag) {
                 // Scatter mode fade out or just wait
                 if (this.currentRenderAlpha > 0) this.currentRenderAlpha -= 0.02;
                 // Reset pos if invisible
                 if (this.currentRenderAlpha <= 0) {
                     this.x = destX;
                     this.y = destY;
                     this.vx = 0;
                     this.vy = 0;
                 }
            } else {
                // Form mode fade in
                this.currentRenderAlpha = this.lerp(this.currentRenderAlpha, 1.0, 0.05);
            }
        }

        // Color Lerp
        this.currentColor = this.lerpColor(this.currentColor, this.targetColor, 0.1);
        
        // Radius Logic
        this.radius = isMobile ? 1.0 : 1.2;
    }

    // 重置并随机散开 (Scatter Mode Trigger)
    scatter(w, h) {
        // 重置目标为随机位置 (or just rely on this.orx/ory)
        // Reference code sets nx = Math.random() when !PolymerizeFlag
        this.orx = Math.random() * w;
        this.ory = Math.random() * h;
    }

    moveTo(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.visible = true; // Make visible for processing
        // this.vx = 0; // Don't kill velocity completely, let it flow
        // this.vy = 0;
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

    lerp(a, b, t) {
        return a + (b - a) * t;
    }
}


export function useAdvancedParticles(app) {
    const graphics = new Graphics();
    const particles = [];
    let state = 'SCATTER'; // Default state is SCATTER now

    
    // 动画计时器
    let startTime = null;

    let mouseX = -9999;
    let mouseY = -9999;
    
    // 离屏渲染 (用于解析图片)
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    // --- 交互事件处理 ---
    function handleMouseMove(e) {
        if (!app.view) return;
        const rect = app.view.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    }

    function handleMouseLeave() {
        mouseX = -9999;
        mouseY = -9999;
    }

    // --- 统一动画循环 ---
    function animate() {
        graphics.clear();
        const w = app.screen.width;
        const h = app.screen.height;

        // State determines logic: MORPH (True) or SCATTER (False)
        const polymerizeFlag = (state === 'MORPH');

        particles.forEach(p => {
             // Unified Update
            p.update(w, h, mouseX, mouseY, polymerizeFlag);
            
            // Unified Render
            if (p.currentRenderAlpha > 0.01) {
                graphics.beginFill(p.currentColor, p.currentRenderAlpha);
                graphics.drawCircle(p.x, p.y, p.radius);
                graphics.endFill();
            }
        });
    }

    function init() {
        app.stage.addChild(graphics);
        startTime = performance.now();
        particles.length = 0;
        
        const w = app.screen.width;
        const h = app.screen.height;
        
        // 初始化对象池
        for(let i=0; i<PARTICLE_COUNT; i++) {
            particles.push(new Particle(w, h));
        }

        // Use global window listener for mouse to ensure capture
        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);
        app.ticker.add(animate);
    }
    
    function destroy() {
        app.ticker.remove(animate);
        window.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseleave', handleMouseLeave);
        app.stage.removeChild(graphics);
        graphics.destroy();
        particles.length = 0;
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
                    
                    // [修复] 显式清除画布，防止混色
                    offscreenCtx.clearRect(0, 0, scaledWidth, scaledHeight);
                    
                    // 平滑绘制
                    offscreenCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                    
                    // 针对白底黑码或黑体字，需要反转扫描 (采样黑色部分)
                    // 修改：默认设置为 true，因为用户请求 "采样黑色部分"
                    const shouldInvert = true;
                    resolve(scanCanvas(scaledWidth, scaledHeight, shouldInvert));
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
    function scanCanvas(width, height, invert = false) {
        const points = [];
        const imageData = offscreenCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // 关键点1：加大步长，不要采那么密，给粒子留出缝隙
        const step = 2;

        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                if (a > 50) {
                    const brightness = (r + g + b) / 3;
                    
                    let isTarget = false;
                    // 关键点2：极严格的阈值。
                    // 只有 brightness 小于 50 (非常黑) 才算数，过滤掉模糊边缘
                    if (invert && brightness < 50) { 
                        isTarget = true;
                    } else if (!invert && brightness > 100) {
                        // 提取最亮的像素（中心点），去除边缘灰色杂噪
                        isTarget = true;
                    }

                    if (isTarget) {
                        points.push({ 
                            x, 
                            y, 
                            // 强制统一颜色，避免杂色干扰视觉
                            color: 0x61b1d6
                        });
                    }
                }
            }
        }
        return points;
    }

    async function morphToShapes(configs) {
        const w = app.screen.width;
        const h = app.screen.height;

        // Check if this is a transition between shapes (already in MORPH state)
        // Used to trigger the Parallax Dispersion effect
        const isTransition = (state === 'MORPH');

        // 1. 恢复到网络状态（传入空 configs 时切回 NETWORK -> SCATTER）
        if (!configs || configs.length === 0) {
            if (state === 'SCATTER') return; 
            state = 'SCATTER';
            // Trigger Scatter Physics
            for (const p of particles) {
                if(p.visible) p.scatter(w, h);
            }
            return;
        }

        state = 'MORPH';
        
        // --- 核心配置：视觉缩放倍率 ---
        // 原图是 200x200，设为 1.8 则屏幕实际显示 360x360 像素
        // 设为 2.0 则显示 400x400。请根据实际扫描难易度调整此值。
        const VISUAL_SCALE = isMobile ? 1.4 : 1.8;
        
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
        
        // 调试输出
        console.log('=== Particle Shape Debug ===');
        validShapes.forEach((shape, idx) => {
            console.log(`Shape ${idx}: type=${shape.type}, points=${shape.points.length}, size=${Math.round(shape.width)}x${Math.round(shape.height)}`);
        });
        
        // --- 智能布局 (Smart Layout) ---
        const qrShapes = validShapes.filter(s => s.type === 'image');
        const textShapes = validShapes.filter(s => s.type === 'text');

        let particleIndex = 0;
        const centerX = w / 2;
        const centerY = h / 2;
        
        // 布局参数
        const cardWidth = 600;           // 信息框宽度
        const cardMargin = 80;           // 信息框与二维码之间的间距
        const qrVerticalOffset = 0;      // 二维码垂直偏移（0表示与信息框中心对齐）
        const textBottomOffset = 220;    // 文字距离中心的下方距离

        if (qrShapes.length === 1) {
            // === 单图片模式 (Project Detail) ===
            // Ref: Arknights Style - Object on Left, Text on Right.
            const shape = qrShapes[0];
            const displayW = shape.width * VISUAL_SCALE;
            const displayH = shape.height * VISUAL_SCALE;
            
            // Default Position X (0.35 -> Left-ish)
            let posXRatio = 0.35; 
            
            // Check if override exists in config options
            // We assume the first config holds the layout option.
            const layoutOption = configs[0].options.layoutX;
            if (layoutOption !== undefined) {
                posXRatio = layoutOption;
            }

            const tx = (w * posXRatio) - (displayW / 2);
            
            // Y轴：垂直居中
            const ty = centerY - (displayH / 2); 
            
            fillParticles(shape, tx, ty, VISUAL_SCALE);

        } else if (qrShapes.length === 3) {
             // === 3图片模式 (New Contact Page) ===
             // Music(Left), Mail(Center), Github(Right)
             const scale = isMobile ? 1.0 : 1.2; // Slightly smaller to fit 3
             const gap = isMobile ? 150 : 300;
             
             // 1. Left
             if (qrShapes[0]) {
                 const shape = qrShapes[0];
                 const dw = shape.width * scale;
                 fillParticles(shape, centerX - gap - dw/2, centerY - shape.height*scale/2, scale);
             }
             // 2. Center
             if (qrShapes[1]) {
                 const shape = qrShapes[1];
                 const dw = shape.width * scale;
                 fillParticles(shape, centerX - dw/2, centerY - shape.height*scale/2, scale);
             }
             // 3. Right
             if (qrShapes[2]) {
                 const shape = qrShapes[2];
                 const dw = shape.width * scale;
                 fillParticles(shape, centerX + gap - dw/2, centerY - shape.height*scale/2, scale);
             }

        } else if (qrShapes.length >= 2) {
            // === 双图片模式 (Keep for legacy compatibility if needed) ===
            // A. 左侧

            if (qrShapes[0] && !isMobile) {
                const shape = qrShapes[0];
                const displayW = shape.width * VISUAL_SCALE;
                const displayH = shape.height * VISUAL_SCALE;
                const tx = centerX - (cardWidth / 2) - cardMargin - displayW;
                const ty = centerY - (displayH / 2) + qrVerticalOffset;
                fillParticles(shape, tx, ty, VISUAL_SCALE);
            }

            // B. 右侧二维码（WeChat）
            if (qrShapes[1] && !isMobile) {
                const shape = qrShapes[1];
                const displayH = shape.height * VISUAL_SCALE;
                const tx = centerX + (cardWidth / 2) + cardMargin;
                const ty = centerY - (displayH / 2) + qrVerticalOffset;
                fillParticles(shape, tx, ty, VISUAL_SCALE);
            }
        }

        // C. 底部文字（通用）
        if (textShapes[0]) {
            const shape = textShapes[0];
            // 文字保持原比例或稍微放大
            const textScale = isMobile ? 0.8 : 1.0; 
            const displayW = shape.width * textScale;
            
            const tx = centerX - (displayW / 2);
            const ty = centerY + textBottomOffset;
            fillParticles(shape, tx, ty, textScale);
        }
        
        console.log(`Total particles used: ${particleIndex} / ${particles.length}`);

        function fillParticles(shape, startX, startY, scale) {
            shuffleArray(shape.points);
            // 遍历形状的点
            for (const point of shape.points) {
                if (particleIndex < particles.length) {
                    const p = particles[particleIndex++];
                    
                    // 核心：将原始坐标乘以缩放倍率
                    // 这样粒子之间的间距就变大了
                    const localX = (point.x - shape.bounds.minX) * scale;
                    const localY = (point.y - shape.bounds.minY) * scale;
                    
                    const finalX = startX + localX;
                    const finalY = startY + localY;

                    p.moveTo(finalX, finalY);
                    
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

        // --- Post-Layout Effects ---
        // If switching between projects (MORPH -> MORPH), add a "Parallax Kick"
        if (isTransition) {
             for (let i = 0; i < particleIndex; i++) {
                const p = particles[i];
                // Random dispersion vector to simulate 3D explosion/warp
                const angle = Math.random() * Math.PI * 2;
                // Kick strength based on depth:
                // Closer particles (depth > 1) move much faster, creating heavy parallax
                const speed = (Math.random() * 20 + 10) * p.depth; 
                
                p.vx += Math.cos(angle) * speed;
                p.vy += Math.sin(angle) * speed;
            }
        }
    }

    return {
        init,
        destroy,
        morphToShapes
    };
}