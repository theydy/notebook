# 《JavaScript 设计模式核⼼原理与应⽤实践》笔记

## 函数工厂模式

函数工厂模式又分为简单工厂模式和抽象工厂模式。

函数工厂模式其实就是将创建对象的过程单独封装。

## 单例模式

单例模式即：保证一个类仅有一个实例。

```js
// 定义Storage
class Storage {
    static getInstance() {
        // 判断是否已经 new 过1个实例
        if (!Storage.instance) {
            // 若这个唯一的实例不存在，那么先创建它
            Storage.instance = new Storage()
        }
        // 如果这个唯一的实例已经存在，则直接返回
        return Storage.instance
    }
    getItem (key) {
        return localStorage.getItem(key)
    }
    setItem (key, value) {
        return localStorage.setItem(key, value)
    }
}
```

## 装饰器模式

在不改变原有代码函数的情况下，给函数添加新功能。

es7 中的装饰器使用分为两种，一种是作用于类上的装饰器叫`类装饰器`，一种是作用于类中属性、方法的装饰器叫`方法装饰器`。两者接收的参数不同。

- 类装饰器：接收参数 `(target)`，这个 target 就是类本身。
- 方法装饰器：接收参数 `(target, name, descriptor)`，这个 target 是类的原型对象。name 即修饰的目标属性的属性名或方法的方法名。descriptor 是属性描述对象，和 `Object.defineProperty` 中传的 descriptor 数据结构相同 `{ value, get, set, writable, enumerable, configurable }`。

## 适配器模式

适配器模式可以把一个类的接口变换成客户端所期待的另一种接口

