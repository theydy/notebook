# react 面试题

## 事件机制

React 并不是将 click 事件绑定到了真实 DOM 上，而是在 document 处监听了所有的事件，当事件发生并且冒泡到 document 处的时候，React 将事件内容封装并交由真正的处理函数运行。这样的方式不仅仅减少了内存的消耗，还能在组件挂载销毁时统一订阅和移除事件。

**在 React 17 中，React 将不再向 document 附加事件处理器。而会将事件处理器附加到渲染 React 树的根 DOM 容器中**

原生事件冒泡到 document 上后，触发对应的 React 事件处理器，React 会找出调用的组件，然后 React 事件会在组件中向上 “冒泡”，这是 React 自己实现的合成事件（SyntheticEvent）。当需要使用浏览器的底层事件时，只需要使用 nativeEvent 属性来获取即可

React 使用合成事件主要有三个目的：

- 进行浏览器兼容，实现更好的跨平台
- 避免频繁垃圾回收，React 事件对象不会被释放掉，而是存放进一个数组中，即事件池，当事件触发，就从这个数组中弹出，避免频繁地去创建和销毁。
- 方便事件统一管理和事务机制

## 对 React Fiber 的理解，它解决了什么问题

React 15 在渲染时，会递归比对 VirtualDOM 树，找出需要变动的节点，然后同步更新它们。这个过程期间 React 会占据浏览器资源，这会导致用户触发的事件得不到响应，并且会导致掉帧，用户感觉到卡顿。

Fiber 加入就是为了让 React 的 diff 过程变为异步可中断的。

## 哪些方法会触发 React 重新渲染，重新渲染 render 会做些什么

- 组件内状态改变：
- 父组件重新渲染：只要父组件重新渲染了，即使传入子组件的 props 未发生变化，那么子组件也会重新渲染，进而触发 render

重新渲染会对新旧 VNode 进行对比，即 diff，遍历差异对象，根据差异的类型，根据对应对规则更新 VNode。VirtualDOM 并不是说它比直接操作 DOM 快，而是说不管数据怎么变，都会尽量以最小的代价去更新 DOM。

## 对 React 中 Fragment 的理解，它的使用场景是什么

类似 Vue 中的 template，在循环中或返回多个元素又不想添加多余的 DOM 节点时，我们可以使用 Fragment 标签来包裹所有的元素，Fragment 标签不会渲染出任何元素。

与空标签 `<></>` 的区别在于 Fragment 可以添加 key 属性，空标签不行。

## 对 React Portals 的理解，如何使用，有哪些使用场景

Portals 是 React 提供的官方解决方案，使得组件可以脱离父组件层级挂载在 DOM 树的任何位置。通俗来讲，就是 render 一个组件，但这个组件的 DOM 结构并不在本组件内。


`ReactDOM.createPortal(child, container);`

- 第一个参数 child 是可渲染的 React 子项，比如元素，字符串或者片段等
- 第二个参数 container 是一个 DOM 元素。

一般用于弹窗之类的。

## 在 React 中如何避免不必要的 render

- shouldComponentUpdate 和 PureComponent
- React.memo

## 对 React context 的理解

Context 是一种在组件之间共享数据的方式，而不必显式地通过组件树的逐层传递 props

## React 组件间通信常见的几种情况

- 父组件向子组件通信：父组件通过 props 向子组件传递需要的信息
- 子组件向父组件通信：props + 回调的方式
- 跨级组件通信：context
- 非嵌套关系的组件通信：全局状态管理库、event bus

## React Router 的实现原理是什么

客户端路由实现的思想：

- 基于 hash 的路由：通过监听 hashchange 事件，感知 hash 的变化
- - 改变 hash 可以直接通过 location.hash=xxx
- 基于 H5 history 路由：
- - 改变 url 可以通过 history.pushState 和 resplaceState 等，会将URL压入堆栈，同时能够应用 history.go() 等 API
- - 监听 url 的变化可以通过自定义事件触发实现

react-router 实现的思想：

