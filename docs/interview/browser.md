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

回流：修改 DOM 树的结构，改变元素的大小（width、height）、位置（top、left）等

重绘：改变元素的 color、border-style 等。

回流必定重绘，重绘不一定回流。

## 浏览器输入 URL 到显示发生了什么

- 强缓存判断
- DNS 解析：浏览器缓存 -> 本地缓存 -> 路由缓存 -> 网络提供商的 DNS 服务器 -> 根服务器 的顺序查找域名对应的 IP 地址，查找 DNS 的请求大部分情况下使用 UDP 协议传输数据
- 建立 TCP 连接：三次握手
- 发送请求，服务器响应请求
- 浏览器接受到请求，HTML → DOM 树、CSS → CSSOM 树，结合 DOM 树和 CSSOM 树 → 渲染树（Javascript 的执行会阻塞 DOM 树的构建、构建 CSSOM 树会阻塞 Javascript 的执行）
- 布局
- 绘制
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

**CORS简单请求**：当请求方式为`get`，`head`、`post`之一并且`Content-Type`为`text/plain`、`multipart/form-data`、`application/x-www-form-urlencoded`三种之一时，就是简单请求。

**CORS复杂请求：** 当不符合简单请求时，就是复杂请求，对于复杂请求来说，首先会发送一个`option`请求，用于知道服务器是否允许跨域请求。

### document.domain

### postMessage
