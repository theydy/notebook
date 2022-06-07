# react 源码

## Fiber 架构

Fiber 架构

- Scheduler 调度器
- Reconciler 协调器
- Renderer 渲染器

Fiber 也叫“纤程”，是一种异步可中断的实现。他实现了两个目标。

- 更新可以中断并继续
- 更新可以拥有不同的优先级，高优先级更新可以打断低优先级的更新

### 工作原理

作为静态的数据结构来说每个 Fiber 节点对应一个 React element，保存了该组件的类型（函数组件/类组件/原生组件...）、对应的DOM节点等信息。

作为动态的工作单元来说每个 Fiber 节点保存了本次更新中该组件改变的状态、要执行的工作（需要被删除/被插入页面中/被更新...）。

Fiber 使用一种被叫做**双缓存**的机制。

Fiber 节点中有个 alternate 属性指向另一次更新时对应的 Fiber，分别是 current Fiber 树和 workInProgress Fiber 树。
当 workInProgress Fiber 树完成了渲染，FiberRootNode 就指向了 workInProgress Fiber 树的根节点，
此时 workInProgress Fiber 树就变成了 current Fiber 树。
下次触发更新时又创建一棵新的 workInProgress Fiber 树。workInProgress Fiber 树的节点是根据 current Fiber 树的节点创建的。
根据 current Fiber 与本次更新返回的 JSX 结构做对比生成 workInProgress Fiber 树的过程就是 diff 算法。

## JSX

JSX 其实就是 React.createElement 的语法糖。

```js
<div title='1'>111</div>

// transform to React.createElement
React.createElement('div', {
  title: '1',
}, '111')

function Foo(){
  <div title='1'>111</div>
}

// transform to React.createElement
React.createElement(Foo)
```

React.createElement 最后返回的是 React.Element 对象。

React.Element 对象的结构为

```js
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };
```

## render 阶段

render 阶段的入口是 `performSyncWorkOnRoot` 或 `performConcurrentWorkOnRoot`

render 使用遍历来实现可中断的递归。首次渲染和非首次渲染走的过程不同，所以分为两种情况来说，每种情况又可详细分为“递”阶段和“归”阶段。

### 首次渲染 mount 阶段

首次渲染 mount 时没有 current Fiber 树。

**“递”阶段**

此时会从 rootFiber 开始通过深度优先遍历，遍历每个 Fiber 节点调用 beginWork 方法。

该方法会根据传入的 Fiber 节点创建子 Fiber 节点（reconcileChildren 函数），并将这两个 Fiber 节点连接起来。

当遍历到叶子节点（即没有子组件的组件）时就会进入“归”阶段。

**“归”阶段**

在“归”阶段会调用 completeWork 处理 Fiber 节点。

当某个 Fiber 节点执行完 completeWork，如果其存在兄弟 Fiber 节点（即 fiber.sibling !== null），会进入其兄弟 Fiber 的“递”阶段。

如果不存在兄弟 Fiber，会进入父级 Fiber 的“归”阶段。

“递”和“归”阶段会交错执行直到“归”到 rootFiber。至此，render 阶段的工作就结束了。

🌰

```js
function App() {
  return (
    <div>
      i am
      <span>xxx</span>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"));

// render 阶段会依次执行：
// 1. rootFiber beginWork
// 2. App Fiber beginWork
// 3. div Fiber beginWork
// 4. "i am" Fiber beginWork
// 5. "i am" Fiber completeWork
// 6. span Fiber beginWork
// 7. span Fiber completeWork
// 8. div Fiber completeWork
// 9. App Fiber completeWork
// 10. rootFiber completeWork
// 之所以没有 "xxx" Fiber 的 beginWork/completeWork，
// 是因为作为一种性能优化手段，针对只有单一文本子节点的 Fiber，React 会特殊处理。
```

### beginWork 具体做什么

beginWork 进入后首先判断是否有 current，如果有说明是 update 节点，如果没有说明是 mount 阶段，这里首次渲染和非首次渲染执行了一些不同的操作。

