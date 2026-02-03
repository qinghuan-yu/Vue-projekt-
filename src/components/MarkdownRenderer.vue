<template>
  <div class="renderer-container">
    <!-- Meta Header (Desc & Tags) -->
    <!-- Animation Order: Body First, then Header. We use classes to control delay. -->
    <div v-if="metadata.desc || (metadata.tags && metadata.tags.length)" class="post-meta-header anim-delayed">
       <div v-if="metadata.desc" class="meta-desc">
          <span class="prefix">ABSTRACT //</span>
          <span class="desc-text">{{ metadata.desc }}</span>
       </div>
       <div v-if="metadata.tags && metadata.tags.length" class="meta-tags">
          <span class="prefix">TAGS //</span>
          <div class="tags-list">
            <span v-for="tag in metadata.tags" :key="tag" class="tag-chip">
                {{ tag }}
            </span>
          </div>
       </div>
       <div class="header-divider">
         <div class="dashed-line"></div>
       </div>
    </div>

    <!-- Body Animation: First -->
    <div class="markdown-body anim-first" v-html="htmlContent"></div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; 

const props = defineProps({
  source: String // 传入的 md 原始内容
});

const htmlContent = ref('');
const metadata = ref({});

const init = async () => {
    if (!props.source) return;

    let content = props.source;
    let metadataObj = {};

    // 1. Simple Regex Frontmatter Parser
    const fmRegex = /^---\r?\n([\s\S]+?)\r?\n---/;
    const match = props.source.match(fmRegex);

    if (match) {
        const rawFm = match[1];
        content = props.source.replace(fmRegex, '').trim();
        
        rawFm.split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                let value = parts.slice(1).join(':').trim();
                
                // Handle basic string values
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.slice(1, -1);
                }

                // Handle Tags Array (Simple JSON-like or Comma-separated)
                if (key === 'tags') {
                    if (value.startsWith('[') && value.endsWith(']')) {
                        // Remove brackets and quotes, then split
                        value = value.slice(1, -1)
                            .split(',')
                            .map(s => s.trim().replace(/^["']|["']$/g, '')) // Remove surrounding quotes
                            .filter(Boolean);
                    } else {
                        // Plain listing
                         value = [value];
                    }
                }

                metadataObj[key] = value;
            }
        });
        emit('metadata', metadataObj);
        metadata.value = metadataObj;
    }

    // 2. Configure Markdown-it with Highlight.js
    const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return '<pre class="hljs"><code>' +
                        hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                        '</code></pre>';
                } catch (__) {}
            }
            return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
        }
    });

    htmlContent.value = md.render(content);
};

const emit = defineEmits(['metadata']);

watchEffect(() => {
    if (props.source) init();
});
</script>

<style>
/* Animation Utilities for Content */
@keyframes fadeInUpContent {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.anim-first {
  opacity: 0;
  animation: fadeInUpContent 0.8s ease forwards;
  /* No delay or small delay */
}

.anim-delayed {
  opacity: 0;
  animation: fadeInUpContent 0.8s ease forwards;
  animation-delay: 0.3s; /* Waits for body to start appearing */
}

/* Global Markdown Styles Override for Transparency */
.markdown-body {
  background-color: transparent !important;
  font-family: 'Space Grotesk', 'Noto Sans SC', sans-serif;
  color: #e6e6e6;
  line-height: 1.6;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 0.3em;
  color: #fff;
  margin-top: 1.5em;
}

.markdown-body blockquote {
  border-left: 4px solid #61b1d6; /* Accent Color */
  color: #8b949e;
  padding-left: 1em;
  background: rgba(255,255,255,0.05); /* Slight bg for quote */
}

.markdown-body a {
  color: #61b1d6;
  text-decoration: none;
}
.markdown-body a:hover {
  text-decoration: underline;
}

/* Highlight.js Code Block Styles */
.markdown-body pre.hljs {
  background-color: #0d1117 !important; /* GitHub Dark BG */
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
  overflow-x: auto;
}

.markdown-body code {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  background: rgba(255,255,255,0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}
.markdown-body pre code {
  background: transparent;
  padding: 0;
}

.markdown-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
}
.markdown-body table th, .markdown-body table td {
    border: 1px solid rgba(255,255,255,0.2);
    padding: 8px 12px;
}

/* Meta Header Styles */
.post-meta-header {
  margin-bottom: 2rem;
  font-family: 'Space Grotesk', 'Noto Sans SC', sans-serif;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.meta-desc {
  display: flex;
  margin-bottom: 0.8rem;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem 1rem;
  border-left: 3px solid #00f0ff; /* Cyan accent */
}

.meta-desc .prefix {
  color: #00f0ff;
  font-weight: bold;
  margin-right: 0.8rem;
  white-space: nowrap;
  user-select: none;
}

.meta-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 0 0.5rem;
}

.meta-tags .prefix {
  color: rgba(255, 255, 255, 0.4);
  font-weight: bold;
  margin-right: 0.8rem;
  user-select: none;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  background: rgba(0, 240, 255, 0.15);
  color: #00f0ff;
  padding: 0.1em 0.5em;
  border-radius: 2px;
  font-size: 0.85em;
  letter-spacing: 0.5px;
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.header-divider {
  margin-top: 1.5rem;
  width: 100%;
  height: 1px;
  position: relative;
  overflow: hidden;
}

.dashed-line {
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to right, rgba(255,255,255,0.3) 50%, transparent 50%);
    background-size: 8px 1px;
    background-repeat: repeat-x;
}
</style>
