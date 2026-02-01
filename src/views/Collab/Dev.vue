<template>
  <div class="dev-container">
    <!-- 模块头部 -->
    <div class="module-header">
      <span class="module-tag dev">⟨/⟩ DEV COLLAB</span>
      <span class="module-code">DEV_SYS_v2.5</span>
    </div>
    
    <!-- 开发领域 -->
    <div class="dev-section">
      <div class="dev-card">
        <div class="card-header">
          <span class="dev-id">DEV-001</span>
          <span class="status-badge active">● ACTIVE</span>
        </div>
        <div class="card-body">
          <div class="tech-icon">
            <span class="icon-text">{ }</span>
          </div>
          <div class="dev-content">
            <h3 class="dev-title" v-scramble>嵌入式开发</h3>
            <div class="tech-stack">
              <span class="tech-chip">EMBEDDED</span>
              <span class="tech-chip">IoT</span>
              <span class="tech-chip">C/C++</span>
            </div>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-label">
            <span>EXPLORATION</span>
            <span>35%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: 35%"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 技术终端 -->
    <div class="terminal-section">
      <div class="terminal-header">
        <span class="terminal-indicator">●</span>
        <span class="terminal-title">DEVELOPMENT TERMINAL</span>
      </div>
      <div class="terminal-body">
        <div class="terminal-line">
          <span class="prompt">$</span>
          <span class="command" v-scramble>git status</span>
        </div>
        <div class="terminal-line output">
          <span class="output-text" v-scramble>On branch main</span>
        </div>
        <div class="terminal-line output">
          <span class="output-text" v-scramble>Working directory: embedded-projects</span>
        </div>
        <div class="terminal-line">
          <span class="prompt">$</span>
          <span class="command cursor">_</span>
        </div>
      </div>
    </div>
    
    <!-- 系统标识 -->
    <div class="system-footer">
      <DecorationBarcode :width="140" :height="25" />
      <div class="system-id">DEV_ID: 0xC0DE-EMBEDDED</div>
    </div>
  </div>
</template>

<script setup>
import DecorationBarcode from '@/components/DecorationBarcode.vue';
</script>

<style scoped>
.dev-container {
  position: relative;
  padding: 1rem 0;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(97, 177, 214, 0.3);
}

.module-tag {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 3px 8px;
  border: 1px solid;
}

.module-tag.dev {
  color: #61b1d6;
  background: rgba(97, 177, 214, 0.1);
  border-color: #61b1d6;
}

.module-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.1em;
}

.dev-section {
  margin-bottom: 2rem;
}

.dev-card {
  padding: 1.2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid #61b1d6;
  transition: all 0.3s ease;
}

.dev-card:hover {
  background: rgba(97, 177, 214, 0.05);
  border-left-width: 5px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.dev-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(97, 177, 214, 0.6);
  letter-spacing: 0.1em;
}

.status-badge {
  font-size: 0.65rem;
  font-family: 'JetBrains Mono', monospace;
}

.status-badge.active {
  color: #4ade80;
  animation: status-blink 2s infinite;
}

@keyframes status-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.card-body {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.tech-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(97, 177, 214, 0.1);
  border: 2px solid rgba(97, 177, 214, 0.3);
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.icon-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #61b1d6;
}

.dev-content {
  flex: 1;
}

.dev-title {
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 0.8rem 0;
  font-weight: 500;
}

.tech-stack {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tech-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: #61b1d6;
  padding: 2px 6px;
  background: rgba(97, 177, 214, 0.1);
  border: 1px solid rgba(97, 177, 214, 0.3);
}

.progress-section {
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.5rem;
}

.progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #61b1d6, #F4D03F);
  animation: progress-pulse 2s ease-in-out infinite;
}

@keyframes progress-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.terminal-section {
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.terminal-indicator {
  font-size: 0.8rem;
  color: #4ade80;
}

.terminal-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.1em;
}

.terminal-body {
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
}

.terminal-line {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.prompt {
  color: #4ade80;
}

.command {
  color: #61b1d6;
}

.cursor {
  animation: cursor-blink 1s infinite;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.terminal-line.output {
  padding-left: 1.5rem;
}

.output-text {
  color: rgba(255, 255, 255, 0.7);
}

.system-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.system-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(97, 177, 214, 0.5);
  letter-spacing: 0.2em;
}
</style>