- update 时：如果 current 存在，在满足一定条件时可以复用 current 节点，这样就能克隆 current.child 作为 workInProgress.child，而不需要新建 workInProgress.child。
- mount 时：除 fiberRootNode 以外，current === null。会根据 fiber.tag 不同，创建不同类型的子 Fiber 节点

无论 update 或 mount，如果需要创子节点，都会根据 workInProgress.tag 的类型走不同的 component 函数创建子 Fiber 节点，如 FunctionComponent 类型走的就是 updateFunctionComponent，这个函数最终调用 reconcileChildren 创建 workInProgress.child 子节点。

updateFunctionComponent 这个函数中还调用了 renderWithHooks，在 renderWithHooks 里有这么一句 `let children = Component(props, secondArg);`，这里的 Component 对应的 workInProgress.type，也就是组件的函数。返回的就是新的 JSX 生成的 React.Element，然后这个 React.Element 会传给 reconcileChildren 函数，reconcileChildren 结合 React.Element 和 current Fiber 节点创建新的 workInProgress.child 子节点，这里面也就进行了 diff 过程。

可以说 beginWork 函数主要功能就是创建当前 Fiber 节点的第一个子 Fiber 节点。

### completeWork 具体做什么

completeWork 进入后会根据 workInProgress.tag 的类型走不同的流程。这里有些类型的 Fiber 节点会创建对应的 DOM 节点了，并保存在 workInProgress.stateNode 上。

当整个应用所有节点执行 completeWork 后，会进入上层的 performSyncWorkOnRoot 函数，这里会拿到整个应用根节点的 alternate， workInProgress 的根节点，执行 commitRoot 函数，执行 DOM 向页面的插入逻辑。

### 非首次渲染 update 阶段

**“递”阶段**

进入 beginWork 阶段，此时因为有 current 节点，所以会根据情况改变全局的 didReceiveUpdate 的值，这个值代表了本次更新中当前 Fiber 节点是否有变化。

- 新旧 props 是否相等
- context 是否有变化
- type 是否有变化
- 本次更新在当前 Fiber 上是否有要进行的任务：current.flags

对于无变化的节点，最后会调用 cloneChildFibers，cloneChildFibers 中又调用了 createWorkInProgress 函数，该函数可以复用节点。

对于不能复用的节点，则进入 reconcileChildren，这个逻辑中会将 current 节点和新的 React.Element 做对比，然后生成新的 workInProgress。

**“归”阶段**

进入 completeWork 处理 Fiber 节点，根据 workInProgress.tag 的类型走不同的流程，最后会进 prepareUpdate，prepareUpdate 又调用了 diffProperties。

diffProperties 的作用是比较新旧 props 的变化。

最后返回的是一个数组，数组的 i 项是需要改变的 props key，i + 1 项是需要改变的 props value。

这个数组会保存在 workInProgress.updateQueue 上。

之后 flags 会加上 Update 的标记 `workInProgress.flags |= Update`，表示需要更新 props 属性。

completeWork 完成后，在他的上层函数 completeUnitOfWork 中，将有 flags 的 Fiber 节点组成一条链表。这样 commit 阶段只需要遍历这个链表即可。

进入 commit 阶段后，workInProgress.flags 就是节点需要执行 DOM 操作的依据。

## commit 阶段

commitRoot 是 commit 阶段的起点。

commit 阶段并不需要重新遍历整个 Fiber 树。workInProgress.flags 有值的 Fiber 节点会在 completeWork 完成时组成一条链表，commit 阶段只需要遍历这个链表即可。

**整个 commit 阶段可以分为 before mutation、mutation、layout。**

commitRoot 实际执行的函数是 commitRootImpl 函数。

before mutation、mutation、layout 三个阶段分别对应了 commitRootImpl 中的 commitBeforeMutationEffects、commitMutationEffects、commitLayoutEffects 处理函数。

新版 React 在进入 before mutation 前会异步调度 useEffect

