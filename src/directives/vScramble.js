
class ScrambleText {
  constructor(el) {
    this.el = el;
    this.originalText = el.textContent;
    this.chars = '!<>-_\\/[]{}—=+*^?#@$%&';
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
    el.textContent = ''; // Clear text initially

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          scrambler.setText(originalText);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
  },
};

export default scrambleDirective;
