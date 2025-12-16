import { Graphics } from 'pixi.js';

// --- 整体配置 ---
// 增加粒子总数以适应更复杂的形状，但NETWORK状态下只会使用一部分
const PARTICLE_COUNT = 1500;
const PARTICLE_SIZE_MIN = 1;
const PARTICLE_SIZE_MAX = 2.0;
const SAMPLING_DENSITY = 3;       // 提高采样密度以获取更清晰的形状

// --- 神经网络状态 (NETWORK) 配置 ---
const NETWORK_PARTICLE_COUNT = 300; // NETWORK状态下实际显示的粒子数
const PARTICLE_GROWTH_TIME = 8000;
const DISTANCE_GROWTH_TIME = 10000;
const MAX_CONNECTION_DISTANCE = 200;
const LINE_COLOR = 0x61b1d6;
const SCREEN_PADDING = 150;
const MOUSE_RADIUS_NETWORK = 60;
const MOUSE_FORCE_NETWORK = 2;
const RETURN_SPEED_NETWORK = 0.04;

// --- 变形状态 (MORPH) 配置 (来自您的新要求) ---
const MORPH_CONFIG = {
  DRAG: 0.92,         // 拖拽系数 (阻尼)
  EASE: 0.15,         // 归位力度
  MOUSE_REPULSION_SQ: 8000, // 鼠标斥力范围 (平方值以优化计算)
  MOUSE_REPULSION_FORCE: 5, // 鼠标斥力强度
};

// --- 颜色 ---
const COLOR_ACCENT = 0x61b1d6;
const COLOR_DARK_1 = 0x333333;
const COLOR_DARK_2 = 0x555555;


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class Particle {
    constructor(w, h) {
      this.init(w, h);
    }
    
    init(w, h, initial = false) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.radius = Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) + PARTICLE_SIZE_MIN;
        this.currentRenderAlpha = 0;
        this.visible = true;
        
        // 通用物理属性
        this.vx = 0;
        this.vy = 0;

        // NETWORK 状态专属属性
        this.baseVx = (Math.random() - 0.5) * 0.6;
        this.baseVy = (Math.random() - 0.5) * 0.6;
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
        this.breathPhase = Math.random() * Math.PI * 2;
        this.breathSpeed = 0.02 + Math.random() * 0.03;
        this.breathAmp = 0.3 + Math.random() * 0.2;
        this.fadeInFactor = initial ? 1 : 0;

        // MORPH 状态专属属性
        this.targetX = this.x;
        this.targetY = this.y;
    }

    updateNetwork(w, h, mouseX, mouseY) {
        // 速度回归到基础速度
        this.vx += (this.baseVx - this.vx) * RETURN_SPEED_NETWORK;
        this.vy += (this.baseVy - this.vy) * RETURN_SPEED_NETWORK;

        // 计算鼠标斥力
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distSq = dx * dx + dy * dy;
        if (distSq < MOUSE_RADIUS_NETWORK * MOUSE_RADIUS_NETWORK) {
            const dist = Math.sqrt(distSq);
            const forceFactor = (MOUSE_RADIUS_NETWORK - dist) / MOUSE_RADIUS_NETWORK;
            const angle = Math.atan2(dy, dx);
            this.vx += Math.cos(angle) * forceFactor * MOUSE_FORCE_NETWORK;
            this.vy += Math.sin(angle) * forceFactor * MOUSE_FORCE_NETWORK;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.fadeInFactor < 1) this.fadeInFactor += 0.015;
        if (this.fadeInFactor > 1) this.fadeInFactor = 1;

        let edgeFadeFactor = 1;
        if (this.x < 0) edgeFadeFactor = 1 - Math.abs(this.x) / SCREEN_PADDING;
        else if (this.x > w) edgeFadeFactor = 1 - (this.x - w) / SCREEN_PADDING;
        if (this.y < 0) edgeFadeFactor = 1 - Math.abs(this.y) / SCREEN_PADDING;
        else if (this.y > h) edgeFadeFactor = 1 - (this.y - h) / SCREEN_PADDING;

        this.breathPhase += this.breathSpeed;
        const breathFactor = 1 - (Math.sin(this.breathPhase) * 0.5 + 0.5) * this.breathAmp;
        this.currentRenderAlpha = this.maxAlpha * edgeFadeFactor * this.fadeInFactor * breathFactor;

        if (this.x < -SCREEN_PADDING || this.x > w + SCREEN_PADDING || this.y < -SCREEN_PADDING || this.y > h + SCREEN_PADDING) {
            this.init(w, h, false);
        }
    }

    updateMorph(mouseX, mouseY) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        const distMouseX = this.x - mouseX;
        const distMouseY = this.y - mouseY;
        const distMouseSq = distMouseX * distMouseX + distMouseY * distMouseY;
        
        let forceX = 0;
        let forceY = 0;

        if (distMouseSq < MORPH_CONFIG.MOUSE_REPULSION_SQ) {
            const force = (MORPH_CONFIG.MOUSE_REPULSION_SQ - distMouseSq) / MORPH_CONFIG.MOUSE_REPULSION_SQ;
            forceX = distMouseX * force * MORPH_CONFIG.MOUSE_REPULSION_FORCE;
            forceY = distMouseY * force * MORPH_CONFIG.MOUSE_REPULSION_FORCE;
        }

        this.vx += dx * MORPH_CONFIG.EASE + forceX;
        this.vy += dy * MORPH_CONFIG.EASE + forceY;
        
        this.vx *= MORPH_CONFIG.DRAG;
        this.vy *= MORPH_CONFIG.DRAG;
        
        this.x += this.vx;
        this.y += this.vy;

        if (this.fadeInFactor < 1) this.fadeInFactor += 0.05;
        if (this.fadeInFactor > 1) this.fadeInFactor = 1;
        this.currentRenderAlpha = this.maxAlpha * this.fadeInFactor;
    }

    moveTo(targetX, targetY) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.visible = true;
        this.fadeInFactor = 0;
        this.vx = 0; // 重置速度，避免从NETWORK状态继承一个很大的初速度
        this.vy = 0;
    }
    
    releaseToNetwork(w, h) {
        this.init(w, h, false);
        this.vx = this.baseVx;
        this.vy = this.baseVy;
    }
}