```js
// 调度 useEffect
if (
  (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
  (finishedWork.flags & PassiveMask) !== NoFlags
) {
  if (!rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = true;
    pendingPassiveEffectsRemainingLanes = remainingLanes;ns = transitions;

    scheduleCallback(NormalSchedulerPriority, () => {
      // 触发 useEffect
      flushPassiveEffects();
      return null;
    });
  }
}
```

### before mutation

- 处理 DOM 节点渲染/删除后的 autoFocus、blur 逻辑。
- 调用 getSnapshotBeforeUpdate 生命周期钩子。

### mutation

commitMutationEffects 函数中会根据 finishedWork.tag 执行不同的逻辑

~~以 FunctionComponent 为例，大致流程就是先执行所有的 useEffect 的销毁函数，接着执行 commitHookEffectListMount。（很迷，没懂）~~

```js
  commitHookEffectListUnmount(
    HookInsertion | HookHasEffect,
    finishedWork,
    finishedWork.return,
  );
  commitHookEffectListMount(
    HookInsertion | HookHasEffect,
    finishedWork,
  );
```

对于 HostComponent 也就是 DOM 节点，执行 commitUpdate 函数去具体的更新 DOM 节点的属性。

### layout

commitMutationEffects 之后 commitLayoutEffects 之前，会执行 `root.current = finishedWork;` 语句，也就是将 workInProgress Fiber 树变成了 current Fiber 树的操作

commitLayoutEffects 会跳到 commitLayoutEffectOnFiber，commitLayoutEffectOnFiber 中会根据 finishedWork.tag 执行不同的逻辑

以 FunctionComponent 为例，执行了 commitHookEffectListMount。

对于 ClassComponent 为例，执行了 componentDidMount 或 componentDidUpdate 生命周期钩子函数，然后执行 commitUpdateQueue。

commitUpdateQueue 会在 ClassComponent 和 HostRoot 两种类型中被调用，这个函数会遍历 effect 然后执行 callback，callback 在 ClassComponent 就是 this.setState 的第二个参数。


**commit 阶段完成后，执行所有的 useEffect 的销毁函数和回调函数**

### useEffect 和 useLayoutEffect 在 commit 阶段的区别

| 阶段 | useEffect | useLayoutEffect|
| :--: | :--: | :--: |
| before mutation | 调度 flushPassiveEffects（新版是在 before mutation 之前 ） | 无 |
| mutation | 无 | 执行 destroy |
| layout | 注册 destroy、create | 执行 create |
| commit 之后 | 执行 flushPassiveEffects，内部执行注册的回调，即 destroy、create | 无 |

## diff 算法

reconcileChildren -> reconcileChildFibers（真正 diff 算法）

diff 算法的本质是结合 current Fiber 和 JSX（React.Element） 生成 workInProgress Fiber。

diff 为了降低算法复杂度，预设了三个限制

- 只对同级元素进行 Diff。如果一个 DOM 节点在前后两次更新中跨越了层级，那么 React 不会尝试复用他。
- 两个不同类型的元素会产生出不同的树。如果元素由 div 变为 p，React 会销毁 div 及其子孙节点，并新建 p 及其子孙节点。
- 同一层级的子节点，可以通过标记 key 的方式进行列表对比。考虑如下例子：

```js
// 更新前
<div>
  <p key="111">111</p>
  <h3 key="222">222</h3>
</div>

// 更新后
<div>
  <h3 key="222">222</h3>
  <p key="111">111</p>
</div>

// 如果没有 key，React 会认为 div 的第一个子节点由 p 变为 h3，第二个子节点由 h3 变为 p。这符合限制 2 的设定，会销毁并新建。
// 存在 key 则可以复用。
```

### diff 的实现

diff 的入口是 reconcileChildFibers。

首先会判断 newChild（JSX） 是不是一个 Fragment 类型，接着判断是不是 Object 所属的类型（REACT_ELEMENT_TYPE、REACT_PORTAL_TYPE、REACT_LAZY_TYPE）。

判断是不是一个 Array，是不是一个 Iterator 可迭代对象，这两种情况处理过程类似，可以当作一种处理。

判断是不是一个 string 或 number，这回作为一个文本节点处理。

