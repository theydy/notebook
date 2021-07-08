# 其他

## vue-loader 自定义块

[vue-lodaer 自定义块](https://vue-loader.vuejs.org/zh/guide/custom-blocks.html)

vue 文件中可以写自定义块，按照文档所说，如果没有写 rule 来处理这些自定义块的内容，默认会忽略，但是实际上只在 vue 文件配置的 loader 为 vue-loader 或者一个 vue-loader 和一个 cache-loader 才忽略，如果有加其他 loader 就必须配置针对自定义块的 rule，否则 vue-loader 就会报错。

vue-loader 针对忽略自定义块的逻辑在 pitcher.js 文件中。

[vue-loader github pitcher.js](https://github.com/vuejs/vue-loader/blob/b53ae44e4b9958db290f5918248071e9d2445d38/lib/loaders/pitcher.js)

```js
//...
const shouldIgnoreCustomBlock = loaders => {
  const actualLoaders = loaders.filter(loader => {
    // vue-loader
    if (loader.path === selfPath) {
      return false
    }

    // cache-loader
    if (isCacheLoader(loader)) {
      return false
    }

    return true
  })
  return actualLoaders.length === 0
}
//...

module.exports.pitch = function (remainingRequest) {
  if (query.type === `custom` && shouldIgnoreCustomBlock(loaders)) {
    return ``
  }
  //...
}
```

### 自定义块 rule 的配置

chainWebpack 配置

```js
{
  chainWebpack: (config) => {
    const vue = config.module.rule('vue');

    vue.uses.clear();
    vue
      .test(/\.vue$/)
      .use('vue-loader')
      .loader('vue-loader')
      .end()
      .use('vue-dev-inspector')
      .loader('../src/vue-dev-inspector')
      .end()
    
    config.module.rule('custome-block.js')
      .resourceQuery(/blockType=docs/)
      .use('docs-loader')
      .loader('../src/custom-block.js')
      .end()
  }
}
```

webpack 配置

```js
{
  module: {
    rules: [
      {
        resourceQuery: /blockType=(name|docs)/,
        type: 'javascript/auto',
        loader: path.resolve('build/webpack/loader/custom-block.js'),
      },
    ]
  }
}
```

### 自定义块 loader 例子

```js

module.exports = function (source, map) {
  this.callback(
    null,
    `export default function (Component) {
      Component.options.__docs = ${
        JSON.stringify(source)
      }
    }`,
    map
  )
}

// module.exports = function (source, map) {
//   this.callback(null, `export default function (Component) {}`, map);
// };
```
