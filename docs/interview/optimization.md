# 性能优化

## CDN 加速

利用最靠近每位用户的服务器，更快、更可靠地将音乐、图片、视频、应用程序及其他文件发送给用户

## 图片懒加载

### js 计算 image 标签是否出现在可视区域

- window.innerHeight 是浏览器可视区的高度
- document.body.scrollTop || document.documentElement.scrollTop 是浏览器滚动的过的距离
- img.offsetTop 是元素顶部距离文档顶部的高度（包括滚动条的距离）
- 图片加载条件：img.offsetTop < window.innerHeight + document.body.scrollTop

### IntersectionObserver

IntersectionObserver 接口 (从属于Intersection Observer API) 提供了一种异步观察目标元素与其祖先元素或顶级文档视窗(viewport)交叉状态的方法。祖先元素与视窗(viewport)被称为根(root)。

## 合理使用缓存

js 文件、css 文件等静态资源使用**强缓存**，这些静态资源修改后一帮都会改文件名，比如 js、css 重新打包后会带 hash

入口文件 index 等名字不会变但内容常变的文件使用**协商缓存**

## 节流防抖

- 函数防抖：是指在事件被触发 n 秒后再执行回调，如果在这 n 秒内事件又被触发，则重新计时。这可以使用在一些点击请求的事件上，避免因为用户的多次点击向后端发送多次请求。
- 函数节流：是指规定一个单位时间，在这个单位时间内，只能有一次触发事件的回调函数执行，如果在同一个单位时间内某事件被触发多次，只有一次能生效。节流可以使用在 scroll 函数的事件监听上，通过事件节流来降低事件调用的频率。

防抖函数的应用场景：

- 按钮提交场景：防⽌多次提交按钮，只执⾏最后提交的⼀次

节流函数的适⽤场景：

- 拖拽场景：固定时间内只执⾏⼀次，防⽌超⾼频次触发位置变动
- 缩放场景：监控浏览器 resize
- 动画场景：避免短时间内多次触发动画引起性能问题

## 图片优化

- css 代替图片
- 小图使用 base64
- 图片格式：JPG 适合用于大图，如背景之类的、PNG 适合用于精度要求高或透明要求的图、WebP 新格式能用最好

## WebPack 优化

### 减少打包体积

- 压缩代码：以利⽤ webpack 的 UglifyJsPlugin 来压缩 JS ⽂件， 利⽤ cssnano （css-loader?minimize）来压缩css
- 按需加载：如将每个路由页面单独打包为一个文件
- Tree Shaking：删除未使用的代码
- 提取公共第三方库：SplitChunksPlugin