以上都不命中，则执行删除逻辑。

从上可知，大致可以分成两种情况，单一节点的 diff 和 多个节点的 diff。

### 单一节点的 diff

对于 React.createElement 的返回值都是 REACT_ELEMENT_TYPE，走的 reconcileSingleElement 处理函数。

reconcileSingleElement 函数中会比较是否存在 current，如果存在并且 key 值相同再比较 type 一致就可以复用。否则需要删除，注意这里会遍历 current 的 sibling，考虑原本是 li * 3 的情况，更新后成为 li * 1，此时 current 还是 li * 3，但是走的是单一节点 diff，需要比较三个 li 是否有可以复用的，并且要把多余的删除。如果三个 li 都不能复用，最后会单独创建新节点。 

**主要流程代码如下**

```js
function reconcileSingleElement(
  returnFiber: Fiber, // 父 Fiber
  currentFirstChild: Fiber | null, // current Fiber
  element: ReactElement, // JSX
  lanes: Lanes, // 优先级
) {
  const key = element.key;
  let child = currentFirstChild;

  // 需要有 current Fiber 才有可能复用
  while (child !== null) {
    if (child.key === key) {
      // ...
      if (child.elementType === element.type) {
        // 先把多余的 sibling 标记删除
        deleteRemainingChildren(returnFiber, child.sibling);
        // 复用 Fiber 节点
        useFiber(child, element.props);
      } else {
        // 注意这里把整个 child[] 都标记删除了，并且跳出循环
        // 之所以这样是因为先比较了 key 相同，结果因为 type 不同不能复用，后续的 sibling 肯定也不能复用，不需比较
        deleteRemainingChildren(returnFiber, child);
        break;
      }
    } else {
      // 如果 key 不相同，需要把 child 标记删除。
      deleteChild(returnFiber, child);
    }
    // ...
    // 注意这里会遍历 child 的 sibling，
    // 考虑原本是 li * 3 的情况，更新后成为 li * 1，
    // 此时 child[] 还是 li * 3，但是走的是单一节点 diff，需要比较三个 li 是否有可以复用的，并且要把多余的标记删除
    child = child.sibling;
  }

  // ...
  // 上述复用逻辑没有命中，创建新 Fiber 节点
  createFiberFromElement(element, returnFiber.mode, lanes);
}
```

### 多个节点的 diff

多个节点 diff 进入 reconcileChildrenArray 函数。

多个节点 diff 分为三种情况：

- 节点更新：props 变化、节点类型更新（div -> li）
- 节点新增或减少
- 节点位置变化

同级多个节点的 diff，一定属于以上三种情况中的一种或多种。其中**节点更新**的频率更高，所以会优先判断当前节点是否属于`更新`。

由于此时的 current Fiber 是一个单链表结构，而不是数组结构，所以 diff 整体过程中会经历两轮遍历。

- 第一轮遍历：处理`更新`的节点
- 第二轮遍历：处理剩下的不属于`更新`的节点

第一轮遍历：

- let i = 0，遍历 newChildren，将 newChildren[i] 与 oldFiber 比较，判断 DOM 节点是否可复用。
- 如果可复用，i++，继续比较 newChildren[i] 与 oldFiber.sibling，可以复用则继续遍历。
- 如果不可复用，分两种情况：
- - key 不同导致不可复用，立即跳出整个遍历，第一轮遍历结束。（此时 newChildren 没有遍历完，oldFiber 也没有遍历完。）
- - key 相同 type 不同导致不可复用，会将 oldFiber 标记为 Deletion，并继续遍历
- 如果 newChildren 遍历完（即 i === newChildren.length - 1 ）或者 oldFiber 遍历完（即 oldFiber.sibling === null ），跳出遍历，第一轮遍历结束。（此时可能 newChildren 遍历完，或 oldFiber 遍历完，或他们同时遍历完。）

第二轮遍历：

