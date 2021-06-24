# 前端安全

## XSS（跨域脚本攻击）

攻击方式：通过评论执行代码，通过 GET 请求的参数执行代码

防御措施：对于用户输入进行转码过滤，开启 HttpOnly 禁止 js 读取 cookie，开启 CSP 内容安全策略。

### CSP

设置 CSP 的方法有两种，

#### 前端

在html 里加上 `<meta>` 标签

```html
<meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'none'; style-src 'self' cdn.example.org third-party.org; child-src https:">
```

#### 后端

在 response header 里加上 Content-Security-Policy 字段

**需要注意⚠️**：如果在调试时，本地npm run serve 启服务服务端其实是 node，然后把 api 请求接口代理到后台服务器，
这时候即使后台配置了 CSP 也是无效的，要以 node 服务器配置的 CSP 为准，但是一般来说 node 都不会配 CSP，所以
要注意出现本地调试没问题，上到测试环境凉凉的情况。

## CSRF（跨域请求伪造）

攻击方式：自动向其他域名发送 GET / POST 请求

防御措施：利用 Cookie 的 SameSite 属性，限制请求携带 Cookie，通过 Origin 和 Referrer 验证来源站点，请求加上 CSRF token

### SameSite

- Strict：最为严格，完全禁止第三方 Cookie，跨站点时，任何情况下都不会发送 Cookie。
- Lax：导航到目标网址的 Get 请求（链接，预加载请求，GET 表单）才会携带 Cookie。
- None：无设置
