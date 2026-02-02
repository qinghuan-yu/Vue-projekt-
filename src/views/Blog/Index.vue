<template>
  <section class="archive-container">
    <div class="layer-content">
      <div class="archive-wrapper">
        <!-- Left Panel -->
        <div class="archive-left">
          <div class="archive-header">
            <h4 class="title-cn">博客文章</h4>
            <p class="title-en">My Blog</p>
            <div class="title-line"></div>
          </div>

          <div class="archive-tabs">
            <button 
              v-for="item in archiveList" 
              :key="item.id"
              @click="activeTab = item.id"
              class="tab-btn"
              :class="{ active: activeTab === item.id }"
            >
              <div class="tab-indicator"></div>
              <div class="tab-content">
                <span class="tab-label">{{ item.label }}</span>
                <span class="tab-cn">{{ item.cn }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="archive-right">
          <div class="data-card">
            <div class="card-main">
              <div class="data-header">
                <div class="pulse-dot"></div>
                <span class="stream-text">Relic Data Stream</span>
              </div>
              
              <div class="content-area">
                 <transition name="fade" mode="out-in">
                   <div :key="activeTab" class="tab-pane">
                     <h5 class="pane-title">{{ currentItem.cn }}</h5>
                   <transition-group 
                      tag="ul" 
                      name="staggered-list" 
                      class="detail-list"
                      appear
                   >
                       <li 
                         v-for="(detail, idx) in currentItem.details" 
                         :key="detail" 
                         class="detail-item"
                         :style="{ '--i': idx }"
                       >
                         {{ detail }}
                       </li>
                   </transition-group>
                   </div>
                 </transition>
              </div>
            </div>
            
            <div class="card-sidebar">
               <div class="box-icon">[BOX]</div>
               <div class="sidebar-lines">
                  <div class="line-lg"></div>
                  <div class="line-sm"></div>
               </div>
               <div class="sidebar-footer">
                  <p class="sid"></p>
                  <p class="sverified">Verified</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';

const activeTab = ref('tech');

const archiveList = [
  { id: 'tech', label: 'TECH NOTE', cn: '技术笔记', details: ['Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'Sed do eiusmod tempor incididunt ut labore.', 'Ut enim ad minim veniam, quis nostrud exercitation.'] },
  { id: 'life', label: 'DAILY LIFE', cn: '生活随笔', details: ['Duis aute irure dolor in reprehenderit.', 'Excepteur sint occaecat cupidatat non proident.', 'Sunt in culpa qui officia deserunt mollit.'] },
  { id: 'music', label: 'MUSIC PROD', cn: '音乐创作', details: ['Nemo enim ipsam voluptatem quia voluptas sit.', 'Neque porro quisquam est, qui dolorem ipsum.', 'Quis autem vel eum iure reprehenderit qui.'] },
];

const currentItem = computed(() => archiveList.find(i => i.id === activeTab.value));
</script>

<style scoped>
/* Blog List Enter Animation */
.staggered-list-enter-active,
.staggered-list-leave-active {
  transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.staggered-list-enter-from,
.staggered-list-leave-to {
  opacity: 0;
  transform: translateX(-30px); /* Slide in from left */
}

.archive-container {
  min-height: 80vh;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.layer-content {
  display: flex;
  align-items: center;
  padding: 24px;
}
@media (min-width: 1024px) {
  .layer-content { padding: 96px; }
}

.archive-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 48px;
}
@media (min-width: 1024px) {
  .archive-wrapper { flex-direction: row; align-items: center; }
}

.archive-left {
  width: 100%;
}
@media (min-width: 1024px) { .archive-left { width: 33.33%; } }

.archive-right {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
}
@media (min-width: 1024px) { .archive-right { width: 66.66%; } }

.archive-header {
  margin-bottom: 48px;
}

.title-cn {
  font-size: 48px;
  font-weight: 500;
  font-style: normal;
  letter-spacing: -0.05em;
  line-height: 1;
  margin: 0 0 16px 0;
}

.title-en {
  font-size: 10px;
  letter-spacing: 0.5em;
  color: #22d3ee;
  opacity: 0.6;
  text-transform: uppercase;
  margin: 0 0 16px 0;
}

.title-line {
  width: 96px;
  height: 4px;
  background: #22d3ee;
}

.archive-tabs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tab-btn {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.tab-btn:hover {
  border-color: rgba(255, 255, 255, 0.4);
}

.tab-btn.active {
  background: #06b6d4; /* cyan-500 */
  border-color: #06b6d4;
  color: black;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
}

.tab-indicator {
  width: 4px;
  height: 12px;
  background: #22d3ee;
  margin-right: 16px;
  transition: background 0.3s;
}
.tab-btn.active .tab-indicator {
  background: black;
}

.tab-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.tab-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.tab-cn {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.4;
}
.tab-btn.active .tab-cn { opacity: 0.8; }

/* Right Card */
.data-card {
  width: 100%;
  max-width: 768px;
  aspect-ratio: 16/9;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  overflow: hidden;
  padding: 32px;
  display: flex;
  gap: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
@media (max-width: 768px) {
  .data-card { flex-direction: column; aspect-ratio: auto; }
}

.card-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.data-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #22d3ee;
  animation: pulse 2s infinite;
}

.stream-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.content-area {
  flex: 1;
}

.pane-title {
  font-size: 24px;
  font-weight: 500;
  font-style: normal;
  border-left: 4px solid #22d3ee;
  padding-left: 16px;
  margin: 0 0 16px 0;
}

.detail-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-item {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.1em;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-right: 1px solid rgba(34, 211, 238, 0.2);
}

/* Sidebar in Card */
.card-sidebar {
  width: 192px;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  padding-left: 32px;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
@media (max-width: 768px) {
  .card-sidebar { width: 100%; border-left: none; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-left: 0; padding-top: 24px; flex-direction: row; }
}

.box-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.1);
  font-weight: 100;
}

.sidebar-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.line-lg { height: 4px; width: 100%; background: rgba(34, 211, 238, 0.2); }
.line-sm { height: 4px; width: 66%; background: rgba(34, 211, 238, 0.2); }

.sidebar-footer {
  text-align: right;
}

.sid { font-size: 8px; opacity: 0.2; font-family: monospace; margin: 0; }
.sverified { font-size: 10px; font-weight: 500; color: rgba(34, 211, 238, 0.6); text-transform: uppercase; margin: 0; }


.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Staggered List Animation */
.staggered-list-enter-active,
.staggered-list-leave-active {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 0.1s);
}

.staggered-list-enter-from,
.staggered-list-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}
</style>
