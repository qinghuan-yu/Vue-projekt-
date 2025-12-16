<template>
  <div>
    <h2 v-scramble>Links</h2>
    <h2 v-scramble>Collection of projects and profiles</h2>
    <div class="links-container">
      <div v-for="repo in repositories" :key="repo.name" class="link-item">
        <a :href="repo.url" target="_blank" rel="noopener noreferrer" v-scramble>{{ repo.name }}</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LinksView',
  data() {
    return {
      repositories: [
        {
          name: 'GitHub Profile',
          url: 'https://github.com/qinghuan-yu',
        },
        {
          name: '网易云音乐',
          url: 'https://music.163.com/#/artist?id=100570638',
        },
      ]
    }
  }
}
</script>

<style scoped>
.links-container {
  margin-top: 20px;
}
.link-item {
  margin-bottom: 10px;
}
a {
  color: #61b1d6;
  text-decoration: none;
  font-size: 1.1em;
}

a:hover {
  text-decoration: underline;
}
</style>