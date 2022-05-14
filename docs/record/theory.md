# 原理库

## new

- 原理
  1. 内部创建一个对象 `this`
  2. `this` 的原型**proto**指向调用者的 `prototype`
  3. 返回值如果不是引用值`(Object/Function/Array/Date/RegExp)`,默认返回 `this` 对象

```js
const new = function(targetFunction, ...args) {
  const this = {};
  this,__proto__ = targetFunction.prototype;
  const res = targetFunction.call(this, ...args);
  return res instanceof Object ? res : this
}

```

## bind

- 原理
  1. 利用闭包保存 `targetFunction` 和 `targetThis` 和 `targetArgument` 返回一个函数
  2. 判断是否是构造函数,利用 `call/apply` 改变 `this` 指向调用原函数
  3. 继承原函数的原型
  4. 重写 `boundFn` 的`name`和`length`属性

> 特性: bind 返回的函数是没有`prototype`的,bind 返回的函数 `new` 出来的原型是有继承原函数的

- 多次调用 `bind` 只有第一个 `bind` 传入的 `this` 指向是有效的,只有参数会合并
  因为多次调用 `bind`,最终执行的还是第一个 `bind` 的 `boundFn`,也就是 `target.apply("第一次调用 bind 的 targetThis", "参数会合并")`

```js
const bind = function (context, ...args) {
  const target = this;
  if (!target.call) {
    throw "not Function";
  }
  const boundFn = function (...boundArgs) {
    // if new, this.__proto__ = boundFn.prototype;
    // boundFn.prototype.__proto__ = target.prototype;
    const list = [...args, ...boundArgs];
    if (this instanceof boundFn) {
      const res = target.apply(this, list);
      return res instanceof Object ? res : this;
    }
    return target.apply(context, list);
  };
  Object.defineProperties(boundFn, {
    name: {
      value: `bound ${target.name}`,
      writable: true,
    },
    length: {
      value: target.length - args.length,
      writable: true,
    },
  });
  if (target.prototype) {
    boundFn.prototype = Object.create(target.prototype);
  }
  return boundFn;
};
```

## call,apply

> 原理: 利用第一个参数对象赋值调用者,然后保存对象调用这个方法的返回值,删除这个对象方法,防止污染对象,最后返回结果

- `context = globalThis`是当传入的参数为`undefined`和`null`时,默认为全局
- 如果`context`是原始值,会转成对应的对象类

```js
const call = function (context = globalThis, ...args) {
  context.fn = this;
  const res = context.fn(...args);
  delete context.fn;
  return res;
};

const apply = function (context = globalThis, args) {
  return this.call(context, ...args);
};
```

## promise

> 原理: 内部定义两个函数控制状态,then 方法根据状态添加回调函数加入微任务队列,最终执行回调函数获取一个异步操作的最终完成 (或失败)及其结果值

> MDN 描述: 一个 Promise 对象代表一个在这个 promise 被创建出来时不一定已知的值。它让您能够把异步操作最终的成功返回值或者失败原因和相应的处理程序关联起来。 这样使得异步方法可以像同步方法那样返回值：异步方法并不会立即返回最终的值，而是会返回一个 promise，以便在未来某个时候把值交给使用者。

```js
const isFunction = (target) => typeof target === "function";
const isPromise = (target) => target instanceof MyPromise;
const isThenable = (target) =>
  (typeof target === "object" && target !== null) || isFunction(target);
const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};
Object.freeze(STATE);

// 对特殊的 result(返回值) 进行特殊处理
const resolvePromise = (promise, result, resolve, reject) => {
  if (promise === result) {
    return new TypeError("can not return itself");
  }
  if (isPromise(result)) {
    return result.then(resolve, reject);
  }
  if (isThenable(result)) {
    try {
      then = result.then;
      return new MyPromise(then.bind(result)).then(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  resolve(result);
};
// 改变状态,异步清空回调函数
const transition = (promise, state, result) => {
  if (promise.state !== STATE.PENDING) return;
  promise.state = state;
  promise.result = result;
  queueMicrotask(() => {
    while (promise.callbacks.length) {
      handleCallback(promise.callbacks.shift(), state, result);
    }
  });
};
// 处理回调函数,在当前 promise 和下一个 promise 之间进行状态传递。
const handleCallback = (callback, state, result) => {
  const { onFulfilled, onRejected, resolve, reject } = callback;
  if (state === STATE.FULFILLED) {
    isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result);
  } else {
    isFunction(onRejected) ? reject(onRejected(result)) : reject(result);
  }
};
const MyPromise = function (excutor) {
  this.state = STATE.PENDING;
  this.result = null;
  this.callbacks = [];

  const onFulfilled = (value) => {
    transition(this, STATE.FULFILLED, value);
  };
  const onRejected = (reason) => {
    transition(this, STATE.REJECTED, reason);
  };
  const resolve = (value) => {
    resolvePromise(this, value, onFulfilled, onRejected);
  };
  const reject = (reason) => {
    onRejected(reason);
  };
  excutor(resolve, reject);
};

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  return new MyPromise((resolve, reject) => {
    const callback = { onFulfilled, onRejected, resolve, reject };
    if (this.state === STATE.PENDING) {
      this.callbacks.push(callback);
    } else {
      queueMicrotask(() => {
        handleCallback(callback, this.state, this.result);
      });
    }
  });
};

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};
MyPromise.resolve = (value) => new MyPromise((res) => res(value));
MyPromise.reject = (reason) => new MyPromise((res, rej) => rej(reason));
```

