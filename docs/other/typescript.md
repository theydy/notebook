# typescript

[typescript playground](https://www.typescriptlang.org/play/?ts=4.1.0-pr-40336-88)

[type-challenges](https://github.com/type-challenges/type-challenges)

[utility-types](https://github.com/piotrwitek/utility-types)

## 条件类型

```tsx
type isString<T> = T extends string ? true : false

type t1 = isString<'test'>
type t2 = isString<123>
```

## 分布式条件类型

在条件类型 `T extends U ? X : Y` 中，当泛型参数 `T` 取值为 `A | B | C` 时，且 `A\B\C` 均为裸类型时，这个条件类型可以拆解为 `(A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)`，这就是分布式条件类型

```tsx
type TypeName<T> =
    T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    T extends undefined ? "undefined" :
    T extends Function ? "function" :
    "object";

type T10 = TypeName<string | (() => void)>;  // "string" | "function"
type T12 = TypeName<string | string[] | undefined>;  // "string" | "object" | "undefined"
type T11 = TypeName<string[] | number[]>;  // "object"
```

## infer

只能用在条件类型中，用来推断一个未知的类型

```tsx
type Format320 = { urls: { format320p: string } };
type Format480 = { urls: { format480p: string } };
type Format720 = { urls: { format720p: string } };
type Format1080 = { urls: { format1080p: string } };
type Video = Format320 | Format480 | Format720 | Format1080;

type PickKeys<T> = T extends Record<infer P, any> ? P : never;
type FormatKeys = PickKeys<Video['urls']>; // 'format320p' | 'format480p' | 'format720p' | 'format1080p';
```

## 联合类型转交叉类型

[协变与逆变](https://jkchao.github.io/typescript-book-chinese/tips/covarianceAndContravariance.html)

`A 是 B 的子类型`

参数位是逆变，即 `(arg: B) => T` 是 `(arg: A) => T` 的子集

返回值位是协变，即 `(arg: T) => A` 是 `(arg: T) => B` 的子集

```tsx
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type T1 = {a: 1}
type T2 = {b: 2}
type TAB = UnionToIntersection<T1 | T2>  // T1 & T2
```

## 其他

### 数组转联合类型

```tsx
type A = ['a', 'b', 'c', 'd'];

type B = A[number]; // "a" | "b" | "c" | "d"
```

### enum 转联合类型

```tsx
enum A {
  a = 1,
  b = 2,
  c = 3,
};

type B = keyof typeof A; // "a" | "b" | "c"
```

## typescript 内置类型

### Partial: 将 T 所有字段变为可选

```tsx
type Partial<T> = { [P in keyof T]?: T[P] | undefined; }
```

### Required: 将 T 所有字段变为必选

```tsx
type Required<T> = { [P in keyof T]-?: T[P]; }
```

### Readonly: 将 T 所有字段变为 readonly, 不可修改

```tsx
type Readonly<T> = { readonly [P in keyof T]: T[P]; }
```

### Pick<T, K> : 从 T 中过滤出属性 K

```tsx
type Pick<T, K extends keyof T> = { [P in K]: T[P]; }
```

### Omit<T, K> : 从 T 中移除属性 K

```tsx
type Omit<T, K extends string | number | symbol> = { [P in Exclude<keyof T, K>]: T[P]; }
```

### Record<K, T> : 标记对象 key [K] value [T] 类型

```tsx
type Record<K extends string | number | symbol, T> = { [P in K]: T; }
```

### Exclude<T, U> : 取 T, U 两者的不相交的属性

```tsx
type Exclude<T, U> = T extends U ? never : T

// 'b' | 'c'

type A = Exclude<'a' | 'b' | 'c' | 'd' , 'b' | 'c' | 'e' >
```

### Extract<T, U> : 取 T, U 两者的交集属性

```tsx
type Extract<T, U> = T extends U ? T : never
```

### NonNullable: 排除 T 的 null | undefined 属性

```tsx
type NonNullable<T> = T extends null | undefined ? never : T
```

### Parameters: 获取 T 函数的所有参数类型

```tsx
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never
```

### ConstructorParameters: 获取 T 类的构造函数的所有参数类型

```tsx
type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never
```

### ReturnType: 获取 T 函数返回值的类型

```tsx
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
```

### InstanceType: 获取 T 类的实例类型

```tsx
type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any
```


