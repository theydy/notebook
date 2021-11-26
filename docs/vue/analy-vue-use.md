# Vue.use 原理

[Vue.use的原理](https://juejin.cn/post/6859944479223185416)

1.通过全局方法 `Vue.use()` 使用插件。它需要在调用 `new Vue()` 启动应用之前完成
2.`Vue.use` 会自动阻止多次注册相同插件，届时即使多次调用也只会注册一次该插件。

`Vue.use()` 注册一个插件，这个插件是一个有 `install` 方法的对象。格式如下：

```js
export default {
  install(Vue, options) {
    // do something
  }
}
```

## 由此衍生出的全局单例组件实现

## api 式 dialog

[Vue中你不知道但却很实用的黑科技](https://segmentfault.com/a/1190000007694540)

使用方式大致如下：

```js
this.$dialog('hello');
```

隐式创建 Vue 实例