- 执行步骤:
  1. 对特殊的 result(返回值) 进行特殊处理(调用 reject 直接执行第二步)
  2. 改变状态,异步清空回调函数
  3. 处理回调函数,在当前 promise 和下一个 promise 之间进行状态传递。

## Promise.all

> 原理: 全部成功返回 Promise.resolve([按顺序 value 值]);一个失败返回 Promise.reject(第一个失败的 reason)

```js
MyPromise.all = (promises) => {
  let arr = [];
  let count = 0;
  return new Promise((resolve, reject) => {
    if (typeof promises === "string") {
      resolve(promises.split(""));
      return;
    }
    promises.forEach((item, i) => {
      Promise.resolve(item).then((res) => {
        arr[i] = res;
        count += 1;
        if (count === promises.length) resolve(arr);
      }, reject);
    });
  });
};
```

## 节流防抖

```js
// 防抖函数 在规定的时间内连续调用只会触发最后一次
const debound = function (fn, delay = 300) {
  let timer = null;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout((...args) => {
      fn.apply(this, args);
    }, delay);
  };
};
// 节流函数 在规定时间内调用只会触发第一次
const throttle = (fn, delay = 300) => {
  let previous = 0;
  return function (...args) {
    const now = new Date();
    if (now - previous >= delay) {
      fn.apply(this, args);
      previous = now;
    }
  };
};
// 测试
const input = document.getElementById("test");
const btn = document.getElementById("btn");
const fn = () => {
  console.log("object");
};
const deboundFn = debound(fn);
const throttleFn = throttle(fn);
input.addEventListener("input", deboundFn);
btn.addEventListener("click", throttleFn);
```

## Object.prototype.toString

- 如果调用者是 `undefined` 或者 `null`,返回`"[object Undefined/Null]"`
- 把 `this` 转成相应的构造函数对象
  - 如果有对象上有`[Symbol.toStringTag]`属性,并且是 `string` 类型,返回`"[object toStringTag 值]"`
  - 如果没有 `toStringTag` 属性,则返回`"[object 对应对象类型]"`
  - 对应对象类型`(Arguments/Function/Error/Boolean/Number/String/Date/RegExp/Object)`

## 深拷贝

```js
const mapTag = "[object Map]";
const setTag = "[object Set]";
const arrayTag = "[object Array]";
const objectTag = "[object Object]";
const deepTag = [mapTag, setTag, arrayTag, objectTag];
const getInit = (target) => {
  //   // 使用了原对象的构造方法，所以它可以保留对象原型上的数据
  return new target.constructor();
};
const getType = (target) => Object.prototype.toString.call(target);
// // map相当于一次深拷贝的对象存储空间,当有对象被重复引用的时候,直接返回存储的内容,就可以解决对象循环引用造成的栈内存溢出
const clone = (target, map = new Map()) => {
  // 如果是原始值和函数,直接返回
  if (target === null || typeof target !== "object") {
    return target;
  }
  // 保留对象的原型
  let cloneTarget;
  if (deepTag.includes(getType(target))) {
    cloneTarget = getInit(target);
  }
  // 防止循环引用
  if (map.has(target)) {
    return map.get(target);
  }
  // 存储每一个克隆的对象,后面又循环引用直接返回
  map.set(target, cloneTarget);
  // 克隆Map对象
  if (getType(target) === mapTag) {
    target.forEach((value, key) => {
      cloneTarget.set(key, clone(value, map));
    });
    return cloneTarget;
  }
  // 克隆Set对象
  if (getType(target) === setTag) {
    target.forEach((value, key) => {
      cloneTarget.add(key, clone(value, map));
    });
    return cloneTarget;
  }

  // 克隆数组和object
  Object.keys(target).forEach((key) => {
    cloneTarget[key] = clone(target[key], map);
  });
  return cloneTarget;
};
```

## 深度和广度优先算法

```js
// 深度优先算法（Depth first traversal，DFT）
// 非递归
const depthTraversal = (node) => {
  const queue = [];
  const list = [];
  list.push(node);
  while (list.length) {
    const theNode = list.pop();
    queue.push(theNode.name);
    if (theNode.children) {
      for (let i = theNode.children.length; i > 0; i--) {
        list.push(theNode.children[i - 1]);
      }
    }
  }
  return queue;
};
// 递归
const walk = (node, queue) => {
  queue.push(node.name);
  if (node.children) {
    node.children.forEach((child) => walk(child, queue));
  }
};
const depthTraversal_recursion = (node) => {
  const queue = [];
  walk(node, queue);
  return queue;
};
// 广度优先算法（Breadth first traversal，BFT）
const breadthTraversal = (node) => {
  const queue = [];
  const list = [];
  list.push(node);
  while (list.length) {
    const theNode = list.shift();
    queue.push(theNode.name);
    if (theNode.children) {
      theNode.children.forEach((child) => list.push(child));
    }
  }
  return queue;
};
// 测试
const data = {
  name: 1,
  children: [
    {
      name: 2,
      children: [
        {
          name: 3,
        },
        {
          name: 4,
        },
      ],
    },
    {
      name: 5,
      children: [
        {
          name: 6,
        },
      ],
    },
  ],
};
console.log(depthTraversal_recursion(data)); // [1,2,3,4,5,6]
console.log(depthTraversal(data)); // [1,2,3,4,5,6]
console.log(breadthTraversal(data)); // [1,2,5,3,4,6]
```
