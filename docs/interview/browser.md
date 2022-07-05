# 浏览器相关

## v8 垃圾回收

v8 把堆内存分为新生代和老生代，两边执行的垃圾回收算法不同。

新生代存放生存时间短的对象，新生代又会被平分成 to from 两个区，当执行垃圾回收时，会把标记为存活的对象从 from 移到 to，然后回收 from 中剩余的对象，from to 两个区交换。

有两种情况，会将对象从新生代移到老生代：

1. 经历了一次垃圾回收
2. to 空间使用超过了 25%

新生代和老生代判断对象是否存活的策略都是相同的，都是从 `window` 开始，将其视为一个根节点，然后遍历子节点，所有能访问到的节点都标记为存活节点，不能访问到的节点视为需要回收的节点。

老生代标记出存活对象后，会把存活对象往内存的一端移动，然后将存活对象分界线另一端的对象全部回收，这样主要是为了避免内存的碎片化的问题。

## 回流 重绘

回流：修改 DOM 树的结构，改变元素的大小（width、height）、位置（top、left），改变浏览器的窗口大小，查询某些属性或者调用某些方法等

重绘：改变元素的 color、background、border-style 等。

回流必定重绘，重绘不一定回流。

### 如何避免回流和重绘

- 不要使用 table 布局，一个小改动可能会使整个 table 进行重新布局
- 使用 absolute 或者 fixed，使元素脱离文档流，这样他们发生的变化不会影响其他元素
- 把多个 DOM 的读操作或者写操作分开写，而不是读写穿插着写，基于渲染队列的优化

浏览器针对页面的回流与重绘，进行了自身的优化——**渲染队列**，工作原理如下：遇到一行**修改样式**的代码，先放到渲染队列中，继续看下面一行代码是否还为修改样式的，如果是继续增加到渲染队列中...直到下面的代码不再是修改样式的，而是获取样式的代码！此时不再向渲染队列中增加，把之前渲染队列中要修改的样式一次性渲染到页面中，引发一次 DOM 的回流和重绘。

即相当于，如果是 `写 写 读` 只触发一次重排；`写 读 写 读` 会触发两次重排，`写`放在队列中，碰到`读`一起执行；`读 读` 应该还是两次重排。

## 浏览器输入 URL 到显示发生了什么

- 解析 URL
- 强缓存判断
- DNS 解析：向 DNS 服务器发起请求，解析该 URL 中的域名对应的 IP 地址，浏览器缓存 -> 本地 DNS 服务器 -> 根域名服务器 -> 顶级域名服务器 -> 权威域名服务器 的顺序查找域名对应的 IP 地址，查找 DNS 的请求大部分情况下使用 UDP 协议传输数据
- 建立 TCP 连接：三次握手
- HTTPS 的话，这里开始 TLS 连接
- 发送请求，服务器响应请求
- 浏览器接受到请求，HTML → DOM 树、CSS → CSS 规则树，结合 DOM 树和 CSS 规则树 → 布局树（Javascript 的执行会阻塞 DOM 树的构建、构建 CSSOM 树会阻塞 Javascript 的执行）
- 建立图层树
- 最后绘制
- 断开 TCP 连接：四次挥手

## 跨域

**同源策略**

同源策略是指，一个源的客户端脚本在没有明确授权的情况下，不能访问另一个源的客户端脚本。当一个URL和另一个URL，只要**协议**、**域名**或者**端口号**有一个不同，则就会出现跨域。 解决跨域常用方法有：

### JSONP

JSONP 实现跨域的原理是利用 script 标签没有跨域限制，通过 src 指向一个 ajax 的 URL，最后跟一个回调函数 callback。

```js
// 一个JSONP跨域的案例
<script 
  src="http://www.baidu.com/getUserInfo?name=张三&callback=xxx"
></script>
// JSONP 实现
var jsonp = function (url, data, callback) {
  var cbName = 'callback_' + new Date().getTime();
  var queryString = url.indexOf('?') == -1 ? '?' : '&';
  for (var k in data) {
    queryString += k + '=' + data[k] + '&';
  }
  queryString += 'callback=' + cbName;
  var script = document.createElement('script');
  script.src = url + queryString;
  window[cbName] = function (data) {
    callback(data);
    document.body.removeChild(script);
  };
  document.body.appendChild(script);
}
```

### CORS

`CORS` 需要浏览器和后端同时配合才能生效，后端通过设置 `Access-Control-Allow-Origin` 就可以开启哪些域名可以使用 `CORS` 跨域，在进行 `CORS` 跨域请求时，会出现简单请求或者复杂请求。

**CORS简单请求**：当请求方式为`get`，`head`、`post`之一、请求头不超过固定的`几种字段`，并且`Content-Type`为`text/plain`、`multipart/form-data`、`application/x-www-form-urlencoded`三种之一时，就是简单请求。

HTTP 的头信息不超出以下几种字段：

- Accept
- Accept-Language
- Content-Language
- Content-Type （需要注意额外的限制）
- DPR
- Downlink
- Save-Data
- Viewport-Width
- Width

**CORS复杂请求：** 当不符合简单请求时，就是复杂请求，对于复杂请求来说，首先会发送一个`option`请求，用于知道服务器是否允许跨域请求。

### document.domain

### postMessage
