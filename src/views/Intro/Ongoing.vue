<template>
  <div class="ongoing-container">
    <!-- 模块头部 -->
    <div class="module-header">
      <span class="module-tag warning">ACTIVE PROJECTS</span>
      <span class="module-code">PROJ_SYS_v2.1</span>
    </div>
    
    <!-- 项目列表 -->
    <div class="project-section" @wheel.stop>
      <a href="https://github.com/qinghuan-yu/gif-player" target="_blank" class="project-card">
        <div class="project-header">
          <span class="project-id">PROJ-001</span>
          <span class="project-status active">● IN PROGRESS</span>
        </div>
        <h3 class="project-title" v-scramble>gif-player</h3>
      </a>
      
      <a href="https://github.com/qinghuan-yu/vue-piano" target="_blank" class="project-card">
        <div class="project-header">
          <span class="project-id">PROJ-002</span>
          <span class="project-status active">● IN PROGRESS</span>
        </div>
        <h3 class="project-title" v-scramble>vue-piano</h3>
      </a>

      <a href="https://github.com/qinghuan-yu/Pianalysis" target="_blank" class="project-card">
        <div class="project-header">
          <span class="project-id">PROJ-003</span>
          <span class="project-status active">● IN PROGRESS</span>
        </div>
        <h3 class="project-title" v-scramble>Pianalysis</h3>
      </a>

      <a href="https://github.com/qinghuan-yu/Vue-projekt-" target="_blank" class="project-card">
        <div class="project-header">
          <span class="project-id">PROJ-004</span>
          <span class="project-status active">● IN PROGRESS</span>
        </div>
        <h3 class="project-title" v-scramble>This Vue Project</h3>
      </a>
    </div>
    
    <!-- 统计装饰 -->
    <div class="stats-footer">
      <div class="stat-item">
        <span class="stat-label">TOTAL</span>
        <span class="stat-value">04</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">STATUS</span>
        <span class="stat-value active-text">ACTIVE</span>
      </div>
      <DecorationBarcode :width="120" :height="20" color="#F4D03F" />
    </div>
  </div>
</template>

<script setup>
import DecorationBarcode from '@/components/DecorationBarcode.vue';
</script>

<style scoped>
.ongoing-container {
  position: relative;
  padding: 1rem 0;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(244, 208, 63, 0.3);
}

.module-tag {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #61b1d6;
  padding: 3px 8px;
  background: rgba(97, 177, 214, 0.1);
  border: 1px solid #61b1d6;
}

.module-tag.warning {
  color: #F4D03F;
  background: rgba(244, 208, 63, 0.1);
  border-color: #F4D03F;
}

.module-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.1em;
}

.project-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
  overscroll-behavior: contain;
}

.project-section::-webkit-scrollbar {
  width: 4px;
}

.project-section::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.project-section::-webkit-scrollbar-thumb {
  background: #61b1d6;
  border-radius: 2px;
}

a.project-card {
  text-decoration: none;
  display: block;
}

.project-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid #61b1d6;
  transition: all 0.3s ease;
  clip-path: polygon(
    10px 0,
    100% 0,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    0 100%,
    0 10px
  );
}

.project-card:hover {
  background: rgba(97, 177, 214, 0.05);
  border-left-color: #F4D03F;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.project-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(97, 177, 214, 0.6);
  letter-spacing: 0.1em;
}

.project-status {
  font-size: 0.65rem;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
}

.project-status.active {
  color: #4ade80;
  animation: status-pulse 2s infinite;
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.project-title {
  font-size: 1.1rem;
  color: #fff;
  margin: 0 0 0.8rem 0;
  font-weight: 500;
}

.project-meta {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.meta-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.5);
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #61b1d6, #F4D03F);
  animation: progress-glow 2s ease-in-out infinite;
}

@keyframes progress-glow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.stats-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.stat-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.1em;
}

.stat-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #61b1d6;
}

.active-text {
  color: #4ade80;
}
</style>