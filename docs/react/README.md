---
sidebar: auto
---

# react

- [react 官方文档](https://zh-hans.reactjs.org/docs/getting-started.html)
- [react 生命周期](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
- [Dan 博客](https://overreacted.io/)
- [react codesandbox](https://codesandbox.io/s/new?file=/src/App.js)
- [Vue 转 React不完全指北](https://juejin.cn/post/6953482028188860424)

## vue react 对比

### 参考链接

- [Vue 官方对比 React](https://cn.vuejs.org/v2/guide/comparison.html)
- [lq782655835 Vue和React区别](https://lq782655835.github.io/blogs/vue/diff-vue-vs-react.html)

### 相同处

- 使用 Virtual Dom
- 都使用组件化思想（vue template/react jsx -> render函数 -> 生成VNode -> 当有变化时，新老VNode diff -> diff算法对比，并真正去更新真实DOM）
- 都是响应式，推崇单向数据流
- 都有成熟的社区，都支持服务端渲染

### 不同处

- react 组件的更新粒度比 vue 大，vue 能精确知道需要更新的组件，react 则是会以状态发生变化的组件为根，重新渲染整个组件子树。如要避免不必要的子组件的重渲染，需要在所有可能的地方使用 PureComponent，或是手动实现 shouldComponentUpdate 方法。
- react 中一切都是 javascript，不仅仅是 HTML 可以用 JSX 来表达，现在的潮流也越来越多地将 CSS 也纳入到 JavaScript 中来处理；vue 则更多使用 template。
- CSS 作用域在 react 中是通过 CSS-in-JS 的方案实现的；vue 中可以使用 scope 实现。
- react 社区更繁荣，有更丰富的生态系统。

## useEffect

[useEffect 完整指南](https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/)

**useEffect 在每次渲染后运行**

每次更新状态的时候，React 会重新渲染组件。每一次渲染都能拿到独立的 `props`、`state` 和`事件处理函数`。

在任意一次渲染中，`props` 和 `state` 是始终保持不变的。

**effect 是如何读取到最新的状态值的呢？**

并不是状态的值在“不变”的 effect 中发生了改变，而是 effect 函数本身在每一次渲染中都不相同。每一个 effect 版本“看到”的状态值都来自于它属于的那次渲染。

### 举个🌰

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

根据上面的🌰，第一次渲染过程如下：

- React：给我状态为 0 时候的 UI
- Counter 组件：
  - 给你需要渲染的内容：`<p>You clicked 0 times</p>`
  - 记得在渲染完了之后调用这个 effect：`() => { document.title = 'You clicked 0 times' }`
- React：没问题，开始更新 UI
- 浏览器绘制新 UI
- React：运行 effect：`() => { document.title = 'You clicked 0 times' }`

状态改变后的过程如下：

- Counter 组件：状态设置为 1
- React：给我状态为 1 时候的 UI
- Counter 组件：
  - 给你需要渲染的内容：`<p>You clicked 1 times</p>`
  - 记得在渲染完了之后调用这个 effect：`() => { document.title = 'You clicked 1 times' }`
- React：没问题，开始更新 UI
- 浏览器绘制新 UI
- React：运行 effect：`() => { document.title = 'You clicked 1 times' }`

如果想在 effect 的回调函数里读取最新的值而不是某次渲染捕获的值。最简单的实现方法是使用 `refs`。

```jsx
function Example() {
  const [count, setCount] = useState(0);
  const latestCount = useRef(count);

  useEffect(() => {
    // Set the mutable latest value
    latestCount.current = count;
    setTimeout(() => {
      // Read the mutable latest value
      console.log(`You clicked ${latestCount.current} times`);
    }, 3000);
   });
  // ...
}
```

### effect 的清理

```jsx
useEffect(() => {
  ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
  };
});
```

注意，清除本次渲染中的 effect 是在下次渲染 UI 后，effect 运行前。

即假如 id 由 10 → 20：

- **React 渲染 `{id: 20}` 的 UI。**
- 浏览器绘制。我们在屏幕上看到 `{id: 20}` 的 UI。
- **React 清除 `{id: 10}` 的 effect。**
- React 运行 `{id: 20}` 的 effect。

但是，⚠️：effect 的清除并不会读取 “最新” 的 props，因为它只能读取到定义它的那次渲染中的 props 值，即使它的调用时机在新的渲染中。

## useRef

```jsx
const refContainer = useRef(initialValue);
```

useRef 返回一个可变的 ref 对象，其 `.current` 属性被初始化为传递的参数 `(initialValue)`。返回的对象将存留在整个组件的生命周期中。

由于 ref 在 React 组件的整个生命周期中只存在一个引用，因此通过 `.current` 永远可以访问到引用中最新的值，可以解决闭包陈旧值的问题。

请记住，当 ref 对象内容发生变化时，useRef 并不会通知你。变更 `.current` 属性不会引发组件重新渲染。如果想要在 React 绑定或解绑 DOM 节点的 ref 时运行某些代码，则需要使用回调 ref 来实现。

## useReducer

```jsx
const [state, dispatch] = useReducer(reducer, initialArg, init);
```

它接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法。

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'xx':
      return {};
    case 'ss':
      return {};
    default:
      throw new Error();
  }
}
```

```jsx
const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
    </>
  );
}
```

## useCallback

```jsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
},[a, b]);
```

返回一个 memoized 回调函数。

把内联回调函数及依赖项数组作为参数传入 useCallback，它将返回该回调函数的 memoized 版本，该回调函数仅在某个依赖项改变时才会更新。当你把回调函数传递给经过优化的并使用引用相等性去避免非必要渲染（例如 shouldComponentUpdate）的子组件时，它将非常有用。

`useCallback(fn, deps)` 相当于 `useMemo(() => fn, deps)`。

## useMemo

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

返回一个 memoized 值。

把“创建”函数和依赖项数组作为参数传入 useMemo，它仅会在某个依赖项改变时才重新计算 memoized 值。这种优化有助于避免在每次渲染时都进行高开销的计算。

记住，传入 useMemo 的函数会在渲染期间执行。请不要在这个函数内部执行与渲染无关的操作。

如果没有提供依赖项数组，useMemo 在每次渲染时都会计算新的值。

## React.memo

React.memo，这个 api 基本等效于 class 组件中的 `shouldComponentUpdate`，这个组件可以优化子组件的重新渲染策略

```jsx
// memo优化策略
// 可以拿到上次渲染的 props 和这次渲染的 props，
// 判断当某个状态改变时才重新渲染
// return true 不重新渲染，false 重新渲染
function areEqual(prevProps: Props, nextProps: Props) {
  return prevProps.xx === nextProps.xx
}

const childComponent = React.memo((props: Props) => {
  return <div></div>
}, areEqual)

// React.memo 如果不传对比函数，默认会进行 props 浅比较
```

## createContext、useContext

提供一个 Provider 和 Consumer，可以用来实现状态管理。

```jsx
// store/index.js
import React, { useState, useContext } from 'react';

const Store = React.createContext();

export const StoreProvider = ({ children }) => {

  const [initValue, dispatch] = useReducer({
    a: 1,
    b: {
      c: 2,
      d: 3,
    }
  });

  return <Store.Provider value={
    { state: {...initValue} , dispatch}
  }>{ children }</Store.Provider>
}

export const useStore = () => {
  const context = useContext(Store);

  return context;
}
```

```jsx
// index.jsx
ReactDOM.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
```
