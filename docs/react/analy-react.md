# rectt

[React技术揭秘](https://react.iamkasong.com/preparation/newConstructure.html)

## react 16 架构

- Scheduler：调度器，调度任务的优先级，高优任务优先进入 Reconciler
- Reconciler： 协调器，负责找出变化的组件
- Renderer： 渲染器，负责将变化的组件渲染到页面

与 react 15 相比，新增了 Reconciler

- Reconciler 工作的阶段被称为 render 阶段。因为在该阶段会调用组件的 render 方法。
- Renderer 工作的阶段被称为 commit 阶段。commit 阶段会把 render 阶段提交的信息渲染在页面上。

render 与 commit 阶段统称为 work，即 React 在工作中。相对应的，如果任务正在 Scheduler 内调度，就不属于 work。

### Scheduler（调度器）

Scheduler 其实是对于 [requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback) 的一种 polyfill

### Reconciler（协调器）

```js
/** @noinline */
function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  while (workInProgress !== null && !shouldYield()) {
    workInProgress = performUnitOfWork(workInProgress);
  }
}
```

Reconciler 每次循环都会调用 `shouldYield` 判断当前是否还有剩余时间，当 Scheduler 将任务交给 Reconciler 后，Reconciler 会为变化的虚拟 DOM 打上代表增/删/更新的标记。

整个 Scheduler 与 Reconciler 的工作都在内存中进行。只有当所有组件都完成 Reconciler 的工作，才会统一交给 Renderer。

整个 Scheduler 与 Reconciler 的工作随时有可能因为一下原因中断：

- 有其他更高优任务需要先更新
- 当前帧没有剩余时间

由于整个 Scheduler 与 Reconciler 的工作都在内存中进行，不会更新页面上的 DOM，所以即使反复中断，用户也不会看见更新不完全的 DOM

Reconciler 内部采用了 Fiber 的架构。

### Renderer（渲染器）

Renderer 根据 Reconciler 为虚拟 DOM 打的标记，同步执行对应的 DOM 操作。

## Fiber 架构

虚拟 DOM 在 React 中有个正式的称呼——Fiber

在 React15 及以前，Reconciler 采用递归的方式创建虚拟 DOM，递归过程是不能中断的。如果组件树的层级很深，递归会占用线程很多时间，造成卡顿。

为了解决这个问题，React16 将递归的无法中断的更新重构为异步的可中断更新。

Fiber 节点保存对应的 DOM 节点，Fiber 节点构成的 Fiber 树就对应 DOM 树

双缓存：在内存中构建并直接替换

React 使用“双缓存”来完成 Fiber 树的构建与替换——对应着 DOM 树的创建与更新。

在 React 中最多会同时存在两棵 Fiber 树。当前屏幕上显示内容对应的 Fiber 树称为 current Fiber 树，正在内存中构建的 Fiber 树称为 workInProgress Fiber 树。

两棵树中的 fiber 节点通过 alternate 属性互相连接

```js
currentFiber.alternate === workInProgressFiber;
workInProgressFiber.alternate === currentFiber;
```

React 应用的根节点通过使 current 指针在不同 Fiber 树的 rootFiber 间切换来完成 current Fiber 树指向的切换。

### mount 时

区分 fiberRoot 和 rootFiber，fiberRoot 是整个应用的根节点（唯一），rootFiber 是 `<App/>` 所在组件树的根节点（可通过调用 ReactDOM.render 渲染不同的组件树，他们会拥有不同的 rootFiber）。

mount 既首次执行渲染时，首先会创建 fiberRoot 和 rootFiber，此时 rootFiber 是空的既没有任何子 Fiber 节点。接着进入 render 阶段，根据 jsx 创建 Fiber 树。最后进入 commit 阶段，把 Fiber 树渲染到页面上。

### update 时

触发重新渲染，开启一次新的 render 阶段并构建一棵新 workInProgress Fiber 树，构建完成后进入 commit 阶段渲染到页面上，渲染完毕后 workInProgress Fiber 树变为 current Fiber 树

## render 阶段

首先从 rootFiber 开始向下深度优先遍历。为遍历到的每个 Fiber 节点调用 beginWork 方法。

该方法会根据传入的 Fiber 节点创建子 Fiber 节点，并将这两个 Fiber 节点连接起来。

当某个 Fiber 节点执行完 completeWork，如果其存在兄弟 Fiber 节点（即 fiber.sibling !== null），会进入其兄弟 Fiber 的“递”阶段。如果不存在兄弟 Fiber，会进入父级 Fiber 的“归”阶段。“递”和“归”阶段会交错执行直到“归”到 rootFiber。至此， render 阶段的工作就结束了。

### beginWork

传入当前 Fiber 节点，创建子 Fiber 节点

beginWork 的工作可以分为两部分：

- update 时：current 存在，在满足一定条件时可以复用 current 节点，这样就能克隆 current.child 作为 workInProgress.child，而不需要新建 workInProgress.child。
- mount 时：除 fiberRoot 以外，current === null。会根据 fiber.tag 不同，创建不同类型的子 Fiber 节点

核心方法 `reconcileChildren`

- 对于 mount 的组件，他会创建新的子 Fiber 节点
- 对于 update 的组件，他会将当前组件与该组件在上次更新时对应的 Fiber 节点比较（也就是俗称的 Diff 算法），将比较的结果生成新 Fiber 节点

### completeWork

## commit 阶段

commitRoot 方法是 commit 阶段工作的起点

commit 阶段的主要工作（即 Renderer 的工作流程）分为三部分：

- before mutation 阶段（执行 DOM 操作前）
- mutation 阶段（执行 DOM 操作）
- layout 阶段（执行 DOM 操作后）

### before mutation 阶段

整个过程就是遍历 effectList 并调用 commitBeforeMutationEffects 函数处理

### commitBeforeMutationEffects

- 处理 DOM 节点渲染/删除后的 autoFocus、blur 逻辑。
- 调用 getSnapshotBeforeUpdate 生命周期钩子。
- 调度 useEffect。

```js
function commitBeforeMutationEffects() {
  while (nextEffect !== null) {
    const current = nextEffect.alternate;

    if (!shouldFireAfterActiveInstanceBlur && focusedInstanceHandle !== null) {
      // ...focus blur相关
    }

    const effectTag = nextEffect.effectTag;

    // 调用getSnapshotBeforeUpdate
    if ((effectTag & Snapshot) !== NoEffect) {
      commitBeforeMutationEffectOnFiber(current, nextEffect);
    }

    // 调度useEffect
    if ((effectTag & Passive) !== NoEffect) {
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true;
        scheduleCallback(NormalSchedulerPriority, () => {
          flushPassiveEffects();
          return null;
        });
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

commitBeforeMutationEffectOnFiber 是 commitBeforeMutationLifeCycles 的别名。

在该方法内会调用 getSnapshotBeforeUpdate。

异步调度的回调函数就是触发 useEffect 的方法 flushPassiveEffects

在 flushPassiveEffects 方法内部会从全局变量 rootWithPendingPassiveEffects 获取 effectList。

- before mutation 阶段在 scheduleCallback 中调度 flushPassiveEffects
- layout 阶段之后将 effectList 赋值给 rootWithPendingPassiveEffects
- scheduleCallback 触发 flushPassiveEffects，flushPassiveEffects 内部遍历 rootWithPendingPassiveEffects

之所以要用异步调用 useEffect 的原因是防止同步执行时阻塞浏览器渲染

### mutation 阶段

mutation 阶段也是遍历 effectList，执行函数。这里执行的是 commitMutationEffects

```js
nextEffect = firstEffect;
do {
  try {
      commitMutationEffects(root, renderPriorityLevel);
    } catch (error) {
      invariant(nextEffect !== null, 'Should be working on an effect.');
      captureCommitPhaseError(nextEffect, error);
      nextEffect = nextEffect.nextEffect;
    }
} while (nextEffect !== null);
```

### commitMutationEffects

commitMutationEffects 会遍历 effectList，对每个 Fiber 节点执行如下三个操作：

- 根据 ContentReset effectTag 重置文字节点
- 更新 ref
- 根据 effectTag 分别处理，其中 effectTag 包括(Placement | Update | Deletion | Hydrating)

`Placement effect`

当 Fiber 节点含有 Placement effectTag，意味着该 Fiber 节点对应的 DOM 节点需要插入到页面中。

调用的方法为 commitPlacement，改方法大致分为三步：

- 获取父级 DOM 节点

```js
const parentFiber = getHostParentFiber(finishedWork);
// 父级DOM节点
const parentStateNode = parentFiber.stateNode;
```

- 获取 Fiber 节点的 DOM 兄弟节点

```js
const before = getHostSibling(finishedWork);
```

- 根据 DOM 兄弟节点是否存在决定调用 parentNode.insertBefore 或 parentNode.appendChild 执行 DOM 插入操作

```js
// parentStateNode是否是rootFiber
if (isContainer) {
  insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
} else {
  insertOrAppendPlacementNode(finishedWork, before, parent);
}
```

`Update effect`

当 Fiber 节点含有 Update effectTag，意味着该 Fiber节 点需要更新。调用的方法为 commitWork

commitWork 主要看 FunctionComponent 和 HostComponent

FunctionComponent 中会调用 commitHookEffectListUnmount。该方法会遍历 effectList，执行所有 useLayoutEffect hook 的销毁函数

HostComponent 中会调用 commitUpdate，最终会在 updateDOMProperties 中将 render 阶段 completeWork 中为 Fiber 节点赋值的 updateQueue 对应的内容渲染在页面上。

`Deletion effect`

当 Fiber 节点含有 Deletion effectTag，意味着该 Fiber 节点对应的 DOM 节点需要从页面中删除。调用的方法为 commitDeletion。

- 递归调用 Fiber 节点及其子孙 Fiber 节点中 fiber.tag 为 ClassComponent 的 componentWillUnmount 生命周期钩子，从页面移除 Fiber 节点对应 DOM 节点
- 解绑ref
- 调度 useEffect 的销毁函数

### layout 阶段

该阶段之所以称为 layout，因为该阶段的代码都是在 DOM 渲染完成（mutation阶段完成）后执行的。

该阶段触发的生命周期钩子和 hook 可以直接访问到已经改变后的 DOM，即该阶段是可以参与 DOM layout 的阶段。

layout 阶段也是遍历 effectList ，执行函数 commitLayoutEffects。

```js
function commitLayoutEffects(root: FiberRoot, committedLanes: Lanes) {
  while (nextEffect !== null) {
    const effectTag = nextEffect.effectTag;

    // 调用生命周期钩子和hook
    if (effectTag & (Update | Callback)) {
      const current = nextEffect.alternate;
      commitLayoutEffectOnFiber(root, current, nextEffect, committedLanes);
    }

    // 赋值ref
    if (effectTag & Ref) {
      commitAttachRef(nextEffect);
    }

    nextEffect = nextEffect.nextEffect;
  }
}
```

- commitLayoutEffectOnFiber（调用生命周期钩子和 hook 相关操作）
- commitAttachRef（赋值 ref）

`commitLayoutEffectOnFiber`

对于 ClassComponent，他会通过 current === null? 区分是 mount 还是 update，调用 componentDidMount 或 componentDidUpdate

对于 FunctionComponent 及相关类型，他会调用 useLayoutEffect hook 的回调函数，调度 useEffect 的销毁与回调函数

`commitAttachRef`

```js
function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instance = finishedWork.stateNode;

    // 获取DOM实例
    let instanceToUse;
    switch (finishedWork.tag) {
      case HostComponent:
        instanceToUse = getPublicInstance(instance);
        break;
      default:
        instanceToUse = instance;
    }

    if (typeof ref === "function") {
      // 如果ref是函数形式，调用回调函数
      ref(instanceToUse);
    } else {
      // 如果ref是ref实例形式，赋值ref.current
      ref.current = instanceToUse;
    }
  }
}
```

获取 DOM 实例，更新 ref

## diff 算法

前后两棵树完全比对的算法的复杂程度为 O(n 3 )

为了降低算法复杂度，React的diff会预设三个限制：

- 只对同级元素进行 Diff。如果一个 DOM 节点在前后两次更新中跨越了层级，那么 React 不会尝试复用他。
- 两个不同类型的元素会产生出不同的树。如果元素由 div 变为 p，React 会销毁 div 及其子孙节点，并新建 p 及其子孙节点。
- 开发者可以通过 key prop 来暗示哪些子元素在不同的渲染下能保持稳定

### Diff是如何实现的

Diff 的入口函数是 reconcileChildFibers，该函数会根据 newChild（即 JSX 对象）类型调用不同的处理函数。

当 newChild 类型为 object、number、string，代表同级只有一个节点

当 newChild 类型为 Array，同级有多个节点

`单节点 Diff`

以类型 object 为例，会进入 reconcileSingleElement

```js
  const isObject = typeof newChild === 'object' && newChild !== null;

  if (isObject) {
    // 对象类型，可能是 REACT_ELEMENT_TYPE 或 REACT_PORTAL_TYPE
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        // 调用 reconcileSingleElement 处理
      // ...其他case
    }
  }