- 对于第一轮遍历的结果，分别讨论：
- - newChildren 与 oldFiber 同时遍历完：最理想的情况，只需在第一轮遍历进行组件更新，此时 diff结束，该情况和 oldFiber 没遍历完的情况走相同逻辑。
- - newChildren 遍历完，oldFiber 没遍历完：剩下的 oldFiber 都是删除节点，标记删除 Deletion
- - newChildren 没遍历完，oldFiber 遍历完：剩下的 newChildren 节点都是新增节点，标记 Placement
- - newChildren 与 oldFiber 都没遍历完：剩下的 oldFiber 组成一个 key-map，再遍历 newChildren，通过 key 属性在 map 中查找，能复用复用，不能复用新建节点



**主要流程代码如下**

```js
function reconcileChildrenArray(
  returnFiber: Fiber, // 父 Fiber
  currentFirstChild: Fiber | null, // current Fiber
  newChildren: Array<*>, // JSX[]
  lanes: Lanes, // 优先级
) {
  // ...
  for(; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    // ...
    // updateSlot 中比较了 key 和 type
    // 如果 key 不同返回 null
    // 如果 key 相同 type 不同，返回基于新 JSX 生成的 Fiber 节点
    // 如果 key 和 type 都相同，返回复用的 oldFiber 节点
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes,
    );

    // key 不同导致不可复用，立即跳出整个遍历
    if (newFiber === null) {
      // ...
      break;
    }

    // ...
    // newFiber.alternate 不是 oldFiber，说明 key 相同 type 不同导致不可复用，会将 oldFiber 标记为 Deletion，并继续遍历
    if (oldFiber && newFiber.alternate === null) {
      deleteChild(returnFiber, oldFiber);
    }
    
    // ...
  }

  if (newIdx === newChildren.length) {
    // newChildren 遍历完，此时 oldFiber 可能遍历完也可能没遍历完
    // 无论是否有剩下的 oldFiber，都为删除节点，标记删除 Deletion
    deleteRemainingChildren(returnFiber, oldFiber);
    // ...
    return
  }

  if (oldFiber === null) {
    // 剩下的 newChildren 节点都是新增节点，标记 Placement
    for (; newIdx < newChildren.length; newIdx++) {
      // ...
      placeChild(newFiber, lastPlacedIndex, newIdx);
    }
    return
  }

  // ...
  // newChildren 与 oldFiber 都没遍历完，此时把剩下的 oldFiber 生成一个 key map
  mapRemainingChildren(returnFiber, oldFiber)

  for(; newIdx < newChildren.length; newIdx++) {
    // 再遍历一次 newChildren 再 key map 中查找能否复用
    // updateFromMap 函数中会找到 key 相同的 oldFiber，然后比较 type，能复用复用，不能复用或没有相同 key 则新建 Fiber 节点
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes,
    )

    //...
    // 如果复用了，删除 map 中对应的 oldFiber
    // 标记新增的操作
  }
}
```

## 状态更新机制

每次状态更新都会创建一个保存更新状态相关内容的对象，叫 `Update`。在 render 的 beginWork 中会根据 Update 计算新的 state。

当 `[num, setNum] = useState(1)` 的 setNum 被调用时，实际上是调用了 dispatchAction，函数内会创建一个 Update 对象，这是一个环转链表结构，这个 Update 对象会保存在对应 hook 对象的 queue.pending 上，而组件内调用的所有 hook 已链表结构存在组件 fiber 上。接着根据组件的 fiber 向上找到 root 注册调度，执行调度更新进入 render 阶段，深度遍历，回到 fiber 节点发，再次执行组件函数。不同上下文（即：mount、update）中 useState 的具体实现是不同的。

## 极简 hooks 的实现