- 基于 history 库来实现上述不同的客户端路由实现思想，并且能够保存历史记录等，磨平浏览器差异，上层无感知
- 通过维护的列表，在每次 URL 发生变化的时候，通过配置的路由路径，匹配到对应的 Component，并且 render

## Redux 在 hooks 中的使用

- useSelector
- useDispatch

```js
// npm install @reduxjs/toolkit react-redux
// app/store.js

import { configureStore, createSlice } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: state => {
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

export default configureStore({
  reducer: {
    counter: counterSlice.reducer,
  }
})

```

```js
import React from 'react'
import ReactDOM from 'react-dom'
import store, { increment } from './app/store'
import { Provider, useSelector, useDispatch } from 'react-redux'

const App = () => {
  const count = useSelector(state => state.counter.value)
  const dispatch = useDispatch()

  return <div onClick={() => dispatch(increment())}>Hello World</div>
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

## 对 React Hook 的理解

类组件太繁杂了，而且类组件内部的逻辑难以实现拆分和复用。

函数组件就是以函数的形态存在的 React 组件。早期并没有 React Hooks，函数组件内部无法定义和维护 state，因此它还有一个别名叫“无状态组件”。

类组件和函数组件之间，是面向对象和函数式编程这两套不同的设计思想之间的差异。而函数组件更加契合 React 框架的设计理念。

通过对比，从形态上可以对两种组件做区分，它们之间的区别如下：

- 类组件需要继承 class，函数组件不需要；
- 类组件可以访问生命周期方法，函数组件不能；
- 类组件中可以获取到实例化后的 this，而函数组件不可以；
- 类组件中可以定义并维护 state，而函数组件不可以；

Hooks 的加入使得函数组件补全了相对于类组件缺失的能力。

## React Hooks 优缺点

优点：

- 更容易复用代码、可读性更强，同一功能的代码逻辑可以聚合在一起
- 不用考虑 this 指向问题
- 组件树层级变浅
- 模板代码更少

缺点：

- 更高的学习成本、需要考虑依赖项，更高的心智负担

## React Hook 的使用限制有哪些

- 不要在循环、条件或嵌套函数中调用 Hook：因为 Hooks 的设计是基于链表实现。在调用时按顺序加入链表中，如果使用循环、条件或嵌套函数会导致取值错位，执行错误的 Hook。
- 只能在 React 的函数组件中调用 Hook；

## useEffect 与 useLayoutEffect 的区别

共同点

- useEffect 与 useLayoutEffect 两者都是用于处理副作用，这些副作用包括改变 DOM、设置订阅、操作定时器等。在函数组件内部操作副作用是不被允许的，所以需要使用这两个函数去处理。
- useEffect 与 useLayoutEffect 两者底层的函数签名是完全一致的，都是调用的 mountEffectImpl 方法，在使用上也没什么差异，基本可以直接替换。

不同点

- useEffect 是异步执行的，而 useLayoutEffect 是同步执行的
- 而 useLayoutEffect 的执行时机是浏览器把内容真正渲染到界面之前，不会产生闪烁，useEffect 的执行时机是浏览器完成渲染之后，会产生闪烁。useLayoutEffect 总是比 useEffect 先执行。

## 对虚拟 DOM 的理解，虚拟 DOM 主要做了什么，虚拟 DOM 本身是什么

从本质上来说，Virtual Dom 是一个 JavaScript 对象，通过对象的方式来表示 DOM 结构。将页面的状态抽象为 JS 对象的形式，配合不同的渲染工具，使跨平台渲染成为可能。并且在大部分情况下提供一个比较好的渲染性能。

为什么要用 Virtual DOM：

- 保证性能下限，在不进行手动优化的情况下，提供过得去的性能
- 跨平台
- 函数式编程

## React diff 算法原理

React 的 diff 过程即：在 render 阶段，通过比较 current Fiber 和新一轮的 JSX 生成 workInProgress Fiber 的过程。

React 的 diff 只会比较同层级的节点，不会比较跨层级的节点。

同层级比较是会根据 newChild 的类型进入单节点 diff 和多节点 diff。

### 单节点 diff

当 newChild 为单个节点时，也就是新一轮 JSX 当前层只有一个节点

通过 sibling 指针遍历 current Fiber

- key 和 type 相同，复用节点，复用节点会把更新的属性保存在新节点上，等待 commit 时统一更新，多余的 sibling 标记删除
- key 相同 type 不相同，则把整个 current fiber 和 sibling fiber 标记删除，生成新的 fiber
- key 不相同，把 fiber 标记删除，通过 sibling 指针往后移，继续与 newChild 比较

### 多节点 diff

当 newChildren 为多个节点时，也就是新一轮 JSX 当前层有多个节点

多节点 diff 时由于 fiber 是单向链表结构，没发想 Vue diff 那样使用双指针，所以需要遍历两次，第一次遍历处理节点的更新，第二次遍历处理不更新的节点

- 第一次遍历
  - key 和 type 相同，复用节点，通过 sibling 指针往后移，继续与 newChildren 比较
  - key 相同 type 不相同，基于新 JSX 生成新的 Fiber 节点，oldFiber 标记删除，继续遍历
  - key 不相同，中断第一次遍历
- 第二次遍历
- 进入第二次遍历时，有三种情况，
  - newChildren 遍历结束，此时把剩下的 oldFiber 标记删除
  - oldFiber 遍历结束，此时新建剩下的 newChildren
  - 两个都没遍历结束，剩下的 oldFiber 组成一个 key-map，再遍历 newChildren，通过 key 属性在 map 中查找，然后比较 type，能复用复用，不能复用新建节点

这里有一个重点，在于通过 key-map 匹配时，如何最少次数通过添加删除来描述节点的移动

有一个变量 lastPlacedIndex 记录最新匹配到的可复用节点在 oldFiber 中的下标

当匹配到一个新可复用节点是，这个节点在 oldFiber 中的 index 是否大于 lastPlacedIndex

如果大于，说明这个节点顺序是合适的，不需要移动，更新 lastPlacedIndex 的值

如果小于，说明这个节点需要移动到最后，更新 lastPlacedIndex 的值

## 虚拟 DOM 的引入与直接操作原生 DOM 相比，哪一个效率更高，为什么

虚拟 DOM 相对原生的 DOM 不一定是效率更高，如果只修改一个按钮的文案，那么虚拟 DOM 的操作无论如何都不可能比真实的 DOM 操作更快。在首次渲染大量 DOM 时，由于多了一层虚拟 DOM 的计算，虚拟 DOM 也会比 innerHTML 插入慢。它能保证性能下限，但真实 DOM 操作的时候进行针对性的优化时，还是更快的。所以要根据具体的场景进行探讨。

## 对 React 和 Vue 的理解，它们的异同

相似之处：

- 都将注意力集中保持在核心库，而将其他功能如路由和全局状态管理交给相关的库
- 都有自己的构建工具，能让你得到一个根据最佳实践设置的项目模板。
- 都使用了 Virtual DOM
- 都有 props 的概念，允许组件间的数据传递
- 都鼓励组件化应用，将应用分拆成一个个功能明确的模块，提高复用性

不同之处：

- React 提倡数据的不可变性，Vue 则是可变
- 数据流，Vue 默认支持数据双向绑定，而 React 一直提倡单向数据流
- Vue 使用 template 编写模版，React 使用 JSX
- 监听数据变化的实现原理不同，Vue 通过 getter/setter 函数的劫持实现，React 通过比较引用的方式实现

## React 时间切片思想，为什么不用 requestIdleCallback

React 之所以需要时间切片是因为 react 每次出发更新都需要把 Virtual DOM 从头到尾遍历一边，找到需要更新的节点，而这个过程如果耗时太长，会导致浏览器出现卡顿、用户无法操作。所以引入新的 fiber 结构，fiber 结构实现了 render 过程异步可打断并恢复。配合 requestIdleCallback 的 ployfill 实现在浏览器空闲时间中去对比 fiber tree。

之所以不直接用 requestIdleCallback，是因为 requestIdleCallback 兼容性差，很多现代浏览器都不支持。于是 react 团队就写了一个 ployfill，采用 requestAnimationFrame 来代替 requestIdleCallback




