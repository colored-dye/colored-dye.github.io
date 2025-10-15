---
title: "Hugo代码块复制功能"
date: 2022-01-27T15:01:41+08:00
draft: false
tags: ["Hugo"]
categories: ["Hugo"]
---

今天刚刚把博客从Hexo框架迁移到Hugo啦！期间遇到了一些问题，大多数都比较顺利地解决了。稍微麻烦一点的就是为代码块添加复制功能。

<!--more-->

代码块复制采取的方案来自这里：[Hugo代码片段添加复制按钮，同时避免复制行号](https://tsuhao.tech/post/hugo-how-add-linenumber/). 在此为博主致以感谢！

我使用的Even主题并没有提供代码块复制的功能选项。因此要添加该功能还需要手工编写`.js`脚本和`.css`样式文件。

## `add-copy-btn.js`:

```js
document.querySelectorAll('pre > code').forEach(function (codeBlock) {
  var flag = true;
  if (codeBlock.children[0].className == 'lnt') {
    flag = false;
  }
  var button = document.createElement('button');
  button.className = 'highlight-copy-btn';
  button.type = 'button';
  button.innerText = 'Copy';

  var pre = codeBlock.parentNode;
  if (flag) {
    // if (pre.parentNode.classList.contains('highlight')) {
    // var highlight = pre.parentNode;
    var highlight = pre.parentNode;
    while (highlight.className != 'highlight') {
      highlight = highlight.parentNode;
    }

    highlight.appendChild(button);
  }
});
function addCopyButtons(clipboard) {
  document.querySelectorAll('pre > code').forEach(function (codeBlock) {
    var flag = true;
    if (codeBlock.children[0].className == 'lnt') {
      flag = false;
    }
    var button = document.createElement('button');
    button.className = 'highlight-copy-btn';
    button.type = 'button';
    button.innerText = 'Copy';

    button.addEventListener('click', function () {
      clipboard.writeText(codeBlock.innerText).then(function () {
        /* Chrome doesn't seem to blur automatically,
           leaving the button in a focused state. */
        button.blur();

        button.innerText = 'Copied!';

        setTimeout(function () {
          button.innerText = 'Copy';
        }, 2000);
      }, function (error) {
        button.innerText = 'Error';
      });
    });

    if (flag) {
      var pre = codeBlock.parentNode;
      var highlight = pre.parentNode;
      while (highlight.className != 'highlight') {
        highlight = highlight.parentNode;
      }
      highlight.appendChild(button);
    }
  });
}
if (navigator && navigator.clipboard) {
  addCopyButtons(navigator.clipboard);
} else {
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/clipboard-polyfill/2.7.0/clipboard-polyfill.promise.js';
  script.integrity = 'sha256-waClS2re9NUbXRsryKoof+F9qc1gjjIhc2eT7ZbIv94=';
  script.crossOrigin = 'anonymous';
  script.onload = function () {
    addCopyButtons(clipboard);
  };

  document.body.appendChild(script);
}
```

## `add-copy-btn.css`:

```css
.highlight {
    position: relative;
}

.highlight pre {
    padding-right: 10px;
    background-color:#f8f8f8 !important;
}

.highlight td:first-child {
    user-select: none;
}

.highlight-copy-btn {
    position: absolute;
    top: 7px;
    right: 7px;
    border: 0;
    border-radius: 4px;
    padding: 1px;
    font-size: 0.8em;
    line-height: 1.8;
    color: #fff;
    background-color: #777;
    min-width: 55px;
    text-align: center;
}

.highlight-copy-btn:hover {
    background-color: #666;
}
```

为了添加该功能，需要分别将`add-copy-btn.css`和`add-copy-btn.js`文件放入`blog/themes/even/static/css`和`blog/themes/even/static/js`文件夹下。

## `config.toml`

此外，还需要在`config.toml`中的`[]`字段明文说明添加使用的CSS和JS名：

```toml
#...
[params]
  customCSS = ['add-copy-btn.css']
  customJS = ['add-copy-btn.js']
#...
```

之后重新部署就好啦\~

----

(Update: 2022-02-07)

`add-copy-btn.js`需要一些说明。最开始实现copy功能采用的是`document.execCommand('copy')`。不知道为什么，在Linux的Firefox浏览器上按下按钮并不能复制代码。

在这篇博文[How to Add Copy to Clipboard Buttons to Code Blocks in Hugo](https://www.dannyguo.com/blog/how-to-add-copy-to-clipboard-buttons-to-code-blocks-in-hugo)的帮助下，我决定使用Clipboard API. 当该API不能使用时，下载`polyfill`脚本，以作为后备方案。

小小总结：

学习了从未学习过的`javascript`和相当于没学过的`css`，并根据需求修改模板代码！