export function useAdvancedParticles(app) {
    const graphics = new Graphics();
    const particles = [];
    let state = 'NETWORK';
    let startTime = null;
    let mouseX = -9999;
    let mouseY = -9999;
    
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    function init() {
        app.stage.addChild(graphics);
        startTime = null;
        particles.length = 0;
        
        const w = app.screen.width;
        const h = app.screen.height;
        for(let i=0; i<PARTICLE_COUNT; i++) {
            particles.push(new Particle(w, h, false));
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
            if (startTime === null) startTime = performance.now();
            const elapsed = performance.now() - startTime;
            updateAndDrawNetwork(w, h, elapsed);
        } else if (state === 'MORPH') {
            updateAndDrawMorph();
        }
    }

    function updateAndDrawNetwork(w, h, elapsed) {
        const distProgress = Math.min(elapsed / DISTANCE_GROWTH_TIME, 1);
        const easeDist = 1 - Math.pow(1 - distProgress, 3);
        const currentConnectionDistance = easeDist * MAX_CONNECTION_DISTANCE;

        const countProgress = Math.min(elapsed / PARTICLE_GROWTH_TIME, 1);
        const easeCount = 1 - Math.pow(1 - countProgress, 3);
        const currentTargetCount = Math.floor(easeCount * NETWORK_PARTICLE_COUNT);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            // 只激活并显示NETWORK状态所需的粒子
            if (i < currentTargetCount) {
                if (!p.visible) p.releaseToNetwork(w, h); // 如果之前不可见，则重新激活
                p.visible = true;
            } else {
                p.visible = false;
                continue;
            }

            p.updateNetwork(w, h, mouseX, mouseY);
            if (p.currentRenderAlpha > 0.01) {
                 graphics.circle(p.x, p.y, p.radius).fill({ color: p.baseColor, alpha: p.currentRenderAlpha });
            }
        }
        
        if (currentConnectionDistance < 5) return;

        for (let i = 0; i < currentTargetCount; i++) {
            const p1 = particles[i];
            if (!p1.visible || p1.currentRenderAlpha <= 0.05) continue;
            for (let j = i + 1; j < currentTargetCount; j++) {
                const p2 = particles[j];
                if (!p2.visible || p2.currentRenderAlpha <= 0.05) continue;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                if (Math.abs(dx) > currentConnectionDistance || Math.abs(dy) > currentConnectionDistance) continue;

                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < currentConnectionDistance) {
                    const distAlpha = 1 - (dist / currentConnectionDistance);
                    const finalAlpha = distAlpha * Math.min(p1.currentRenderAlpha, p2.currentRenderAlpha) * 0.8;
                    if (finalAlpha > 0.02) {
                        graphics.moveTo(p1.x, p1.y).lineTo(p2.x, p2.y).stroke({ width: 1, color: LINE_COLOR, alpha: finalAlpha });
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
                    graphics.circle(p.x, p.y, p.radius).fill({ color: p.baseColor, alpha: p.currentRenderAlpha });
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

    function getPointsFromSource(source, options = {}) {
        return new Promise((resolve) => {
            const { type = 'text', scale = 1, color = '#FFFFFF' } = options;
            
            if (type === 'image') {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = source;
                img.onload = () => {
                    const scaledWidth = img.width * scale;
                    const scaledHeight = img.height * scale;
                    offscreenCanvas.width = scaledWidth;
                    offscreenCanvas.height = scaledHeight;
                    offscreenCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                    resolve(scanCanvas(scaledWidth, scaledHeight));
                };
                img.onerror = () => resolve([]);
            } else { // text
                const fontSize = options.fontSize || 120;
                const fontFamily = options.fontFamily || 'Arial';
                offscreenCtx.font = `bold ${fontSize}px ${fontFamily}`;
                const textMetrics = offscreenCtx.measureText(source);
                offscreenCanvas.width = textMetrics.width;
                offscreenCanvas.height = fontSize;
                
                offscreenCtx.font = `bold ${fontSize}px ${fontFamily}`;
                offscreenCtx.fillStyle = color;
                offscreenCtx.textBaseline = 'middle';
                offscreenCtx.textAlign = 'center';
                offscreenCtx.fillText(source, textMetrics.width / 2, fontSize / 2);

                resolve(scanCanvas(textMetrics.width, fontSize));
            }
        });
    }

    function scanCanvas(width, height) {
        const points = [];
        const imageData = offscreenCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let y = 0; y < height; y += SAMPLING_DENSITY) {
            for (let x = 0; x < width; x += SAMPLING_DENSITY) {
                if (data[(y * width + x) * 4 + 3] > 128) {
                    points.push({ x, y });
                }
            }
        }
        return points;
    }

    async function morphToShapes(configs) {
        const w = app.screen.width;
        const h = app.screen.height;

        // --- 切换回 IDLE 状态 ---
        if (!configs || configs.length === 0 || (configs.length === 1 && configs[0].shape === 'idle')) {
            if (state === 'NETWORK') return; 
            state = 'NETWORK';
            startTime = null; 
            for (const p of particles) {
                // 为粒子设置一个随机目标，让它们散开而不是回到(0,0)
                p.targetX = Math.random() * w;
                p.targetY = Math.random() * h;
            }
            return;
        }

        // --- 切换到 MORPH 状态 ---
        state = 'MORPH';
        startTime = null; 

        // 1. 并行获取所有形状的点数据
        const shapesData = await Promise.all(
            configs.map(config => 
                getPointsFromSource(config.source, config.options)
                .then(points => {
                    if (points.length === 0) return null; // 如果某个形状无法加载，返回null
                    
                    const bounds = {
                        minX: Math.min(...points.map(p => p.x)),
                        maxX: Math.max(...points.map(p => p.x)),
                        minY: Math.min(...points.map(p => p.y)),
                        maxY: Math.max(...points.map(p => p.y)),
                    };
                    const width = bounds.maxX - bounds.minX;
                    const height = bounds.maxY - bounds.minY;
                    
                    return { points, config, bounds, width, height };
                })
            )
        );

        const validShapes = shapesData.filter(Boolean); // 过滤掉加载失败的形状
        if (validShapes.length === 0) {
            console.warn("All shapes failed to load, returning to NETWORK.");
            morphToShapes([]); // 返回IDLE状态
            return;
        }
        
        // 2. 实现您的特定布局: 2个并排，1个在下方
        let particleIndex = 0;
        
        // --- 上方并排的两个二维码 ---
        const qrShapes = validShapes.filter(s => s.config.options.type === 'image');
        const textShape = validShapes.find(s => s.config.options.type === 'text');

        if (qrShapes.length > 0) {
            const gap = 80; // 二维码之间的间距
            const totalQRWidth = qrShapes.reduce((sum, s) => sum + s.width, 0) + (qrShapes.length - 1) * gap;
            const maxQRHeight = Math.max(...qrShapes.map(s => s.height));
            let currentX = (w - totalQRWidth) / 2;
            const topOffsetY = (h - maxQRHeight) / 2 - (textShape ? textShape.height : 0); // 向上移动一点为文字留出空间

            for (const shape of qrShapes) {
                const offsetX = currentX - shape.bounds.minX;
                const offsetY = topOffsetY - shape.bounds.minY;
                
                shuffleArray(shape.points);
                for (const point of shape.points) {
                    if (particleIndex < particles.length) {
                        const p = particles[particleIndex++];
                        p.moveTo(point.x + offsetX, point.y + offsetY);
                    }
                }
                currentX += shape.width + gap;
            }
        }
        
        // --- 下方的文字 ---
        if (textShape) {
            const topMargin = 50; // 与二维码的垂直间距
            const textTopY = (h / 2) + topMargin; // 基于屏幕中心计算
            const offsetX = (w - textShape.width) / 2 - textShape.bounds.minX;
            const offsetY = textTopY - textShape.bounds.minY;
            
            shuffleArray(textShape.points);
            for (const point of textShape.points) {
                 if (particleIndex < particles.length) {
                    const p = particles[particleIndex++];
                    p.moveTo(point.x + offsetX, point.y + offsetY);
                }
            }
        }

        // 3. 隐藏所有未被使用的粒子
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
