---
title: RIME输入法配置
date: 2021-10-27 22:36:45
tags: [Tools]
categories: [Tools]
---

今天在新装的Manjaro Plasma KDE上安装了大名鼎鼎的RIME输入法\~ 还算是成功，但是捣鼓了好一会儿QAQ 问题主要在配置文件上.

<!--more-->

#### 1. 安装工具

这里采用的是`fcitx5 + rime`的组合\~

```bash
sudo pacman -S fcitx5 fcitx5-qt fcitx5-gtk fcitx5-configtool fcitx5-rime
```

需要重启\~

#### 2. 设置启动

在`~/.xprofile`文件中添加以下内容：

```bash
export GTK_IM_MODULE=fcitx5
export QT_IM_MODEUL=fcitx5
export XMODIFIERS="@im=fcitx5"
```

在Manjaro KDE中可以直接在Settings菜单中添加`fcitx5`的启动项，或者也可以在`~/.xprofile`中插入: `fcitx5 &`.

#### 3. 配置文件

这里直接用了 @闲耘 的配置（感谢！），我为了适配加了一些的改动\~

https://hub.fastgit.org/colored-dye/rime



而这里是其他用户的使用心得：

https://jdhao.github.io/2019/02/18/rime_configuration_intro/

