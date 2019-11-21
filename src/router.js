import Vue from 'vue';
import Router from 'vue-router';
import {
  store
} from './sotre'

Vue.use(Router);

const routes = [{
  path: '*',
  redirect: '/index'
},
  {
    name: 'index',
    component: () => import('./view/index'),
    meta: {
      title: '作业侠'
    }
  },
  {
    name: 'bind',
    component: () => import('./view/bind'),
    meta: {
      title: '绑定'
    }
  },
  {
    name: 'task-detail',
    component: () => import('./view/task-detail'),
    meta: {
      title: '作业详情',
      requiresLogin: true
    }
  },
  {
    name: 'task-edit',
    component: () => import('./view/task-edit'),
    meta: {
      title: '编辑作业',
      requiresLogin: true,
      requiresMaster: true
    }
  }
];

// add route path
routes.forEach(route => {
  route.path = route.path || '/' + (route.name || '');
});

const router = new Router({
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresLogin && (!store.state.isLogin || !store.state.openId)) {
    next('bind');
    return
  }

  const title = to.meta && to.meta.title;
  if (title) {
    document.title = title;
  }

  if (!to.meta.requiresMaster) {
    next();
    return
  }

  if (store.state.isMaster) {
    next();
  }

});

export {
  router
};
