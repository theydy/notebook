# 各种手写题

## 实现 Promise

```js
function MyPromise(fn) {
  this.value = '';
  this.state = 'pending';
  this.resolvedCbs = [];
  this.rejectedCbs = [];

  const resolve = (data) => {
    if (this.state === 'pending') {
      setTimeout(() => {
        this.value = data;
        this.state = 'resolved';
        this.resolvedCbs.map(cb => cb(data));
      });
    }
  }

  const reject = (data) => {
    if (this.state === 'pending') {
      setTimeout(() => {
        this.value = data;
        this.state = 'rejected';
        this.rejectedCbs.map(cb => cb(data));
      });
    }
  }

  try {
    fn(resolve, reject);
  } catch (e) {
    reject(e);
  }
}

MyPromise.prototype.then = function(onResolved, onRejected) {
  if (this.state === 'resolved') {
    return new MyPromise((resolve, reject) => {
      setTimeout(() => {
        const res = onResolved(this.value);
        if (res instanceof MyPromise) {
          res.then(resolve, reject);
        } else {
          resolve(res);
        }
      })
    })
  }

  if (this.state === 'rejected') {
    return new MyPromise((resolve, reject) => {
      setTimeout(() => {
        const res = onRejected(this.value);
        if (res instanceof MyPromise) {
          res.then(resolve, reject);
        } else {
          reject(res);
        }
      })
    })
  }

  if (this.state === 'pending') {
    return new MyPromise((resolve, reject) => {
      this.resolvedCbs.push((data) => {
        const res = onResolved(data);
        if (res instanceof MyPromise) {
          res.then(resolve, reject);
        } else {
          resolve(res);
        }
      });

      this.rejectedCbs.push((data) => {
        const res = onRejected(data);
        if (res instanceof MyPromise) {
          res.then(resolve, reject);
        } else {
          reject(res);
        }
      });
    });
  }
}
```

## 实现 call apply bind

```js
Function.prototype.myCall = function (context, ...args) {
  const fn = this;
  const key = Symbol();
  
  context[key] = fn;
  const res = context[key](...args);
  delete context[key];
  return res;
}

Function.prototype.myApply = function (context, args) {
  const fn = this;
  const key = Symbol();
  
  context[key] = fn;
  const res = context[key](...args);
  delete context[key];
  return res;
}

Function.prototype.myBind = function (context, ...args) {
  const fn = this;
  
  return function (...last) {
    const key = Symbol();
    context[key] = fn;
    const res = context[key](...args, ...last);
    delete context[key];
    return res;
  }
}
```

## 实现 instanceof

```js
function myInstanceof (obj, type) {
  obj = obj.__proto__;

  while(obj !== null) {
    if (obj === type.prototype) {
      return true;
    }
    obj = obj.__proto__;
  }
  return false;
}
```

## 实现柯里化函数

```js
const curry = (fn, ...args) => {
  return (...lastArgs) => 
    [...args, ...lastArgs].length >= fn.length
      ? fn(...args, ...lastArgs)
      : curry(fn, ...args, ...lastArgs);
}
```

## 实现快排

```js
function quickSort(list, left, right) {
  let l = left;
  let r = right;
  let target = list[l];

  if (l >= r) return;

  while(l < r) {
    while(l < r && target <= list[r]) {
      r--;
    }

    if (l < r) {
      list[l] = list[r];
      list[r] = target;
    }

    while(l < r && list[l] <= target) {
      l++;
    }

    if (l < r) {
      list[r] = list[l];
      list[l] = target;
    }
  }

  quickSort(list, left, l - 1);
  quickSort(list, l + 1, right);
}

// test
let a = [1,2,3,22,3,4,43,33,23,4,5,34,56,56,3];
quickSort(a, 0, a.length - 1);
console.log(a);
```

## 实现节流(throttle)、防抖(debounce)

```js
function throttle (delay, fn) {
  let last = 0;
  return function(...args) {
    let self = this;
    let now = +new Date();
    if (now - last >= delay) {
      fn.call(self, ...args);
      last = now;
    }
  }
}

function debounce (delay, fn) {
  let timer = 0;
  return function(...args) {
    let self = this;
    timer && clearTimeout(timer);
    !timer && fn.call(self, ...args);

    timer = setTimeout(() => {
      fn.call(self, ...args);
      timer = 0;
    }, delay);
  }
}
```

## 实现 new

```js
function myNew(fn, ...args) {
  let o = Object.create(fn.ptototype);
  let k = fn.call(o, ...args);
  return (typeof k === 'object' && k !== null) ? k : o;
}
```

## 实现 deepClone

```js
function deepClone (obj, hash = new WeakMap()) {
  if (obj instanceof RegExp) return new RegExp(obj);
  if (obj instanceof Date) return new Date(obj);
  if (typeof obj !== 'object' || obj === null) return obj;
  if (hash.has(obj)) return hash.get(obj);

  let o = new obj.constructor();
  hash.set(obj, o);

  for(let key in obj) {
    if (obj.hasOwnProperty(key)) {
      o[key] = deepClone(obj[key], hash);
    }
  }

  return o;
}
```

