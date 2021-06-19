---
sidebar: auto
---

# snippets

## axios 使用封装

```js
import axios from 'axios';
import qs from 'qs';

const axiosGet = (url, data, opts) => {
  return axios.get(url, {
    params: { ...data },
    opts,
  });
};

const axiosPost = (url, data, opts = {}) => {
  const { isFormData = true } = opts;
  delete opts.isFormData;
  const formData = isFormData ? qs.stringify(data) : data;
  return axios.post(url, formData, opts);
};

export default {
  api () {
    return axiosGet('');
  },
};
```

## axios 请求返回图片流

```js
// 如果接口直接返回图片文件，并且不是 get 请求
import axios from 'axios';

const api = (data) => {
  // 首先请求头需要设置接受类型为 arraybuffer
  return axios.post('/api/url', data, { responseType: 'arraybuffer' });
  // return axios.get('/api/url',{ params: {...data}, responseType: 'arraybuffer' });
}

const blobToBase64 = (data) => {
  // 流数据转为二进制再转为base64形式
  const datas = new Uint8Array(data);
  const biranyDatas = datas.reduce((data, byte) => data + String.fromCharCode(byte), '');
  return btoa(biranyDatas);
}

const getImg = async () => {
  // 请求图片
  try {
    const data = {};
    const res = await api(data);
    const imageBase64 = blobToBase64(res.data);
    return `data:image/png;base64,${imageBase64}`;
  } catch (e) {
    console.log(e);
  }
}

getImg();
```

## uuid

```js
const getUuid = () => {
    // 随机生成 uuid, 类似 uuid v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
}
```

## arrayBuffer <-> string

```js
// string -> arrayBuffer
function String2ArrayBuffer(str, cb) {
  const b = new Blob([str]);
  const f = new FileReader();
  f.onload = function(e) {
    cb(e.target.result);
  }
  f.readAsArrayBuffer(b);
}

String2ArrayBuffer('test', (buf) => { 
  const data = new Uint8Array(buf);
  console.log(data);
})


// arrayBuffer -> string
function ArrayBuffer2String(buf) {
  const datas = new Uint8Array(buf);
  const biranyDatas = datas.reduce((data, byte) => data + String.fromCharCode(byte), '');
  console.log(biranyDatas);
}

ArrayBuffer2String('buf');
```

## 在移动端模仿 el-form 表单提交的方式使用校验函数

```js
class ValidatorClass {
  // 表单数据，校验规则
  constructor(form, rules) {
    this.form = form;
    this.rules = rules;
  }

  initRequired(temp, message) {
    const requiredFunc = (rule, value, callback) => value ? callback() : callback(new Error(message || ''));
    this.initValidators(temp, requiredFunc);
  }

  initValidators(temp, validator) {
    (temp.validators || (temp.validators = [])).push(validator);
  }

  format(rules, val) {
    const temp = {};
    temp.val = val;
    rules.map(rule => {
      rule.required && this.initRequired(temp, rule.message);
      rule.validator && this.initValidators(temp, rule.validator);
    })
    return temp;
  }

  // 校验方法
  validator(cb) {
    const validatorsPromiseList = [];
    const keys = Object.keys(this.form);

    return new Promise((resolve, reject) => {
      keys.map(key => {
        const rule = this.rules[key];
        const temp = this.format(rule, this.form[key]);

        if (temp.validators) {
          temp.validators.map(validator => {
            validatorsPromiseList.push(
              new Promise((res, rej) => validator(rule, temp.val, res))
            );
          })
        } else {
          resolve();
        }
      });


      Promise.all(validatorsPromiseList).then(res => {
        const errors = res.filter(r => r);
        resolve(errors.length ? errors : undefined);
      })
    }).then(res => cb(res));
  }
}
/**
 * how to use ?
 * type TypeForm = { [k: string]: string | number | undefined }
 * type rules = {
 *  [k in keyof TypeForm]: ({ 
 *     required?: boolean,
 *     message?: string,
 *     validator?: (rule, value, callback) => void
 *   })[]
 * }
 * 
 * new ValidatorClass(form, rules).validator(res => {
 *   if (!res) { console.log('success') }
 *   else { this.$message(res[0].message) }
 * })
 */
```

## 前置条件验证

```ts
let conditions = [{
  errorCondition: () => {
      const pipeData = 'pipeData';
      return {
        isError: true,
        data: pipeData,
      };
    },
    callback: () => { },
}, {
  errorCondition: async () => {
    const res: any = await new Promise(resolve => {
      setTimeout(() => resolve({ code: 0 }), 3000);
    });
    return {
      isError: res.code !== 0,
    };
  },
}, {
  errorCondition: () => {
    return {
      isError: true,
    };
  },
}];

type ErrorCondition = (...args: unknown[]) => { isError: boolean, data?: unknown } | Promise<{ isError: boolean, data?: unknown }>;
type Conditions = ({ errorCondition: ErrorCondition, callback?: (...args: unknown[]) => unknown })[];

let craeteVerifyConditions = (conditions: Conditions) => {
  const allCondition = conditions;

  return {
    run: async () => {
      let pipeData: unknown;
      for (let condition of allCondition) {
        const { callback = () => { }, errorCondition } = condition;
        const { isError, data } = await errorCondition(pipeData);
        data ? (pipeData = data) : (pipeData = undefined);
        if (isError) return callback;
      }
    },
    install: (conditions: Conditions) => {
      allCondition.push(...conditions);
    }
  };
};

let verify = craeteVerifyConditions(conditions);

verify.run().then(res => console.log(res));
```

## webpack 快速引入某个文件下的所有.vue 文件