```

这里会优先判断能否复用 DOM 节点，如果不能，标记 DOM 需要被删除，新生成一个 Fiber 节点返回；如果能够复用 DOM 节点，将上次更新的 Fiber 节点的副本作为本次新生成的 Fiber 节点返回。

React 通过先判断 key 是否相同，如果 key 相同则判断 type 是否相同，只有都相同时一个 DOM 节点才能复用

`多节点 Diff`

同级多个节点的变化必定被包含在一下情况中：

- 节点更新：节点属性变化、节点类型更新
- 节点新增或减少
- 节点位置变化

React 团队发现，在日常开发中，相较于新增和删除，更新组件发生的频率更高。所以 Diff 会优先判断当前节点是否属于更新

React Diff 不能使用双向指针遍历是因为，diff 对比的是 jsx 对象和 current fiber，jsx 对象的 newChildren 确实是数组的形式，但是同级 fiber 节点是通过 sibling 属性指针链接形成的单链表，不支持双指针遍历。

所以，Diff算法的整体逻辑会经历两轮遍历：

第一轮遍历：处理更新的节点。

第二轮遍历：处理剩下的不属于更新的节点。

`第一轮遍历`

- let i = 0，遍历 newChildren，将 newChildren[i] 与 oldFiber 比较，判断 DOM 节点是否可复用。
- 如果可复用，i++，继续比较 newChildren[i] 与 oldFiber.sibling，可以复用则继续遍历。
- 如果不可复用，分两种情况：
- - key 不同导致不可复用，立即跳出整个遍历，第一轮遍历结束。
- - key 相同 type 不同导致不可复用，会将 oldFiber 标记为 DELETION，并继续遍历
- 如果 newChildren 遍历完（即 i === newChildren.length - 1）或者 oldFiber 遍历完（即 oldFiber.sibling === null），跳出遍历，第一轮遍历结束。

`第二轮遍历`

进入第二轮遍历的情况有这么几种

- newChildren 与 oldFiber 同时遍历完：这说明只需在第一轮遍历进行组件更新即可，Diff 结束
- newChildren 没遍历完，oldFiber 遍历完：剩余 newChildren 节点是本次更新新插入节点，需要遍历剩下的 newChildren 生成的 workInProgress fiber 依次标记 Placement
- newChildren 遍历完，oldFiber 没遍历完：需要遍历剩下的 oldFiber，依次标记 Deletion
- newChildren 与 oldFiber 都没遍历完：将所有还未处理的 oldFiber 存入以 key 为 key，oldFiber 为 value 的 Map 中，接下来遍历剩余的 newChildren，通过 newChildren[i].key 就能在 map 中找到 key 相同的 oldFiber

## 状态更新

### 流程概览

```markdown
触发状态更新（根据场景调用不同方法）

    |
    |
    v

