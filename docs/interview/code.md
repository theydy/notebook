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
    return new Promise((resolve, reject) => {
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
    return new Promise((resolve, reject) => {
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
    return new Promise((resolve, reject) => {
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
  const result = context[key](...args);
  delete context[key];
  return result;
}

Function.prototype.myApply = function (context, args) {
  const fn = this;
  const key = Symbol();
  
  context[key] = fn;
  const result = context[key](...args);
  delete context[key];
  return result;
}

Function.prototype.myBind = function (context, ...args) {
  const fn = this;
  
  return function(...lastArgs) {
    return fn.myApply(context, [...args, ...lastArgs]);
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
      list[l] = list[r];
      list[r] = target;
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
    timer = setTimeout(() => {
      fn.call(self, ...args);
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
    const events = this.events[type] || [];
    const index = events.findIndex(item => item === cb);

    index > -1 && events.splice(index, 1);
  }

  emit(type, ...args) {
    (this.events[type] || []).map(cb => cb(...args));
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

function observe (obj) {
  if (typeof obj !== 'object' || obj === null) return;
  if (obj.__ob__) return;

  obj.__ob__ = true;
  Object.keys(obj).map(key => {
    defineReactive(obj, key, obj[key])
  })
}

function defineReactive (target, key, val) {
  observe(val);

  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log('get value');
      return val;
    },
    set(nv) {
      observe(nv);
      val = nv;
      console.log('change value')
    }
  })
}

// test 
const obj = {
  name: 'AAA',
  age: 23,
  job: {
    name: 'FE',
    salary: 1000
  }
};

observe(obj);
const name = obj.name;
obj.name = 'BBB';
const jobName = obj.job.name;
obj.job.name = 'fe';
```


