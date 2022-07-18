# javascript 基础

## 数据类型

JavaScript 共有八种数据类型，分别是 Undefined、Null、Boolean、Number、String、Object、Symbol、BigInt。

这些数据可以分为原始数据类型和引用数据类型：
- 原始数据类型（存储在栈中）：Undefined、Null、Boolean、Number、String
- 引用数据类型（存储在堆中）：Object

## 数据类型检测的方式

### typeof

除了数组、对象、null 都会被判断为 object，其他判断都正确

```js
console.log(typeof 2);               // number
console.log(typeof true);            // boolean
console.log(typeof 'str');           // string
console.log(typeof []);              // object    
console.log(typeof function(){});    // function
console.log(typeof {});              // object
console.log(typeof undefined);       // undefined
console.log(typeof null);            // object
```

### instanceof

instanceof 其内部运行机制是判断在其原型链中能否找到该类型的原型，只能正确判断引用数据类型，而不能判断基本数据类型。

### Object.prototype.toString.call()

可以准确判断数据类型。之所以要使用 Object 原型上的 toString 方法做判断，是因为 Array、Function 等类型作为 Object 的实例，都重写了 toString 方法。

```js
var toString = Object.prototype.toString;

console.log(toString.call(2));                // [object Number]
console.log(toString.call(true));             // [object Boolean]
console.log(toString.call('str'));            // [object String]
console.log(toString.call([]));               // [object Array]
console.log(toString.call(function(){}));     // [object Function]
console.log(toString.call({}));               // [object Object]
console.log(toString.call(undefined));        // [object Undefined]
console.log(toString.call(null));             // [object Null]
```

## 0.1 + 0.2 ! == 0.3 ？

因为实际上数字是以二进制的形式存储的，而浮点数十进制转二进制，整数部分是不停的除 2 取余数逆序，小数部分是不停的乘 2 取整数正序。

0.1 二进制表示是 0.0001100110011001100...（1100循环），0.2 二进制表示是：0.00110011001100...（1100循环）。都不能准确表示，在允许的存储范围外会舍弃，遵从“0舍1入”的原则，自然存在精度问题。

如果两个浮点数相加正好相等，那是运气，说明误差范围正好都在舍弃的部分。

## 原型 / 原型链

### prototype

每个函数都有一个 `prototype` 属性。

**这个 `prototype` 属性指向的是使用该函数做为构造函数生成对象的原型。**

🌰：

```js
function A(){}

const a = new A()

a.__proto__ === A.prototype // true
```

这里引出另一条原型链的指向规律：**对于每个普通对象来说，都有一个 `__proto__` 指向它的原型。**

对于函数来说，既有 `prototype` 又有 `__proto__` 。

### constructor

**每个原型都有一个 constructor 属性指向关联的构造函数。**

```js
function A(){}

A === A.prototype.constructor // true
```

综上所述，如果要手动指定一个构造函数的原型链的话，应该这样指定。这就是原型链继承。

```js
function A(){}

const origin = { origin: true };

origin.constructor = A;
A.prototype = origin;
```

### 原型链

当读取对象的属性时，如果找不到，就会查找与对象关联的原型中的属性，如果还查不到，就去找原型的原型，一直找到最顶层为止。

最顶层即：`Object.prototype.__proto__ === null`

对象通过 `__proto__` 属性与原型对象连接，直到 `null` 的这条链状结构就是原型链。

### __proto__

__proto__ 并不存在于原型上，实际上，它是来自于 Object.prototype ，与其说是一个属性，不如说是一个 getter/setter，当使用 obj.__proto__ 时，可以理解成返回了 `Object.getPrototypeOf(obj)`。

## 继承

### es5 的继承

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

### es5 与 es6 class 继承的不同

## 作用域链

当 JavaScript 代码执行一段可执行代码(executable code)时，会创建对应的执行上下文(execution context)。

对于每个执行上下文，都有三个重要属性：

- 变量对象(Variable object，VO)
- 作用域链(Scope chain)
- this

当查找变量时，会先从当前上下文的变量对象中查找，如果没有找到，就会从词法层面的父级执行上下文的变量对象中查找，直到全局上下文的变量对象。这样由多个执行上下文的变量对象构成的链表就是作用域链。

## 闭包

