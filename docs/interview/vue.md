# vue 面试题

## 数据双向绑定

## 响应式原理

## keep-alive 原理

## 生命周期、父子生命周期顺序

## 父子传参方式

## vue3 的不同

## name 属性用处

## nextTick 原理

## vue-router 原理

hash: 利用 # 号后内容变化不刷新页面的形式实现；通过 `hashchange` 事件监听 url 变化。

history: 利用 `pushState`、`replaceState` 方法可以改变 url 但不刷新页面的形式实现；通过 `popState` 事件监听 url 变化。

### vue-router 的具体实现

```js
import Vue from 'vue';
import VueRouter from 'vue-router';
import routes from 'route';

const router = new VueRouter({
  routes
})
Vue.use(VueRouter);
new Vue({
  router,
}).$mount('#app');
```

`new VueRouter({routes})` 创建的路由实例，主要会根据传入的路由配置，生成一个 `路由-组件` 的哈希表。

`Vue.use(VueRouter)` vue 插件用法，会调用 `VueRouter` 上的 `install` 方法，`vue-router` 在 `install` 中会全局 mixin 一个 `beforeCreate` 钩子函数，首先在 `beforeCreate` 钩子函数中会处理 `new Vue({router})` 传入的路由实例，将 `$router`、`$route` 挂载到 vue 实例上，并且子组件和根组件上的 `router 实例`、`$router`、`$route` 等指向的引用是同一个；其次将当前指向的路由转为响应式数据；最后会注册 `router-link`、`router-view` 组件。

```js
let Vue = null;

class HistoryRoute {
  constructor(){
    this.current = null
  }
}

class VueRouter{
  constructor(options) {
    this.mode = options.mode || "hash"
    // 这里传递的这个路由是一个数组表
    this.routes = options.routes || []
    // 根据 routes 数组转为 key-value 的形式，path-component
    this.routesMap = this.createMap(this.routes)
    this.history = new HistoryRoute();

    this.init()

  }
  init(){
    if (this.mode === "hash"){
      // 先判断用户打开时有没有hash值，没有的话跳转到#/
      location.hash ? '' : (location.hash = "/");
      window.addEventListener("load",()=>{
        this.history.current = location.hash.slice(1)
      })
      window.addEventListener("hashchange",()=>{
        this.history.current = location.hash.slice(1)
      })
    } else{
      location.pathname ? '' : (location.pathname = "/");
      window.addEventListener('load',()=>{
        this.history.current = location.pathname
      })
      window.addEventListener("popstate",()=>{
        this.history.current = location.pathname
      })
    }
  }

  createMap(routes){
    return routes.reduce((acc,current)=>{
      pre[current.path] = current.component
      return acc;
    },{})
  }

}

// vue 插件
VueRouter.install = function (v) {
  Vue = v;
  Vue.mixin({
    beforeCreate(){
      // 保证所有 vue 组件实例上的 $router、$route 引用对象是同一个。
      if (this.$options && this.$options.router){ // 如果是根组件
        this._routerRoot = this; //把当前实例挂载到_root上
        this._router = this.$options.router;
        // this._router.init(this);
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      }else { //如果是子组件
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
      }

      Object.defineProperty(Vue.prototype, '$router', {
        get: function get () { return this._routerRoot._router }
      });

      Object.defineProperty(Vue.prototype, '$route', {
        get: function get () { return this._routerRoot._route }
      });
    }
  })

  Vue.component('router-link',{
    props:{
      to:String
    },
    render(h){
      let mode = this.$router.mode;
      let to = mode === "hash" ? "#" + this.to : this.to
      return h('a',{attrs:{ href : to}}, this.$slots.default)
    }
  })
  Vue.component('router-view',{
    render(h){
      let current = this.$router.history.current
      let routeMap = this.$router.routesMap;
      return h(routeMap[current])
    }
  })
};

export default VueRouter
```