## es5 中继承的实现

```js
// 1. 原型继承
// 优：可以继承父类的属性和方法
// 缺：父类属性如果是引用类型，会被所有子类共用；创建子类时，无法向父类传参
function prototypeExtend () {
  function A(){}
  function B(){}

  B.prototype = new A();
  B.prototype.constructor = B;
}

// 2. 构造函数继承
// 优：避免了原型链继承的缺点
// 缺：只继承父类在构造函数中的属性方法，无法继承原型上的属性方法
function constructorExtend () {
  function A(){}
  function B(){
    A.call(this);
  }
}

// 3. 组合继承
//缺：执行了两次父类的构造函数，子类原型上会有多余的父类属性
function combinationExtend () {
  function A(){}
  function B(){
    A.call(this);
  }

  B.prototype = new A();
  B.prototype.constructor = B;
}

// 4. 寄生组合继承
function extend () {
  function A(){}
  function B(){
    A.call(this);
  }

  B.prototype = Object.create(A.prototype);
  B.prototype.constructor = B;
}
```

## 实现发布订阅模式

```js
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(type, cb) {
    if(!this.events[type]) {
      this.events[type] = [];
    }

    this.events[type].push(cb);
  }

  off(type, cb) {
    this.events[type] = this.events[type].filter(c => cb !== c)
  }

  emit(type, ...args) {
    this.events[type].map(cb => cb(...args));
  }
}
```

## 实现数组拍平方法

```js
Array.prototype.myFlat = function (num = 1) {
  const list = this;

  return num > 0 ? list.reduce((acc, item) => {
    return acc.concat(Array.isArray(item) ? item.myFlat(num - 1) : item);
  }, []) : list.slice();
}
```

## 实现 Object.create

```js
function create(prototype) {
  const F = function(){};
  F.prototype = prototype;
  return new F();
}
```

## 实现 Vue 数据响应式

```js
class Dep {
  constructor() {
    this.subs = new Set();
  }

  depend() {
    this.subs.add(Dep.target);
  }

  notify() {
    [...this.subs].map(watcher => watcher.update());
  }
}
Dep.target = null;

class Observer {
  constructor(obj) {
    this.dep = new Dep();

    if (Array.isArray(obj)) {
      obj.map(val => observe(val));
    } else {
      this.walk(obj);
    }
  }

  walk(obj) {
    Object.keys(obj).map(key => {
      defineReactive(obj, key, obj[key])
    })
  }
}

class Watcher {
  constructor(get) {
    this.getter = get;
    this.get();
  }

  get() {
    Dep.target = this;
    this.getter();
    Dep.target = null;
  }

  update() {
    this.get();
  }
}

function observe (obj) {
  if (typeof obj !== 'object' || obj === null) return;
  if (obj.__ob__) return obj.__ob__;

  obj.__ob__ = new Observer(obj);
  return obj.__ob__;
}

function defineReactive (target, key, val) {
  let childOb = observe(val);
  let dep = new Dep();

  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
      }
      console.log('get value');
      return val;
    },
    set(nv) {
      childOb = observe(nv);
      val = nv;
      dep.notify();
      console.log('change value')
    }
  })
}

// test 
let obj = {
  name: 'AAA',
  age: 23,
  job: {
    name: 'FE',
    salary: 1000
  }
};

observe(obj);

new Watcher(() => {
  return obj.name;
})

obj.name = '111';

obj.job.name = 'eee';
```

## 虚拟 Dom 转为真实 Dom

```js
let template = {
  tag: 'DIV',
  attrs:{
  id:'app'
  },
  children: [
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: [123] }
      ]
    },
    {
      tag: 'SPAN',
      children: [
        { tag: 'A', children: ['abcd'] },
        { tag: 'A', children: [] }
      ]
    }
  ]
}

function _render(vnode) {
  if (typeof vnode === 'number' || typeof vnode === 'string') {
    return document.createTextNode(vnode);
  }

  let dom = document.createElement(vnode.tag);

  if (vnode.attrs) {
    Object.keys(vnode.attrs).map(attr => {
      dom.setAttribute(attr, vnode.attrs[attr]);
    })
  }

  if (vnode.children && vnode.children.length) {
    vnode.children.map(child => {
      dom.appendChild(_render(child));
    })
  }

  return dom;
}

// test
_render(template);
```

## 通过字符串获取对对象属性

```js
function getValue(obj, pathStr) {
  const path = pathStr.split('.')
  let key
  while(key = path.shift()) {
    if (typeof obj === 'object' && obj !== null) {
      obj = obj[key]
    } else {
      return undefined
    }
  }

  return obj
}
```

## 字符串模板替换