有权限访问其他其他函数作用域中变量的函数就叫做闭包。

### 闭包的作用

- 延长变量的生命周期
- 实现 private 属性

## this 指向

- 方法中调用：指向调用者
- 构造函数中调用：指向新生成的对象
- 箭头函数中调用：与最近一层非箭头函数所在环境的 this 保持一致
- call apply bind 调用：指向指定的 this

箭头函数中的 this 不能通过 call apply bind 修改。

bind this 返回的函数不能再通过 call apply bind 修改 this 指向。

## 变量提升

进入执行上下文时，首先会处理函数声明，其次会处理变量声明，函数声明比变量声明优先度高。

## var、let、const 的区别

| | var | let | const |
| :--: | :--: | :--: | :--: |
| 块级作用域 | ❌ | ⭕️ | ⭕️ |
| 重复声明 | ⭕️ | ❌ | ❌ |
| 暂时性死区 | ❌ | ⭕️ | ⭕️ |
| 必须设置初始值 | ❌ | ❌ | ⭕️ |
| 重新赋值 | ⭕️ | ⭕️ | ❌ |

## Map 和 Object 的区别

| | Map | Object |
| :--: | :--: | :--: |
| 键的类型 | Map 的键可以是任意值，包括函数、对象或任意基本类型 | Object 的键必须是 String 或是 Symbol |
| 键的顺序 | Map 中的 key 是有序的。遵从插入的顺序 | Object 的键是无序的 |
| size | Map 的键值对个数可以轻易地通过 size 属性获取 | Object 的键值对个数只能手动计算 |

## Map 和 WeakMap 的区别

WeakMap 的键只能是对象，并且作为对象的键是弱引用，即垃圾回收机制不会把键的引用计算在内。

如果这个对象的其他引用都被清除，就能被垃圾回收，WeakMap 中的键值对自动会删除。

## event loop

函数执行时，会生成这个函数对应的执行上下文，执行上下文包含这个函数的作用域、this、定义的变量。

然后这个执行上下文会被放入执行栈中，如果碰到异步任务，会将异步任务挂起继续执行执行栈中其他的任务，等到异步任务完成，结果会被放入任务队列中，等到执行栈中的任务全部完成，就会把任务队列排在第一的任务放入执行栈中继续执行，这就是 event loop。

任务队列中的任务又分为宏任务（global、setTimeout、setInterval）、微任务（Promise.then、MutationObserver）。

在一次 event loop 中总是先执行一个宏任务，然后执行全部微任务，视图重新渲染。

## ES6 模块与 CommonJS 模块有什么异同？

ES Module 和 CommonJS 模块的区别：

- CommonJS 是对模块的浅拷⻉，ES Module 是对模块的引⽤，即 ES Module 不能改变其值，也就是指针指向不能变，类似 const；
- CommonJS 是动态语法可以写在判断里，ES Module 静态语法只能写在顶层
- CommonJS 是加载时运行，ES Module 是编译时确定的，可以静态分析

ES6 Module 和 CommonJS 模块的共同点：

- CommonJS 和 ES6 Module 都可以对引⼊的对象进⾏赋值，即对对象内部属性的值进⾏改变。

node 中默认使用的是 CommonJS 规范，但是 13 版本后，可以在 package.json 文件中添加 `"type": "module"` 使用 ES Module。

tree-shaking 是 webpack 的一项功能，tree-shaking 只能在 ES Module 中使用，如果先通过 babel 转为 CommonJS 就用不了。

> 通过静态分析 es6 的语法，可以删除没有被使用的模块。要使用这项技术，只能使用 webpack 的模块处理，加上 babel 的 es6 转换能力（需要关闭模块转换）。
>

## promise

promise 是一个等待被异步执行的对象，它有三种状态（pending, resolved, rejected），默认状态是 pending，当它执行完成后，其状态会变成 resolved 或者 rejected，状态一旦改变就不能再变。支持使用 then 方法链式调用，每次执行 then 方法后返回的是一个新的 promise 对象。

promise 主要解决了回调地域的问题

### promise 常见面试题

#### promise 同步执行

