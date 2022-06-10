# css

## css 选择器权重

!important 最高

内联样式：1000

id 选择器：100

类选择器、伪类选择器、属性选择器：10

元素选择器：1

`选择器权重相加不能跨等级，即：100 个类选择器的权重相加也不会高过 1 个 id 选择器。`

`IE 和 EDGE 上 256 个 class 依然能干掉 id，chrome 和 firefox 最新的 id 最大。`

## BFC

BFC 即 Block Formatting Contexts (块级格式化上下文)，它是一个独立的渲染区域，容器里面的子元素不会影响到外面的元素，反之也如此。

### 生成 BFC

- float 不为 none
- overflow 不为 visible
- position 为 absolute 或 fixed
- display 为 inline-block、flex、table-cell 等

### BFC 特性

- BFC 计算高度时不会因为内部的浮动元素而坍塌
- BFC 元素不会和浮动元素重叠
- 属于同一个 BFC 的两个相邻 box 的 margin 会发生重叠

## 盒子模型

盒子模型分为`标准盒模型`和`怪异盒模型（IE 模型）`

### 标准盒模型

标准盒模型：width = content，height = content。

`box-sizing: content-box;`

### 怪异盒模型

怪异盒模型：width = content + padding + border，height = content + padding + border。

`box-sizing: border-box;`

## 层叠上下文

层叠上下文的特性：

- 层叠上下文可以嵌套，内部层叠上下文及其所有子元素均受制与外部的层叠上下文。
- 每个层叠上下文和另外的兄弟元素独立，也就是进行重渲染的时候只需要考虑后代元素。
- 层叠上下文未指定 `z-index` 时，其层叠等级与 `z-index: 0` 相同，要比普通元素高。

**z-index: auto 一般来说不生成层叠上下文**

创建层叠上下文的方式：

- 页面根元素，称之为根层叠上下文
- z-index 值为数值的定位元素（position 不为 static）
- css3 属性
  - z-index 不为 auto 的 flex 项
  - opacity 不是 1
  - transfrom 不是 none
  - filter 不是 none

## flex

`flex: flex-grow flex-shrink flex-basis`

### flex-grow

flex-grow 用于设置各 item 项按对应比例划分剩余空间，若 flex 中没有指定 flex-grow，则相当于设置了 flex-grow: 1

控制子元素占据父容器的份数 [抛去子元素内容再平均分] `flex-grow: 0 | 数字 [不能是负数]`

### flex-shrink

flex-shrink 用于设置 item 的总和超出容器空间时，各 item 的收缩比例，若 flex 中没有指定 flex-shrink，则等同于设置了 flex-shrink: 1

控制子元素在剩余空间不足时，缩小的权值 `flex-shrink: 1 | 数字 [不能是负数]`

### flex-basis

flex-basis 用于设置各 item 项的伸缩基准值，可以取值为长度或百分比，如果 flex 中省略了该属性，则相当于设置了 flex-basis: 0

子元素的基准值，计算剩余空间时需要先抛去基准值 `flex-basis: auto | [width] | 0`

## grid

```html
<div class="wrapper">
  <div class="header"></div>
  <div class="nav"></div>
  <div class="main"></div>
  <div class="aside"></div>
  <div class="footer"></div>
</div>

<style>

.wrapper {
  display: grid;
  grid-template-rows: 100px 1fr 100px;
  grid-template-columns: 50px 1fr 50px;
  grid-template-area: "header header header" "nav main aside" "footer footer footer";
  height: 100%;
}

.header {
  grid-area: header
}

.nav {
  grid-area: nav
}

.main {
  grid-area: main
}

.aside {
  grid-area: aside
}

.footer {
  grid-area: footer
}
</style>
```

## margin 为负值对布局的影响

- 在 css 世界中，padding 是不可以为负值的，但是 margin 可以
- 当元素不存在 width 属性或者 width: auto 时，负值 margin 会增加元素的宽度