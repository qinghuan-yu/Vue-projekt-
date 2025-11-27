import {
  createRouter,
  createWebHashHistory
} from 'vue-router';
import IndexPage from './components/IndexPage.vue';
import ChuanShu from './components/ChuanShu.vue';
import GouWu from './components/GouWu.vue';
import MinTai from './components/MinTai.vue';
import SanQin from './components/SanQin.vue';
import YuMen from './components/YuMen.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [{
      path: '/',
      name: '首页',
      component: IndexPage
    },
    {
      path: '/川蜀',
      name: '川蜀',
      component: ChuanShu
    },
    {
      path: '/勾吴',
      name: '勾吴',
      component: GouWu
    },
    {
      path: '/闽台',
      name: '闽台',
      component: MinTai
    },
    {
      path: '/三秦',
      name: '三秦',
      component: SanQin
    },
    {
      path: '/玉门',
      name: '玉门',
      component: YuMen
    }
  ]
});