# node

## 第三方库

### fs-extra

[Github](https://github.com/jprichardson/node-fs-extra)

#### 简单用法

```js
const fs = require('fs-extra');

// 复制文件或目录
fs.copy('/tmp/myfile', '/tmp/mynewfile')
  .then(() => console.log('success!'))
  .catch(err => console.error(err));
```
