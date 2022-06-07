# react

- [react 官方文档](https://zh-hans.reactjs.org/docs/getting-started.html)
- [react 生命周期](https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/)
- [Dan 博客](https://overreacted.io/)
- [react codesandbox](https://codesandbox.io/s/new?file=/src/App.js)
- [Vue 转 React不完全指北](https://juejin.cn/post/6953482028188860424)
- [「react进阶」一文吃透react-hooks原理](https://juejin.cn/post/6944863057000529933#heading-9)

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

## hooks 初始化

在初始化时，每个 hooks 执行都会调用 `mountWorkInProgressHook`，在这个函数会生成一个 `hook` 对象，然后将前后的 `hook` 对象通过 `next` 属性以链表的形式串联起来。并且在 `workInProgress.memoizedState` 上保存组件中第一个 `hook` 节点。

### mountState

mountState 是初始化时 useState 调用的处理函数。

- `const hook = mountWorkInProgressHook();`：mountState 中首先会生成并获取 hook 对象。
- `hook.memoizedState = hook.baseState = initialState;`：接着将初始值存在 memoizedState 和 baseState 属性上。
- `const queue = (hook.queue = {...})`：创建 queue 对象，里面会用来存放更新的信息。其中 `queue.pending` 指向最后一个 `Update` 对象，`Update` 对象们以环状单向链表的形式保存。
- `const dispatch = (queue.dispatch = (dispatchAction.bind(...)))`：更新函数

```js
function mountState(
  initialState
){
  const hook = mountWorkInProgressHook();
  //...
  hook.memoizedState = hook.baseState = initialState;
  const queue = (hook.queue = {
    pending: null, // 待更新 Update 对象
    dispatch: null,
    lastRenderedReducer: basicStateReducer, // 用于得到最新的 state
    lastRenderedState: initialState, // 最后一次得到的 state，lastRenderedReducer() === lastRenderedState 的话，说明不需要更新。
  });

  const dispatch = (queue.dispatch = (dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue,
  )))
  return [hook.memoizedState, dispatch];
}
```

### mountEffect

```js
function mountEffect(
  create,
  deps,
) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookEffectTag, 
    create, // useEffect 第一次参数，就是副作用函数
    undefined,
    nextDeps, // useEffect 第二次参数，deps
  );
}

function pushEffect(tag, create, destroy, deps) {
  const effect = {
    tag,
    create,
    destroy,
    deps,
    next: null,
  };
  // ... effect 以环状单向链表的形式保存在 fiber.updateQueue 上，fiber.updateQueue 指向最后一个 effect
  currentlyRenderingFiber.updateQueue = // ...
  return effect;
}

```

### mountMemo

初始化 useMemo，就是创建一个 hook，然后执行 useMemo 的第一个参数,得到需要缓存的值，然后将值和 deps 记录下来，赋值给当前 hook 的 memoizedState

```js
function mountMemo(nextCreate,deps){
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

### mountRef

```js
function mountRef(initialValue) {
  const hook = mountWorkInProgressHook();
  const ref = {current: initialValue};
  hook.memoizedState = ref;
  return ref;
}
```

## hooks 更新

在 hook 更新阶段，上一次 workInProgress 树已经赋值给了 current 树。存放 hooks 信息的 memoizedState，此时已经存在 current 树上。

函数组件每次更新，再次执行 hooks 函数的时候，都会执行 updateWorkInProgressHook，这个函数会从 current 的 hooks 中找到与当前 workInProgressHook 对应的 currentHooks，然后复制一份 currentHooks 给 workInProgressHook。

接下来 hooks 函数执行的时候，把最新的状态更新到 workInProgressHook，保证 hooks 状态不丢失。

### updateState

### updateEffect

判断两次 deps 相等，如果相等说明此次更新不需要执行，则直接调用 pushEffect，这里注意虽然 pushEffect 但没有标记需要更新，如果不相等，那么更新 effect，并且赋值给 hook.memoizedState，这里标记 `HookHasEffect | hookEffectTag`，然后在 commit 阶段，react 会通过标签来判断，是否执行当前的 effect 函数。

```js
function updateEffect(create, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;
  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        pushEffect(hookEffectTag, create, destroy, nextDeps);
        return;
      }
    }
  }
  currentlyRenderingFiber.effectTag |= fiberEffectTag
  hook.memoizedState = pushEffect(
    HookHasEffect | hookEffectTag,
    create,
    destroy,
    nextDeps,
  );
}
```

### updateMemo

浅比较 deps 是否相同，相同不更新，不相同更新。

```js
function updateMemo(
  nextCreate,
  deps,
) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps; // 新的 deps 值
  const prevState = hook.memoizedState; 
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps = prevState[1]; // 之前保存的 deps 值
      if (areHookInputsEqual(nextDeps, prevDeps)) { //判断两次 deps 值
        return prevState[0];
      }
    }
  }
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```


### updateRef

```js
function updateRef(initialValue){
  const hook = updateWorkInProgressHook()
  return hook.memoizedState
}
```
