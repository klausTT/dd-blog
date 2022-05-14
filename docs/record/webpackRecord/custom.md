# webpack 核心知识

## plugin

插件是由「具有 apply 方法的 prototype 对象」所实例化出来的，这个 apply 方法在安装插件时，会被 webpack compiler 调用一次。apply 方法可以接收一个 webpack compiler 对象的引用，从而可以在回调函数中访问到 compiler 对象

```js
// entryOption : 在 webpack 选项中的 entry 配置项 处理过之后，执行插件。
// afterPlugins : 设置完初始插件之后，执行插件。
// compilation : 编译创建之后，生成文件之前，执行插件。。
// emit : 生成资源到 output 目录之前。
// done : 编译完成。
const HtmlWebpackPlugin = require("html-webpack-plugin");
class SetScriptTimestampPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const { webpack } = compiler;
    const pluginName = SetScriptTimestampPlugin.name;
    compiler.hooks.compilation.tap(pluginName, (compilation, callback) => {
      // 插件逻辑 调用compilation提供的plugin方法
      HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync(
        pluginName,
        (htmlPluginData, callback) => {
          // 读取并修改 script 上 src 列表
          // 给files的文件加上时间戳
          // console.log(htmlPluginData);
          const assetsJs = htmlPluginData.assets.js;
          const date = new Date().getTime();
          this.options.files.forEach((file) => {
            const index = assetsJs.findIndex((item) => item.includes(file));
            if (index === -1) return;
            assetsJs[index] = `${assetsJs[index]}?${date}`;
          });
          callback(null, htmlPluginData);
        }
      );
    });
  }
}
module.exports = SetScriptTimestampPlugin;

// 使用
// webpack.config.js
// plugins: [
//     new HtmlWebpackPlugin({
//       title: "开发环境",
//       template: "assets/index.html",
//     }),
//     new SetScriptTimestampPlugin({
//       files: ["index", "print"],
//     }),
//   ],
```

- 编写 Plugin 的思路：
  - Webpack 在运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在特定的阶段钩入想要添加的自定义功能。Webpack 的 Tapable 事件流机制保证了插件的有序性，使得整个系统扩展性良好。
  - compiler 暴露了和 Webpack 整个生命周期相关的钩子
  - compilation 暴露了与模块和依赖有关的粒度更小的事件钩子
  - 插件需要在其原型上绑定 apply 方法，才能访问 compiler 实例
  - 传给每个插件的 compiler 和 compilation 对象都是同一个引用，若在一个插件中修改了它们身上的属性，会影响后面的插件
  - 找出合适的事件点去完成想要的功能
    - emit 事件发生时，可以读取到最终输出的资源、代码块、模块及其依赖，并进行修改(emit 事件是修改 Webpack 输出资源的最后时机)
    - watch-run 当依赖的文件发生变化时会触发
  - 异步的事件需要在插件处理完任务时调用回调函数通知 Webpack 进入下一个流程，不然会卡住

## Webpack 的 HMR 热更新原理
