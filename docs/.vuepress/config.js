module.exports = {
  title: "dd-page",
  description: "dd的个人网站",
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    ["link", { rel: "icon", href: "/leslie1.png" }], // 增加一个自定义的 favicon(网页标签的图标)
  ],
  base: "/dd-page/", // 这是部署到github相关的配置 下面会讲
  markdown: {
    lineNumbers: true, // 代码块显示行号
  },
  themeConfig: {
    nav: [
      { text: "知识储备", link: "/record/" }, // 内部链接 以docs为根目录
      { text: "前端算法", link: "/algorithm/" }, // 内部链接 以docs为根目录
      { text: "博客", link: "http://obkoro1.com/" }, // 外部链接
      // 下拉列表
      {
        text: "GitHub",
        items: [
          { text: "GitHub地址", link: "https://github.com/OBKoro1" },
          {
            text: "算法仓库",
            link: "https://github.com/OBKoro1/Brush_algorithm",
          },
        ],
      },
    ],
    sidebar: {
      "/algorithm/": [
        {
          title: "Group 1", // 必要的
          path: "/algorithm/", // 可选的, 标题的跳转链接，应为绝对路径且必须存在
          collapsable: false, // 可选的, 默认值是 true,
          sidebarDepth: 1, // 可选的, 默认值是 1
          children: [
            "/algorithm/simple/test", // 以docs为根目录来查找文件
          ],
        },
      ],
      "/record/": [
        {
          title: "前端基础", // 必要的
          path: "/record/", // 可选的, 标题的跳转链接，应为绝对路径且必须存在
          collapsable: false, // 可选的, 默认值是 true,
          sidebarDepth: 1, // 可选的, 默认值是 1
          children: ["/record/js", "/record/theory", "/record/interview"],
        },
        {
          title: "webpack", // 必要的
          path: "/record/webpackRecord/", // 可选的, 标题的跳转链接，应为绝对路径且必须存在
          collapsable: false, // 可选的, 默认值是 true,
          sidebarDepth: 1, // 可选的, 默认值是 1
          children: ["/record/webpackRecord/custom"],
        },
      ],
    },
  },
};
