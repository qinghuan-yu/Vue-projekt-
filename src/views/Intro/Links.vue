<template>
  <div class="links-container">
    <!-- 模块头部 -->
    <div class="module-header">
      <div class="header-group">
        <span class="module-tag">EXTERNAL LINKS</span>
      </div>
      <span class="module-code">LINK_SYS_v1.5</span>
    </div>
    
    <!-- 链接列表 -->
    <div class="links-section">
      <div v-for="(repo, index) in repositories" :key="repo.name" class="link-card">
        <div class="link-header">
          <span class="link-id">LINK-{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="link-status">⟲ EXTERNAL</span>
        </div>
        <div class="link-content">
          <div class="link-icon-wrapper">
            <span class="link-icon">⇗</span>
          </div>
          <a :href="repo.url" target="_blank" rel="noopener noreferrer" class="link-main" v-scramble>
            {{ repo.name }}
          </a>
        </div>
      </div>
    </div>
    
    <!-- 连接统计 -->
    <div class="connection-footer">
      <div class="connection-info">
        <span class="info-label">TOTAL CONNECTIONS</span>
        <span class="info-value">{{ repositories.length }}</span>
      </div>
      <DecorationBarcode :width="100" :height="25" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DecorationBarcode from '@/components/DecorationBarcode.vue';

const repositories = ref([
  {
    name: 'GitHub Profile',
    url: 'https://github.com/qinghuan-yu',
  },
  {
    name: '网易云音乐',
    url: 'https://music.163.com/#/artist?id=100570638',
  },
]);
</script>

<style scoped>
.links-container {
  position: relative;
  padding: 1rem 0;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(97, 177, 214, 0.3);
}

.header-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  width: fit-content;
}

.module-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

.module-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.1em;
}

.links-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.link-card {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 3px solid #61b1d6;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.link-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(97, 177, 214, 0.1), transparent);
  transition: left 0.5s ease;
}

.link-card:hover::before {
  left: 100%;
}

.link-card:hover {
  background: rgba(97, 177, 214, 0.05);
  border-left-color: #F4D03F;
  transform: translateX(5px);
}

.link-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.link-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(97, 177, 214, 0.6);
  letter-spacing: 0.1em;
}

.link-status {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'JetBrains Mono', monospace;
}

.link-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.6rem;
}

.link-icon-wrapper {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(97, 177, 214, 0.1);
  border: 1px solid rgba(97, 177, 214, 0.3);
  clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
}

.link-icon {
  font-size: 1rem;
  color: #61b1d6;
}

.link-main {
  color: #61b1d6;
  text-decoration: none;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  position: relative;
  flex: 1;
}

.link-main::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #F4D03F;
  transition: width 0.3s ease;
}

.link-main:hover {
  color: #F4D03F;
}

.link-main:hover::after {
  width: 100%;
}

.link-url {
  display: flex;
  gap: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
}

.url-label {
  color: rgba(255, 255, 255, 0.3);
}

.url-text {
  color: rgba(255, 255, 255, 0.5);
}

.connection-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.connection-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.info-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.1em;
}

.info-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #61b1d6;
}
</style>