创建Update对象

    |
    |
    v

从fiber到root（`markUpdateLaneFromFiberToRoot`）

    |
    |
    v

调度更新（`ensureRootIsScheduled`）

    |
    |
    v

render阶段（`performSyncWorkOnRoot` 或 `performConcurrentWorkOnRoot`）

    |
    |
    v

commit阶段（`commitRoot`）
```

在 React 中，有如下方法可以触发状态更新（排除 SSR 相关）：

- ReactDOM.render
- this.setState
- this.forceUpdate
- useState
- useReducer

每次状态更新都会创建一个保存更新状态相关内容的对象，我们叫他 Update。在 render 阶段的 beginWork 中会根据 Update 计算新的 state

从 fiber 到 root，markUpdateLaneFromFiberToRoot 函数从触发状态更新的 fiber 一直向上遍历到 rootFiber，并返回 rootFiber。

现在我们拥有一个 rootFiber，该 rootFiber 对应的 Fiber 树中某个 Fiber 节点包含一个 Update。

接下来通知 Scheduler 根据更新的优先级，决定以同步还是异步的方式调度本次更新。

这里调用的方法是 ensureRootIsScheduled。

```js
if (newCallbackPriority === SyncLanePriority) {
  // 任务已经过期，需要同步执行render阶段
  newCallbackNode = scheduleSyncCallback(
    performSyncWorkOnRoot.bind(null, root)
  );
} else {
  // 根据任务优先级异步执行render阶段
  var schedulerPriorityLevel = lanePriorityToSchedulerPriority(
    newCallbackPriority
  );
  newCallbackNode = scheduleCallback(
    schedulerPriorityLevel,
    performConcurrentWorkOnRoot.bind(null, root)
  );
}
```

可以看到最终就是调用 scheduleSyncCallback 和 scheduleCallback 函数，回调中就是 performSyncWorkOnRoot 和 performConcurrentWorkOnRoot

### Update 对象

- ReactDOM.render —— HostRoot
- this.setState —— ClassComponent
- this.forceUpdate —— ClassComponent
- useState —— FunctionComponent
- useReducer —— FunctionComponent

一共三种组件（HostRoot | ClassComponent | FunctionComponent）可以触发更新

由于不同类型组件工作方式不同，所以存在两种不同结构的 Update，其中 ClassComponent 与 HostRoot 共用一套 Update 结构，FunctionComponent 单独使用一种 Update 结构

`ClassComponent 的 Update 结构`

to be continue

## Hooks

### 极简 Hooks 实现

```jsx
function App() {
  const [num, updateNum] = useState(0);

  return <p onClick={() => updateNum(num => num + 1)}>{num}</p>;
}
```

- 通过一些途径产生更新，更新会造成组件 render。
- 组件 render 时 useState 返回的 num 为更新后的结果。

其中步骤 1 的更新可以分为 mount 和 update：

- 调用 ReactDOM.render 会产生 mount 的更新，更新内容为 useState 的 initialValue（即0）。
- 点击 p 标签触发 updateNum 会产生一次 update 的更新，更新内容为 num => num + 1。

该例子中更新就是如下对象

```js
const update = {
  // 更新执行的函数
  action,
  // 与同一个Hook的其他更新形成链表
  next: null
}
```

多个更新通过 next 形成一个环状单向链表

调用 updateNum 实际调用的是 dispatchAction.bind(null, hook.queue)

```js
function dispatchAction(queue, action) {
  // 创建update
  const update = {
    action,
    next: null
  }

  // 环状单向链表操作
  if (queue.pending === null) {
    // 当 queue 为空时，update 自己首位相连
    update.next = update;
  } else {
    // 否则把 update 插入 queue 队首
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  // queue.pending 永远指向最后一个插入的 update
  queue.pending = update;

  // 模拟React开始调度更新
  schedule();
}
```

更新产生的 update 对象会保存在 queue 中，而 queue 保存在 fiber 对象中

```js
// App组件对应的fiber对象
const fiber = {
  // 保存该 FunctionComponent 对应的 Hooks 链表
  memoizedState: null,
  // 指向 App 函数
  stateNode: App
}
```

Hook 的数据结构如下，与 update 类似，都通过链表连接。不过 Hook 是无环的单向链表

```js
hook = {
  // 保存update的queue，即上文介绍的queue
  queue: {
    pending: null
  },
  // 保存hook对应的state
  memoizedState: initialState,
  // 与下一个Hook连接形成单向无环链表
  next: null
}
```

每个 useState 对应一个 hook 对象。

调用 hooks 相应的 update 函数产生的 update 保存在 useState 对应的 hook.queue 中。

接下来看模拟调度更新

```js
// 首次 render 时是 mount
isMount = true;

function schedule() {
  // 更新前将 workInProgressHook 重置为 fiber 保存的第一个 Hook
  workInProgressHook = fiber.memoizedState;
  // 触发组件 render
  fiber.stateNode();
  // 组件首次 render 为 mount，以后再触发的更新为 update
  isMount = false;
}
```

组件 render 时会调用 useState，他的大体逻辑如下

```js
function useState(initialState) {
  // 当前 useState 使用的 hook 会被赋值该该变量
  let hook;

  if (isMount) {
    // mount时为该useState生成hook
    hook = {
      queue: {
        pending: null
      },
      memoizedState: initialState,
      next: null
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


  let baseState = hook.memoizedState;
  if (hook.queue.pending) {
    // ...根据 queue.pending 中保存的 update 更新 state
    let firstUpdate = hook.queue.pending.next;

    do {
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending.next)

    hook.queue.pending = null;
  }
  hook.memoizedState = baseState;

  return [baseState, dispatchAction.bind(null, hook.queue)];
}
```

最终结果如下

```js
let workInProgressHook;
let isMount = true;

const fiber = {
  memoizedState: null,
  stateNode: App
};

function schedule() {
  workInProgressHook = fiber.memoizedState;
  const app = fiber.stateNode();
  isMount = false;
  return app;
}

function dispatchAction(queue, action) {
  const update = {
    action,
    next: null
  }
  if (queue.pending === null) {
    update.next = update;
  } else {
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  queue.pending = update;

  schedule();
}

function useState(initialState) {
  let hook;

  if (isMount) {
    hook = {
      queue: {
        pending: null
      },
      memoizedState: initialState,
      next: null
    }
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }
    workInProgressHook = hook;
  } else {
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }

  let baseState = hook.memoizedState;
  if (hook.queue.pending) {
    let firstUpdate = hook.queue.pending.next;

    do {
      const action = firstUpdate.action;
      baseState = action(baseState);
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending)

      hook.queue.pending = null;
  }
  hook.memoizedState = baseState;

  return [baseState, dispatchAction.bind(null, hook.queue)];
}

function App() {
  const [num, updateNum] = useState(0);

  console.log(`${isMount ? 'mount' : 'update'} num: `, num);

  return {
    click() {
      updateNum(num => num + 1);
    }
  }
}

window.app = schedule();
```

### Hooks 数据结构

在真实的 Hooks 中并没有使用 isMount 变量区分 mount 与 update，组件 mount 时的 hook 与 update 时的 hook 来源于不同的对象，这类对象在源码中被称为 dispatcher

```js
// mount时的Dispatcher
const HooksDispatcherOnMount: Dispatcher = {
  useCallback: mountCallback,
  useContext: readContext,
  useEffect: mountEffect,
  useImperativeHandle: mountImperativeHandle,
  useLayoutEffect: mountLayoutEffect,
  useMemo: mountMemo,
  useReducer: mountReducer,
  useRef: mountRef,
  useState: mountState,
  // ...省略
};

// update时的Dispatcher
const HooksDispatcherOnUpdate: Dispatcher = {
  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState,
  // ...省略
};

```

mount 时调用的 hook 和 update 时调用的 hook 其实是两个不同的函数

在 FunctionComponent render 前，会根据 FunctionComponent 对应 fiber 的以下条件区分 mount 与 update。

```js
current === null || current.memoizedState === null
```

并将不同情况对应的 dispatcher 赋值给全局变量 ReactCurrentDispatcher 的 current 属性

```js
ReactCurrentDispatcher.current =
  current === null || current.memoizedState === null
    ? HooksDispatcherOnMount
    : HooksDispatcherOnUpdate;  
```

也就是说 ReactCurrentDispatcher.current 永远指向当前的 hook，有点类似 vue 中的 Dep.target

```js
const hook: Hook = {
  memoizedState: null,

  baseState: null,
  baseQueue: null,
  queue: null,

  next: null,
};
```

hook 与 FunctionComponent fiber 都存在 memoizedState 属性，不要混淆他们的概念。

- fiber.memoizedState：FunctionComponent 对应 fiber 保存的 Hooks 链表。
- hook.memoizedState：Hooks 链表中保存的单一 hook 对应的数据

不同类型 hook 的 memoizedState 保存不同类型数据

- useState：对于 `const [state, updateState] = useState(initialState)`，memoizedState 保存 state 的值
- useReducer：对于 `const [state, dispatch] = useReducer(reducer, {})`，memoizedState 保存 state 的值
- useEffect：memoizedState 保存包含 useEffect 回调函数、依赖项等的链表数据结构 effect，effect 链表同时会保存在 fiber.updateQueue 中
- useRef：对于 `useRef(1)`，memoizedState 保存 `{current: 1}`
- useMemo：对于 `useMemo(callback, [depA])`，memoizedState 保存 `[callback(), depA]`
- useCallback：对于 `useCallback(callback, [depA])`，memoizedState 保存 `[callback, depA]`。与 useMemo 的区别是， useCallback 保存的是 callback 函数本身，而 useMemo 保存的是 callback 函数的执行结果

有些 hook 是没有 memoizedState 的，比如：useContext



useEffect的执行需要保证所有组件useEffect的销毁函数必须都执行完后才能执行任意一个组件的useEffect的回调函数。

这是因为多个组件间可能共用同一个ref。