```js
let isMount = true;
let workInProgressHook = null;

const fiber = {
  memoizedState: null,
  stateNode: App,
}

// useState 实现
function dispatchAction(queue, action) {
  // 创建update
  const update = {
    action,
    next: null,
  }

  // 环状单向链表操作
  if (queue.pending === null) {
    update.next = update;
  } else {
    // 3 -> 0 -> 1 -> 2 -> 3
    // 4 -> 0 -> 1 -> 2 -> 3 -> 4
    // queue.pending 是最后一个

    update.next = queue.pending.next;
    queue.pending.next = update;
  }

  queue.pending = update;

  // 模拟 React开始调度更新
  run();
}

function useState(initialState) {
  let hook;

  if (isMount) {
    // mount时为该useState生成hook
    hook = {
      queue: {
        pending: null,
      },
      memoizedState: initialState,
      next: null,
    }

    // 将hook插入fiber.memoizedState链表末尾
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }

    // 移动workInProgressHook指针
    workInProgressHook = hook;
  } else {
    // update时找到对应hook
    hook = workInProgressHook;
    // 移动workInProgressHook指针
    workInProgressHook = workInProgressHook.next;
  }

  // update执行前的初始state
  let baseState = hook.memoizedState;
  if (hook.queue.pending) {
    // 获取update环状单向链表中第一个update
    let firstUpdate = hook.queue.pending.next;

    do {
      // 执行update action
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next;

      // 最后一个update执行完后跳出循环
    } while(firstUpdate !== hook.queue.pending.next)

    // 清空queue.pending
    hook.queue.pending = null;
  }

  // 将update action执行完后的state作为memoizedState
  hook.memoizedState = baseState;

  return [baseState, dispatchAction.bind(null, hook.queue)];
}

function run() {
  workInProgressHook = fiber.memoizedState;
  const app = fiber.stateNode();
  isMount = false;
  return app;
}

function App() {
  const [num, setNum] = useState(0);
  const [state, setState] = useState(false);

  console.log(`num = ${num}, state = ${state}`)

  return {
    onClick() {
      setNum(num => num + 1)
    },
    onToggle() {
      setState(num => !num)
    },
  }
}

// test
window.app = run();
window.app.onClick();
window.app.onToggle();
``` 

## build your own react

