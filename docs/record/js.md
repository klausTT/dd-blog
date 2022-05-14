# JS 进阶

- 记录觉得在平时项目上用得上的方法

## ES6 find 方法

- 在项目有能替换的写法

```js
const data = [
  { id: 1, name: 1 },
  { id: 2, name: 2 },
];
const selectId = 1;
// 原来的写法,会一直遍历下去,找出所有符合条件的项
const filterData = data.filter((item) => item.id === selectId);
const res = filterData[0];
// 可以用find简化
// find 会在找到匹配的项,就不会继续遍历了,可以提高性能
const res = data.find((item) => item.id === selectId);
```

## 关于扁平化数组

```js
const deps = {
  采购部: [1, 2, 3],
  人事部: [5, 8, 12],
  行政部: [5, 14, 79],
  运输部: [3, 64, 105],
};

let member = Object.values(deps).flat(Infinity);
```

> 平时一直在用 Object.keys,忘了对于 values 的使用

### 知识点

- `Object.values()`获取对象所有值保存为数组
- `Array.flat()` 和 `Infinity`
  - 数组扁平化和无穷
  - 使用 `Infinity` 作为 `flat` 的参数，使得无需知道被扁平化的数组的维度

## node 环境的 CommonJs 规范和 ES6 模块化

- CommonJs
  - 是在运行时加载的,导出的对象跟模块中的对象是隔离的,导出是对象的深克隆,导出的方法不会修改到原模块文件.
  - 浏览器缺少`modules`,`exports` 和 `require` ,所以需要用编译后才能在浏览器运行
- ESM
  - 是在编译时加载的,编译时就完成了模块的**引用**,导出是对象的引用,所以导出的方法会修改到原模块文件
  - 大部分浏览器不支持,所以也需要打包编译才能运行
  - 在 `node` 环境使用 `ES6` 模块化规范有两种方式，后缀改为`.mjs` 或者在 `package.json` 里面加 `type: module`

##
