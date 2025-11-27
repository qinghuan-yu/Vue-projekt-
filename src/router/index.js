import { createRouter, createWebHistory } from 'vue-router';
import IndexPage from '../components/IndexPage.vue';
import ChuanshuPage from '../components/ChuanShu.vue';
import GouwuPage from '../components/GouWu.vue';
import MintaPage from '../components/MinTai.vue';
import SanqinPage from '../components/SanQin.vue';
import YumenPage from '../components/YuMen.vue';

const routes = [
  {
    path: '/',
    name: 'IndexPage',
    component: IndexPage
  },
  {
    path: '/川蜀',
    name: 'ChuanshuPage',
    component: ChuanshuPage
  },
  {
    path: '/勾吴',
    name: 'GouwuPage',
    component: GouwuPage
  },
  {
    path: '/闽台',
    name: 'MintaPage',
    component: MintaPage
  },
  {
    path: '/三秦',
    name: 'SanqinPage',
    component: SanqinPage
  },
  {
    path: '/玉门',
    name: 'YumenPage',
    component: YumenPage
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;