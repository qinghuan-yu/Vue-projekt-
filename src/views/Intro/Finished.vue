<template>
  <div class="finished-container">
    <!-- 模块头部 -->
    <div class="module-header">
      <span class="module-tag completed">COMPLETED</span>
      <span class="module-code">ARCHIVE_v1.0</span>
    </div>
    
    <!-- 项目列表 -->
    <div class="archive-section">
      <div class="archive-card">
        <div class="archive-header">
          <span class="archive-id">ARC-001</span>
          <span class="archive-status">✓ COMPLETED</span>
        </div>
        <div class="archive-content">
          <span class="link-icon">→</span>
          <a href="https://github.com/qinghuan-yu/Vue-projekt-" target="_blank" rel="noopener noreferrer" v-scramble>
            This Vue Project
          </a>
        </div>
      </div>
      
      <div class="archive-card">
        <div class="archive-header">
          <span class="archive-id">ARC-002</span>
          <span class="archive-status">✓ COMPLETED</span>
        </div>
        <div class="archive-content">
          <span class="link-icon">♪</span>
          <a href="https://music.163.com/song?id=2758145032&uct2=U2FsdGVkX1+OhAUdieOlKJSEMOkMOSabaOpgnpVUVko=" target="_blank" rel="noopener noreferrer" v-scramble>
            からっぽの星で
          </a>
        </div>
      </div>
    </div>
    
    <!-- 档案条形码 -->
    <div class="archive-footer">
      <DecorationBarcode :width="150" :height="30" color="#4ade80" />
      <div class="archive-code">ARCHIVE_ID: COMPLETE-02</div>
    </div>
  </div>
</template>

<script setup>
import DecorationBarcode from '@/components/DecorationBarcode.vue';
</script>

<style scoped>
.finished-container {
  position: relative;
  padding: 1rem 0;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(74, 222, 128, 0.3);
}

.module-tag {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  padding: 3px 8px;
  border: 1px solid;
}

.module-tag.completed {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  border-color: #4ade80;
}

.module-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.1em;
}

.archive-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.archive-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-left: 3px solid #4ade80;
  transition: all 0.3s ease;
}

.archive-card:hover {
  background: rgba(74, 222, 128, 0.05);
  border-left-width: 5px;
}

.archive-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.archive-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(74, 222, 128, 0.6);
  letter-spacing: 0.1em;
}

.archive-status {
  font-size: 0.65rem;
  color: #4ade80;
  font-family: 'JetBrains Mono', monospace;
}

.archive-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.link-icon {
  font-size: 1.2rem;
  color: #F4D03F;
}

a {
  color: #61b1d6;
  text-decoration: none;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  position: relative;
}

a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #61b1d6;
  transition: width 0.3s ease;
}

a:hover {
  color: #F4D03F;
}

a:hover::after {
  width: 100%;
  background: #F4D03F;
}

.archive-meta {
  display: flex;
  gap: 0.6rem;
}

.meta-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.5);
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.archive-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.archive-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(74, 222, 128, 0.5);
  letter-spacing: 0.2em;
}
</style>