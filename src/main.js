import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import scrambleDirective from './directives/vScramble.js';

import './assets/styles.css';

const app = createApp(App);

app.directive('scramble', scrambleDirective);

app.use(router).mount('#app');