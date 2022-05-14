//　数字精度问题　转字符串
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
console.log(depthTraversal_recursion(data));
console.log(depthTraversal(data));
console.log(breadthTraversal(data));