```js
// 实现 mergePromise
// 最后输出: 1, 2, 3 'done' [1, 2, 3]
const timeout = (ms) =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });

const ajax1 = () =>
  timeout(2000).then(() => {
    console.log('1');
    return 1;
  });

const ajax2 = () =>
  timeout(1000).then(() => {
    console.log('2');
    return 2;
  });

const ajax3 = () =>
  timeout(2000).then(() => {
    console.log('3');
    return 3;
  });

const mergePromise = function(args) {
  const list = args.slice();
  const result = [];
  let target;

  return new Promise(async (resolve) => {
    while((target = list.shift(), target)){
      const res = await target();
      result.push(res);
    }

    resolve(result);
  });
}

//test
mergePromise([ajax1, ajax2, ajax3]).then((data) => {
  console.log('done');
  console.log(data);
});
```

#### promise 限制并行请求个数

```js
const timeout = (delay = 1000) => new Promise(resolve => {
  setTimeout(resolve, delay);
})

const addTask = (time, order) => {
  return () => timeout(time).then(() => console.log(order))
}

const multiPromise = function(args, nums = 2) {
  return new Promise(resolve => {
    const list = args.slice();
    const result = [];
    let done = 0;

    const run = async function(index, request){
      const res = await request();

      result[index] = res;
      done++;

      done === args.length - 1 && resolve(result);
      list.length && run(args.length - list.length, list.shift());
    }

    for(let i = 0; i < nums; i++) {
      list.length && run(i, list.shift());
    }
  })
}

const list = [
  addTask(1000,1),
  addTask(500,2),
  addTask(300,3),
  addTask(400,4),
];
```

#### promise 异步相加

```js
const addRemote = async (a, b) => new Promise(resolve => {
  setTimeout(() => resolve(a + b), 1000)
})

async function add(...args) {
  if (args.length <= 1) return Promise.resolve(...args);
  if (args.length === 2) return addRemote(...args);

  const promiseList = [];

  for(let i = 0; i < args.length; i+=2) {
    promiseList.push(addRemote(args[i], args[i + 1] || 0));
  }
  const res = await Promise.all(promiseList)

  return add(...res);
}

// test
add(1, 2).then(res => {
  console.log(res);
})

add(1, 2, 3, 4, 5, 6, 7).then(res => {
  console.log(res);
})
```

## generator

`generator` 函数调用时不会立即执行，而是会生成一个迭代器对象。

每当调用迭代器对象的 `next` 方法时，函数运行到下一个 `yield` 表达式。

返回表达式结果并暂停自身，返回值是一个 done、value 的对象。当抵达函数的末尾时，返回结果中 done 的值为 true，value 的值为 undefined。

### 简单使用

```jsx
function* example() {
  yield 1;
  yield 2;
  yield 3;
}

var iter = example();
iter.next(); //{value:1，done:false}
iter.next(); //{value:2，done:false}
iter.next(); //{value:3，done:false}
iter.next(); //{value:undefined，done:true}
```

### es 5 中的实现

**编译器会生成一个内部类来保存上下文信息，然后将 yield return 表达式转换成 switch case，通过状态机模式实现 yield 关键字的特性。**

```js

function gen$(context) {
  while (1) {
    switch (context.prev = context.next) {
      case 0:
        context.next = 2;
        return 'result1';

      case 2:
        context.next = 4;
        return 'result2';

      case 4:
        context.next = 6;
        return 'result3';

      case 6:
        context.done = true;
        return undefined
    }
  }
}

let foo = function() {
  let context = {
    prev: 0,
    next: 0,
    done: false,
  }
  return {
    next: function() {
      let value = gen$(context);
      return {
        value,
        done: context.done,
      }
    }
  }
}

// test 
let a = foo();
a.next() // { value: result1, done: false }
a.next() // { value: result2, done: false }
```

### setTimeout 和 setInterval

setTimeout 并不能保证在正确的间隔时间中出发回调，延迟的时间严格来说总是大于 x 毫秒的，这和 JS 的执行机制有关，看 JS 代码是否有大的耗时操作

setInterval 容易产生一个误区：并不是上一次 fn 执行完了之后再过一个间隔时间才开始执行下一次 fn，而是每隔一个间隔时间就将 fn 放入主线程队列，当 setInterval 的回调函数执行时间超过了延迟时间，就完全看不出有时间间隔了（可以认为小于间隔时间触发），而 setTimeout 总是可以保证时间间隔总是不小于设置的时间