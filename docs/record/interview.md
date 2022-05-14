# 前端面试

## JS 核心知识点

### promise

```js
// mt 表示 microTask 微任务
Promise.resolve()
  .then(() => {
    // mt1
    console.log(0);
    return Promise.resolve(4); // mt2 返回值为promise的需要多执行一次微任务
  })
  .then((res) => {
    // mt3
    console.log(res);
  });

Promise.resolve()
  .then(() => {
    // mt1
    console.log(1);
  })
  .then(() => {
    //mt2
    console.log(2);
  })
  .then(() => {
    // mt3
    console.log(3);
  })
  .then(() => {
    //mt4
    console.log(5);
  })
  .then(() => {
    // mt5
    console.log(6);
  });
```

- promise 输出 `0 1 2 3 4 5 6`
- 自己实现的 promise 输出 `0 1 2 4 3 5 6`
- 原因: Js 引擎为了让 microtask 尽快的输出，做了一些优化，连续的多个 then(3 个)如果没有 reject 或者 resolve 会交替执行 then 而不至于让一个堵太久完成用户无响应，不单单 v8 这样其他引擎也是这样，因为其实 promuse 内部状态已经结束了。这块在 v8 源码里有完整的体现

### Javascript 数字精度丢失的问题
- 计算机存储双精度浮点数需要先把十进制数转换为二进制的科学记数法的形式，然后计算机以自己的规则{符号位+(指数位+指数偏移量的二进制)+小数部分}存储二进制的科学记数法

因为存储时有位数限制（64位），并且某些十进制的浮点数在转换为二进制数时会出现无限循环，会造成二进制的舍入操作(0舍1入)，当再转换为十进制时就造成了计算误差
```js
function strip(num, precision = 12) {
  return +parseFloat(num.toPrecision(precision));
}
/**
 * 精确加法
 */
function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length;
  const num2Digits = (num2.toString().split('.')[1] || '').length;
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits));
  return (num1 * baseNum + num2 * baseNum) / baseNum;
}
```