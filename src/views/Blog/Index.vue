<template>
  <section class="archive-container">
    <div class="layer-content">
      <div class="archive-wrapper">
        <!-- Left Panel: Post List -->
        <div class="archive-left">
          <!-- Post List -->
          <div class="archive-list-container">
            <transition-group 
              tag="div" 
              name="staggered-list" 
              class="archive-list"
              appear
            >
              <button 
                v-for="(post, index) in posts" 
                :key="post.id"
                @click="selectPost(post)"
                class="ak-list-item"
                :class="{ active: activePostId === post.id }"
                :style="{ '--i': index }"
              >
                <div class="item-content-row">
                   <h3 class="item-title-cn">{{ post.title }}</h3>
                   <span class="item-subtitle-en">{{ post.displayDate }}</span>
                </div>
                <div class="item-separator"></div>
              </button>
            </transition-group>
          </div>
        </div>

        <!-- Right Panel: Content -->
        <div class="archive-right">
          <!-- Removed explicit progress bar UI, kept scroll container -->
          <transition name="list-section" mode="out-in">
            <div :key="activePostId" class="post-content-container">
               <div v-if="currentPostContent" 
                    class="markdown-scroll-wrapper" 
                    @wheel.stop
               >
                  <MarkdownRenderer :source="currentPostContent" />
               </div>
               <div v-else class="empty-state">
                  Select a post to view // INITIALIZING...
               </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import MarkdownRenderer from '@/components/MarkdownRenderer.vue';

// Raw import modules - Vite feature
// 这里的 ?raw 是 Vite 的特殊语法，将文件作为字符串导入
const modules = import.meta.glob('@/posts/*.md', { query: '?raw', import: 'default', eager: true });

const posts = ref([]);
const activePostId = ref(null);

onMounted(() => {
  // Process imported modules
  const loadedPosts = [];
  let index = 0;
  
  for (const path in modules) {
    const content = modules[path];
    const titleMatch = content.match(/title:\s*"(.*?)"/);
    const dateMatch = content.match(/date:\s*"(.*?)"/);
    // Simple logic to extract date parts for display "YYYY // MM / DD"
    const rawDate = dateMatch ? dateMatch[1] : '2026-01-01';
    const displayDate = rawDate.replace(/-/g, ' / ').replace(/^(\d{4}) \/ /, '$1 // ');
    
    loadedPosts.push({
      id: index++,
      title: titleMatch ? titleMatch[1] : 'Untitled Post',
      date: rawDate,
      displayDate: displayDate, // Formatted for the new list style
      content: content,
      path: path
    });
  }
  
  posts.value = loadedPosts;
  if(posts.value.length > 0) {
    selectPost(posts.value[0]);
  }
});

const selectPost = (post) => {
  activePostId.value = post.id;
};

const currentPostContent = computed(() => {
  const p = posts.value.find(x => x.id === activePostId.value);
  return p ? p.content : '';
});
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

/* --- New Arknights Style List --- */
.category-tabs {
  display: flex;
  margin-bottom: 0px; 
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.cat-tab {
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.cat-tab:hover {
  color: white;
}

.cat-tab.active {
  background: #22d3ee;
  color: black;
}

.tab-arrow {
  font-family: monospace;
  font-weight: bold;
}

.archive-list {
  display: flex;
  flex-direction: column;
  background: transparent;
  gap: 24px;
}

.ak-list-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  position: relative;
  opacity: 0.6;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.ak-list-item:hover, .ak-list-item.active {
  opacity: 1;
  background: transparent;
  transform: translateX(10px) scale(1.02);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.item-content-row {
  display: flex;
  align-items: baseline;
  padding-bottom: 8px;
  gap: 12px;
}

.item-title-cn {
  font-size: 24px; /* Increased from 20px */
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.item-subtitle-en {
  font-family: 'Courier New', monospace;
  font-size: 14px; /* Increased from 12px */
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.05em;
  font-weight: 700;
}

.item-separator {
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s;
  transform-origin: left center;
}

.ak-list-item:hover .item-separator {
  background: white;
}

.ak-list-item.active .item-separator {
  background: #22d3ee;
  box-shadow: 0 0 5px #22d3ee;
  /* Use transform instead of height to avoid layout shift (jitter) */
  transform: scaleY(2); 
}

/* Remove old tab styles */
/*
.archive-tabs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
... (Old styles removed by replacement)
*/

/* Glitch Effect Element - REMOVED */
/* Progress Bar Interface - REMOVED */

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
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 0.1s);
}

.staggered-list-enter-from,
.staggered-list-leave-to {
  opacity: 0;
  transform: translateY(-40px); /* Slide in from TOP */
}

/* Post Content Animation (Transition) */
.list-section-enter-active,
.list-section-leave-active {
  transition: all 0.4s ease;
}

.list-section-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-section-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Scroll Container & Scrollbar Layout */
.post-content-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.markdown-scroll-wrapper {
  width: 100%;
  max-width: 800px;
  height: 65vh; /* Fixed height to enable scrolling */
  overflow-y: auto;
  padding-right: 16px;
  
  /* Firefox Scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(34, 211, 238, 0.3) rgba(255, 255, 255, 0.05);
}

/* Webkit (Chrome/Safari/Edge) Scrollbar */
.markdown-scroll-wrapper::-webkit-scrollbar {
  width: 6px;
}

.markdown-scroll-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05); /* Dark track */
  border-radius: 3px;
}

.markdown-scroll-wrapper::-webkit-scrollbar-thumb {
  background: rgba(34, 211, 238, 0.3); /* Cyan thumb */
  border-radius: 3px;
  transition: background 0.3s;
}

.markdown-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(34, 211, 238, 0.6); /* Brighter hover */
}
</style>