```js
const subComponents= {};
const context = require.context('./', false, /^\.\/columns-style-.*\.vue/);

context.keys().forEach(key => {
    const sfc = context(key).default;
    const componentName = key.replace(/^\.\/(.*)\.vue$/, '$1');

    subComponents[componentName] = sfc;
});
```

## js 使用 canvas 压缩图片

[js图片压缩](https://www.zoo.team/article/image-compress)

```js
function handleCompressImage(img, newW, newH, type) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(img);
    reader.onload = function(e) {
      const image = new Image();
      image.src = e.target.result;
      image.onload = function() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const imageWidth = image.width;
        const imageHeight = image.height;
        
        // 缩小后的尺寸
        // newW = parseInt(imageWidth / 3);
        // newH = parseInt(imageHeight / 3);

        // 画布大小需要刚好设置为缩小后的尺寸，否则填不满，背景会有空白
        canvas.width = newW;
        canvas.height = newH;

        // 图片 原图起始坐标 x, y, 原图原始 宽, 高, 绘制在画布上的坐标 x, y, 绘制在画布上的 宽, 高
        context.drawImage(image, 0, 0, imageWidth, imageHeight, 0, 0, newW, newH);

        resolve({ image: canvas.toDataURL(`image/${type}`) });
      };
    };
  });
}
```

## 拖动窗口指令 v-el-draggable-dialog

```js
export const elDraggableDialog = {
  bind(el, _, vnode) {
    const dragDom = el.querySelector('.el-dialog');
    const dialogHeaderEl = el.querySelector('.el-dialog__header');
    dragDom.style.cssText += ';top:0px;';
    dialogHeaderEl.style.cssText += ';cursor:move;';

    dialogHeaderEl.onmousedown = (e) => {
      const disX = e.clientX - dialogHeaderEl.offsetLeft;
      const disY = e.clientY - dialogHeaderEl.offsetTop;

      const dragDomWidth = dragDom.offsetWidth;
      const dragDomHeight = dragDom.offsetHeight;

      const screenWidth = document.body.clientWidth;
      const screenHeight = document.body.clientHeight;

      const minDragDomLeft = dragDom.offsetLeft;
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth;

      const minDragDomTop = dragDom.offsetTop;
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight;

      const styleLeftStr = getComputedStyle(dragDom).left;
      const styleTopStr = getComputedStyle(dragDom).top;
      if (!styleLeftStr || !styleTopStr) return
      let styleLeft;
      let styleTop;

      // Format may be "##%" or "##px"
      if (styleLeftStr.includes('%')) {
        styleLeft = +document.body.clientWidth * (+styleLeftStr.replace(/%/g, '') / 100);
        styleTop = +document.body.clientHeight * (+styleTopStr.replace(/%/g, '') / 100);
      } else {
        styleLeft = +styleLeftStr.replace(/px/g, '');
        styleTop = +styleTopStr.replace(/px/g, '');
      }

      document.onmousemove = (e) => {
        let left = e.clientX - disX;
        let top = e.clientY - disY;

        // Handle edge cases
        if (-(left) > minDragDomLeft) {
          left = -minDragDomLeft;
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft;
        }
        if (-(top) > minDragDomTop) {
          top = -minDragDomTop;
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop;
        }

        // Move current element
        dragDom.style.cssText += `;left:${left + styleLeft}px;top:${top + styleTop}px;`;

        // Emit on-dialog-drag event
        // See https://stackoverflow.com/questions/49264426/vuejs-custom-directive-emit-event
        if (vnode.componentInstance) {
          vnode.componentInstance.$emit('on-dialog-drag');
        } else if (vnode.elm) {
          vnode.elm.dispatchEvent(new CustomEvent('on-dialog-drag'));
        }
      }

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      }
    }
  }
}

// Vue.directive('el-draggable-dialog', elDraggableDialog); // v-el-draggable-dialog
```

## 支持嵌套 el-dropdown

```js
// element-ui/packages/dropdown/src/dropdown.vue (lines: 227)
// element-ui@2.11.0
{
  // ...
  initEvent() {
    // ...

    if (trigger === 'hover') {
      // 添加代码
      const secondaryDropDown = [];
      let children = [...this.$children];
      while (children.length) {
        const deepChildren = [];
        children.map(child => {
          child.$options.componentName === 'ElDropdown' && secondaryDropDown.push(child);
          if (child.$children.length) {
            deepChildren.push(...child.$children);
          }
        })
        children = deepChildren.length ? deepChildren : [];
      }
      secondaryDropDown.map(secondary => {
        secondary.dropdownElm.addEventListener('mouseenter', show);
        secondary.dropdownElm.addEventListener('mouseleave', hide);
      })
      // 添加代码 end
      this.triggerElm.addEventListener('mouseenter', show);
      this.triggerElm.addEventListener('mouseleave', hide);
      dropdownElm.addEventListener('mouseenter', show);
      dropdownElm.addEventListener('mouseleave', hide);
    } else if (trigger === 'click') {
      this.triggerElm.addEventListener('click', handleClick);
    }

    // ...
  }
}
```

## vue 全局广播方法

```js
// 向上
function dispatch(componentName, eventName, params) {
  var parent = this.$parent || this.$root;
  var name = parent.$options.componentName;

  while (parent && (!name || name !== componentName)) {
  parent = parent.$parent;

    if (parent) {
      name = parent.$options.componentName;
    }
  }
  if (parent) {
      parent.$emit.apply(parent, [eventName].concat(params));
    }
}
// 向下
function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    var name = child.$options.componentName;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}
```
