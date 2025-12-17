class ScrambleText {
  constructor(el) {
    this.el = el;
    this.originalText = el.textContent;
    this.chars = '!@#$%^&*()-_=+[]{};:,.<>?';
    this.animationFrameId = null;
    this.frame = 0;
    this.queue = [];
    this.resolve = null;
    this.animate = this.animate.bind(this);
  }

  setText(newText) {
    const oldText = this.originalText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 80);
      const end = start + Math.floor(Math.random() * 80);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.animationFrameId);
    this.frame = 0;
    this.originalText = newText;
    this.animate();
    return promise;
  }

  animate() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.animationFrameId = requestAnimationFrame(this.animate);
      this.frame++;
    }
  }
}

const scrambleDirective = {
  mounted(el) {
    const scrambler = new ScrambleText(el);
    const originalText = el.textContent;
    
    console.log('🔧 [vScramble] mounted', {
      element: el,
      originalText,
      initialHeight: el.offsetHeight,
      initialWidth: el.offsetWidth
    });
    
    // 【关键修复】立即同步设置高度，不等待任何异步操作
    // 先设置最终文本内容，以便测量正确的高度
    el.textContent = originalText;
    
    // 强制重排，确保浏览器重新计算布局
    el.offsetHeight;
    
    // 使用 offsetHeight 获取包含 padding 的整数高度
    // 并向上取整，再额外加 20px 的安全缓冲（确保文字完全显示）
    const safeHeight = Math.ceil(el.offsetHeight) + 20;
    const safeWidth = Math.ceil(el.offsetWidth) + 8;

    console.log('📏 [vScramble] 计算高度', {
      offsetHeight: el.offsetHeight,
      safeHeight,
      offsetWidth: el.offsetWidth,
      safeWidth
    });

    el.style.height = `${safeHeight}px`;
    el.style.width = `${safeWidth}px`;
    
    // 确保 line-height 为 1.5，给文字更多垂直空间
    el.style.lineHeight = '1.5';
    
    // 强制行内块，确保宽高生效
    if (window.getComputedStyle(el).display === 'inline') {
      el.style.display = 'inline-block';
    }
    
    // 保持垂直对齐，防止因为 inline-block 导致的基线偏移
    el.style.verticalAlign = 'top';
    
    // 添加 overflow:hidden 防止解码动画期间内容溢出
    el.style.overflow = 'hidden';
    
    // 暂时隐藏内容，等待 IntersectionObserver 触发动画
    el.style.opacity = '0';
    
    console.log('✅ [vScramble] 高度已设置', {
      finalHeight: el.style.height,
      finalWidth: el.style.width,
      computedHeight: window.getComputedStyle(el).height
    });

    // IntersectionObserver 只用于触发动画，不再负责设置高度
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          document.fonts.ready.then(() => {
            // 显示元素
            el.style.opacity = '1';
            
            // 开始解码动画
            scrambler.setText(originalText).then(() => {
              // 动画完成，移除 overflow 限制
              el.style.overflow = '';
            });
          });

          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
  },
};

export default scrambleDirective;