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

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          
          // 🛡️【核心修复】等待字体加载完毕后再测量
          document.fonts.ready.then(() => {
              // 使用 offsetHeight 获取包含 padding 的整数高度
              // 并向上取整，再额外加 4px 的安全缓冲，防止 descender (g,j,p) 被切
              const safeHeight = Math.ceil(el.offsetHeight) + 4;
              const safeWidth = Math.ceil(el.offsetWidth) + 2;

              el.style.height = `${safeHeight}px`;
              el.style.width = `${safeWidth}px`;
              
              // 强制行内块，确保宽高生效
              if (window.getComputedStyle(el).display === 'inline') {
                el.style.display = 'inline-block';
              }
              
              // 保持垂直对齐，防止因为 inline-block 导致的基线偏移
              el.style.verticalAlign = 'top'; 

              scrambler.setText(originalText).then(() => {
                // 🔓 动画结束
                // 【关键决策】：如果解锁导致回弹，我们可以选择"不完全解锁"，
                // 或者确保 ResizeObserver 能捕捉到。
                // 考虑到 MainLayout 的存在，这里我们释放高度，但在 MainLayout 里做保护。
                el.style.height = '';
                el.style.width = '';
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