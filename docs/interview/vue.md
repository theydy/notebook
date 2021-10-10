# vue 面试题

## 数据双向绑定

## 响应式原理

## keep-alive 原理

## 生命周期、父子生命周期顺序

## 父子传参方式

## vue3 的不同

### Proxy

vue2 中使用 `Object.defineProperty` 实现数据的响应式，在 vue3 中改为 `Proxy` 实现。

`Object.defineProperty` 的问题有如下：

- 只能监听已存在的属性，不能监听新增和删除的属性
- 必须遍历对象的每个属性
- 必须深层遍历嵌套的对象

`Object.defineProperty` 是针对对象某个属性的操作，而 `Proxy` 则是针对整个对象的操作

`Proxy` 的用法如下

[MDN Proxy 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

```js
var p = new Proxy(target, handler);
```

## name 属性用处

递归调用自身

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

## Virtual DOM

[尤雨溪回答](https://www.zhihu.com/question/31809713/answer/53544875)

[面试官问: 如何理解Virtual DOM？](https://juejin.cn/post/6844903921442422791?utm_source=gold_browser_extension#heading-0)

Virtual DOM 并不能保证比直接操作 DOM 快，这个快慢和界面的大小和数据的变化量有关，但是 Virtual DOM 能够保证不管数据变化多少，每次重绘的性能都可以接受。

操作 DOM 方案：总渲染时间 = 渲染 DOM 节点的时间

Virtual DOM 方案：总渲染时间 = diff 时间 + 渲染 DOM 节点时间

Virtual DOM 真正的价值从来都不是性能，而是它

- 为函数式的 UI 编程方式打开了大门
- 可以渲染到 DOM 以外的 backend，更好的跨平台

所以总结来说用 Virtual DOM 是因为：

- Virtual DOM 减少了频繁的操作原生 DOM，并且避免程序员操作 DOM 带来的差异性
- diff 过程中将 DOM 的比对操作放在 JS 层，减少浏览器不必要的重绘，提高效率
- 为函数式的 UI 编程方式打开了大门
- 可以渲染到 DOM 以外的 backend，更好的跨平台

## Vue 的 diff 算法

[diff 算法部分](https://github.com/theydy/notebook/issues/27)


简单说就是

- 过滤 oldCh 两侧的空 VNode
- 旧头节点和新头节点、旧尾节点和新尾节点、旧头节点和新尾节点、旧尾节点和新头节点做比较
- 否则将剩余旧头节点至尾节点的元素生成一个 map 表，然后判断新节点的 key 是否命中