```js
function getParams(temp) {
  let t = temp
  let reg = /\{\{.*?\}\}/ig
  return t.match(reg)
}

function getValue(obj, pathStr) {
  const path = pathStr.match(/\{\{(.*?)\}\}/i)[1].trim().split('.')
  let key
  while(key = path.shift()) {
    if (typeof obj === 'object' && obj !== null) {
      obj = obj[key]
    } else {
      return undefined
    }
  }

  return obj
}

function template(temp, ...args) {
  const params = getParams(temp)
  let param
  while(param = params.shift()) {
    temp = temp.replace(param, getValue({...args}, param))
  }

  return temp
}

// test
let obj = {
  a: {
    b: '222',
    c: '333',
  }
}
let test = 'hello {{ obj.a.b }} !!!, {{ obj.a.c }} {{ obj.a.c }}'
template(test, obj) // hello 222 !!!, 333

```

## 请求失败重复发送

```js
function replyPromise(fn, count) {
  return new Promise(async (resolve, reject) => {
    while(count) {
      try {
        let res = await new Promise(fn)
        resolve(res)
      } catch (e) {
        count--
        if (count) {
          console.log('repo')
        } else {
          reject(e)
        }
      }
    }
  })
}

// test
let fn = (resolve, reject) => {
  setTimeout(() => {
    reject('error')
  }, 500)
}
replyPromise(fn, 3).catch(e => console.log(e))
```

## 实现简单路由

```js
// hash路由
class Route{
  constructor(){
    // 路由存储对象
    this.routes = {}
    // 当前hash
    this.currentHash = ''
    // 绑定this，避免监听时this指向改变
    this.freshRoute = this.freshRoute.bind(this)
    // 监听
    window.addEventListener('load', this.freshRoute)
    window.addEventListener('hashchange', this.freshRoute)
  }
  // 存储
  storeRoute (path, cb) {
    this.routes[path] = cb || function () {}
  }
  // 更新
  freshRoute () {
    this.currentHash = location.hash.slice(1) || '/'
    this.routes[this.currentHash]()
  }
}
```

## 代码输出题

### 异步 & 事件循环

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  console.log(2);
});

promise.then(() => {
  console.log(3);
});
console.log(4);

// 1 2 4
// 注意没有调用 resolve 走不到 then
```

```js
const promise1 = new Promise((resolve, reject) => {
  console.log('promise1')
  resolve('resolve1')
})
const promise2 = promise1.then(res => {
  console.log(res)
})
console.log('1', promise1);
console.log('2', promise2);

// promise1
// 1 Promise{<resolved>: resolve1}
// 2 Promise{<pending>}
// resolve1
```

```js
const promise = new Promise((resolve, reject) => {
  console.log(1);
  setTimeout(() => {
    console.log("timerStart");
    resolve("success");
    console.log("timerEnd");
  }, 0);
  console.log(2);
});
promise.then((res) => {
  console.log(res);
});
console.log(4);

// 1 2 4
// timerStart timerEnd success
```

```js
Promise.resolve().then(() => {
  console.log('promise1');
  const timer2 = setTimeout(() => {
    console.log('timer2')
  }, 0)
});
const timer1 = setTimeout(() => {
  console.log('timer1')
  Promise.resolve().then(() => {
    console.log('promise2')
  })
}, 0)
console.log('start');

// start promise1 timer1 promise2 timer2
```

```js
Promise.resolve().then(() => {
  return new Error('error!!!')
}).then(res => {
  console.log("then: ", res)
}).catch(err => {
  console.log("catch: ", err)
})

// "then: " "Error: error!!!"
// 返回任意一个非 promise 的值都会被包裹成 promise 对象，因此这里的 return new Error('error!!!')
// 也被包裹成了 return Promise.resolve(new Error('error!!!'))，因此它会被 then 捕获而不是 catch。
```

```js
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
  setTimeout(() => {
    console.log('timer1')
  }, 0)
}
async function async2() {
  setTimeout(() => {
    console.log('timer2')
  }, 0)
  console.log("async2");
}
async1();
setTimeout(() => {
  console.log('timer3')
}, 0)
console.log("start")

// async1 start
// async2
// start
// async1 end
// timer2
// timer3
// timer1
```

### this 指向

```js
window.number = 2;
var obj = {
 number: 3,
 db1: (function(){
   console.log(this);
   this.number *= 4;
   return function(){
     console.log(this);
     this.number *= 5;
   }
 })()
}
var db1 = obj.db1;
db1();
obj.db1();
console.log(obj.number);     // 15
console.log(window.number);  // 40
```

### 作用域 & 变量提升 & 闭包

```js
(function(){
   var x = y = 1;
})();
var z;

console.log(y); // 1
console.log(z); // undefined
console.log(x); // Uncaught ReferenceError: x is not defined
// var x = y = 1，从右到左执行，y = 1 时没有使用 var 声明，所以是一个全局变量
// 之后赋值给局部变量 x
```

```js
var a, b
(function () {
   console.log(a);
   console.log(b);
   var a = (b = 3);
   console.log(a);
   console.log(b);   
})()
console.log(a);
console.log(b);

// undefined 
// undefined 
// 3 
// 3 
// undefined 
// 3
```

```js
var name = 'World';
(function() {
  if (typeof name === 'undefined') {
    var name = 'Jack';
    console.log('Goodbye ' + name);
  } else {
    console.log('Hello ' + name);
  }
})();

// Goodbye Jack
```