[原文链接](https://pomb.us/build-your-own-react/)

[中文版本](https://www.tangdingblog.cn/blog/react/buildyourownreact-2020-09-22/)

[codeSandbox](https://codesandbox.io/s/didact-8-21ost)

将会实现的功能

1. createElement 函数
2. render 函数
3. Concurrent mode
4. Fibers
5. Render 和 Commit 阶段
6. Reconciliation
7. Function Components
8. Hooks

### createElement 函数

在 jsx 函数前使用 `/** @jsx Didact.createElement */` 注释可以告诉编辑器使用 Didact.createElement 代替 React.createElement 处理 jsx

```jsx
/** @jsx Didact.createElement */
const element = (
  <div id="foo">
    <a>bar</a>
    <b />
  </div>
)

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      // 考虑基本类型或者空节点
      children: children.map(child =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    }
  }
}

// 在实际的 react 代码中是不会去把这些基本类型或者空节点给包装成对象的
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    }
  }
}

const Didact = {
  createElement,
}
```

### render 函数

```jsx
function render(element, container) {
  const dom = 
    element.type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(element.type);
  const { children, ...props} = element.props;

  Object.keys(props).map(name => {
    dom[name] = props[name]
  })

  children.map(child => {
    render(child, dom)
  })

  container.appendChild(dom)
}

const Didact = {
  render
}

const container = document.getElementById("root")
Didact.render(element, container)
```

### Concurrent Mode

目前为止，rendering 是同步执行的，一旦开始，在 react element 树递归完成前都不能停止。

现在需要把工作拆成一个个小的单元，每个单元工作完成后查看一下浏览器是否有更重要的工作，如果有就打断当前的渲染循环。

```js
let nextUnitOfWork = null

function workLoop(deadline) {
  let shouldYield = false

  // 如果还有工作没完成 && 不应该中断
  while(nextUnitOfWork && !shouldYield) {
    // 执行一个单元的工作，然后把 nextUnitOfWork 往后移
    // performUnitOfWork 函数除了执行一个小单元的工作外，还需要返回下一个需要被执行的单元工作
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )

    // 检查是否还有时间，如果剩余时间小于 1，那么应该中断了
    shouldYield = deadline.timeRemaining() < 1
  }

  // 注册在下一个浏览器空余时间里继续执行工作
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
```

react 并不是使用 requestIdleCallback，它在 scheduler package 中实现了和 requestIdleCallback 一样的功能。

### Fibers

为了更好的实现单元工作（unit of work）我们需要引入名为 fiber 的数据结构。每一个 react element 都将对应一个 fiber 结构，每一个 fiber 结构都对应一个单元的工作。

```js
// 有这样的一个需要渲染的元素树

Didact.render(
  <div>
    <h1>
      <p />
      <a />
    </h1>
    <h2 />
  </div>,
  container
)

// 对应的 fiber 树如下：
// 这里的 parent 实际上是 return
// root --- child ---> <div> --- child ---> <h1> --- child ---> <p>
//    | <--- parent ------ | <--- parent ----- | <--- parent --- |
//                         |                   |                 sibling
//                         |                   |                 |
//                         |                   |                 v
//                         |                   | <--- parent -- <a>
//                         |                   |
//                         |                   sibling
//                         |                   | 
//                         |                   v
//                         | <--- parent -- <h2>
```

在 render 中我们需要创建 root fiber（根 fiber）然后在 nextUnitOfWork 中设置它。剩下的工作将在 performUnitOfWork 函数中完成，我们将对每一个 fiber 节点做三件事：

- 把 react element 渲染到 dom 上。
- 给 react element 子节点创建 fiber 节点。
- 选择下一个的单元工作

```js
function createDom(fiber) {
  const dom = 
    fiber.type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(fiber.type);
  const { children, ...props} = fiber.props;

  Object.keys(props).map(name => {
    dom[name] = props[name]
  })

  return dom
}

function render(element, container) {
  // 这里相当于创建了一个工作单元，配合 requestIdleCallback(workLoop)
  // 就能实现在浏览器空闲时执行具体的工作
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
  }
}

let nextUnitOfWork = null

function performUnitOfWork(fiber) {

  // 1. 把 react element 渲染成 dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom)
  }

  // 2. 创建子 fiber 节点
  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while(index < elements.length) {
    const ele = elements[index]

    const newFiber = {
      type: ele.type,
      props: ele.props,
      parent: fiber,
      dom: null,
    }

    // 父 fiber 的 child 只会指向第一个子 fiber
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  // 3. 返回下一个单元工作
  // fiber 拥有 child 属性可以指向下一个需要进行工作的 fiber 节点。
  // 如果没有 child 则使用 sibling 代表下一个需要进行工作的 fiber 节点。
  // 如果没有 sibling 则需要往上找父节点的 sibling。
  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}
```

### Render 和 Commit 阶段

在上面的实现中，我们在每一个工作单元中添加 node 节点到 document 上面。但是我们在设计 render 的时候，浏览器可以随时在繁忙的时候打断我们的工作，这样我们可能会看到一个不完整的 ui 渲染。

所以实际上应该把根 fiber 节点记录下来，一旦完成了所有的工作（即不存在 nextUnitOfWork）的时候，一次性把整个 fiber 树更新到 document 上面，删除 performUnitOfWork 中的 `fiber.parent.dom.appendChild(fiber.dom)`。

这样也就是分为两个阶段了，render 阶段随时可以中断，只标记更新而不操作 dom（指不渲染到界面上），commit 阶段同步执行，更新 dom。

```js
// commit 阶段
function commitRoot(){
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }

  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// render 阶段
function render(element, container) {
  // 流程树
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  }
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let wipRoot = null

function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }

​  // 一次性全部提交
  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  requestIdleCallback(workLoop)
}
```

### [Reconciliation](https://codesandbox.io/s/didact-6-96533)

目前我们只考虑了往 document 上面添加元素，更新和删除却没有去做。我们现在来添加这部分的功能，我们需要比较 render 函数这次收到的 fiber 结构和我们上次更新的 fiber 树的不同。

因此我们需要在更新完毕之后保存一份更新过的 fiber 树，我们叫它 currentRoot。在每一个 fiber 节点当中我们也添加 alternate 属性，该属性指向上次更新的 fiber 节点。

我们同时循环老的 fiber 树的子节点和我们需要调和新的的 react 节点，此刻只关心 oldFiber 和 react element。react element 是我们想要更新到 document 上面的元素，oldFiber 是我们上次更新完毕的老的 fiber 节点。我们需要比较他们，如果前后有任何的改变都需要更新到 document 上面。

我们使用 type 来对他们进行比较：

- 如果 old fiber 和 react element 都拥有相同的 type（dom 节点相同），我们只需要更新它的属性。
- 如果 type 不同说明这里替换成了新的 dom 节点，我们需要创建。
- 如果 type 不同且同级仅存在 old fiber 说明节点老节点删除了，我们需要移除老的节点。

react 源码中还使用了 key 来进行调度调和的优化。比如通过比较 key 属性可以得到 react elements 中被替换的明确位置。

```js
// commit
function commitRoot() {
  // 删除节点操作
  deletions.map(commitWork)

  commitWork(wipRoot.child)
  // 添加 currentRoot
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  const domParent = fiber.parent.dom
  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom)
  }
​
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

const isEvent = key => key.startsWith("on")
const isProperty = key =>
  key !== "children" && !isEvent(key)
const isNew = (prev, next) => key =>
  prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)

function updateDom(dom, prevProps, nextProps) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in nextProps) ||
        isNew(prevProps, nextProps)(key)
    )
    .map(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        prevProps[name]
      )
    })
​
  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .map(name => {
      dom[name] = nextProps[name]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .map(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        nextProps[name]
      )
    })
}

// render
function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    // 添加 alternate
    alternate: currentRoot,
  }
  // 新增记录删除的数组
  deletions = []
  nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null

// 新增记录删除的数组
let deletions = null

function performUnitOfWork(fiber) {
  // 1
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
​
  // 创建新 fiber 节点部分的代码抽取成 reconcileChildren 函数。将在 reconcileChildren 函数中根据老的 fiber 节点来调和新的 react 元素。
  const elements = fiber.props.children
  reconcileChildren(fiber, elements)
​
  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

function reconcileChildren(wipFiber, elements) {
  let index = 0
  let oldFiber =
    wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

   while (
    index < elements.length ||
    oldFiber != null
  ) {
    const ele = elements[index]
    let newFiber = null
    const sameType =
      oldFiber &&
      ele &&
      ele.type == oldFiber.type
​
    if (sameType) {
      // update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (ele && !sameType) {
      // add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
      // delete the oldFiber's node
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
​
    prevSibling = newFiber
    index++
  }
}
```

### Function Components

接下来需要增加对函数式组件的支持

```jsx
function performUnitOfWork(fiber) {
  const isFunctionComponent =
    fiber.type instanceof Function

  // 函数式组件进行专门的函数更新
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
    // updateHostComponent 内容即一下部分：
    // if (!fiber.dom) {
    //   fiber.dom = createDom(fiber)
    // }
    // const elements = fiber.props.children
    // reconcileChildren(fiber, elements)
  }

  if (fiber.child) {
    return fiber.child
  }
  
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }
  let domParentFiber = fiber.parent

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  if (
    fiber.effectTag === "PLACEMENT" &&
    fiber.dom != null
  ) {
    domParent.appendChild(fiber.dom)
  } else if (
    fiber.effectTag === "UPDATE" &&
    fiber.dom != null
  ) {
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    )
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent)
  }
​
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

// 更改为找到拥有 dom 节点的 fiber 为止
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}
```

### Hooks

```jsx
/** @jsx Didact.createElement */
function Counter() {
  const [state, setState] = Didact.useState(1)
  return (
    <h1 onClick={() => setState(c => c + 1)}>
      Count: {state}
    </h1>
  )
}
const element = <Counter />
```

```js
let wipFiber = null
let hookIndex = null

function updateFunctionComponent(fiber) {
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }
​
  const actions = oldHook ? oldHook.queue : []
  actions.forEach(action => {
    hook.state = action(hook.state)
  })

  const setState = action => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    // 设置为下一个更新工作单元
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}
```