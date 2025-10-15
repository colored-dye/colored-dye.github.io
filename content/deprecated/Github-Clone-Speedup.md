---
title: Github Clone加速
date: 2021-03-26 22:56:54
tags: ["Git"]
categories: ["Git"]
---

有从Github Git Clone一些项目的需求，比如说克隆`riscv-toolchain`的Repository，但是6G多的仓库下起来实在是太慢了。在网上找到一些加速Git Clone的方法，供日后参考。个人感觉好用的顺序大致是从前向后递减吧。

<!--more-->

1.  URL修改

    1.  加后缀

        将`github.com`改为`github.com.cnpmjs.org`. 这个似乎是和`npm`相关的，提供私有的npm registry.

    2.  镜像网站

        `https://hub.fastgit.org`.

2.  利用码云`Gitee`，根据URL导入Github仓库。

3.  修改`hosts`文件（hhh其实不太管用）

4.  Chrome插件

5.  使用代理