---
title: OpenGL学习-01-坐标变换
date: 2021-11-29 23:21:31
tags: [OpenGL]
categories: [OpenGL]
mathjax: true
---

最近在做OOP的大作业，要求基于OpenGL图形库、在Qt或MFC框架上实现一个与Meshlab类似、但可以阉割“亿点点”功能的3D模型查看和编辑软件。我本来是信心满满地选择了Qt，但是由于种种原因，在对MFC浅尝辄止后，最终还是更加坚定地选择了Qt一边，同时感叹Qt真是一款伟大的框架(虽然也有一些小问题)。在开始工程的一周里，踩了好多坑，在这里记录一下好啦\~QwQ 既是给自己作备忘，也给后来人提供一些微薄的帮助吧。

<!--more-->

#### 0. 热身

既然要做3D模型显示，那么就要不得不考虑到这些问题：

-   模型的基本要素都有哪些？模型文件的组织是怎样的？
-   如何才能在2D的界面上显示3D图形？
-   怎样实现3D图形在空间上的操控？

上面这些问题较为浅显，当然，还会有“怎样把Qt和OpenGL结合在一起”这样的问题。上面的这些问题，我想要稍微深入一些讨论，所以会分多篇文章发出来(挖坑警告)。我可以先回答一下最后这个小问题。

Qt为OpenGL提供了一个内部的封装，`QOpenGLWidget`，它是`QWidget`的派生类。为了能够利用到这个类，用户需要在其基础上再做一个继承，自己定义一个派生类。如果要用到OpenGL函数，还要包含`QOpenGLFunctions`。与此同时`QOpenGLWidget`有三个属性为`protected`的虚函数是要求用户必须在自己的派生类上实现的：`initializeGL`, `resizeGL`和`paintGL`，功能顾名思义。一般来说，需要在`initializeGL`中配置好上下文、功能开关、着色器等，在`paintGL`中绘制图形，在`resizeGL`中做好窗口大小调整。

#### 1. 坐标体系

我们可以将自己创建的派生类，不妨命名为`MyOpenGLWidget`，嵌入为Qt工程中的一个普通Widget，再将这个widget提升为`MyOpenGLWidget`。好了，我们刚刚创建的这个小widget就相当于一个显示窗口\~

![](https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/opengl-01-01.png)

这里我直接将`centralWidget`设置为了`MyOpenGLWidget`。

一般来说，整个显示空间的坐标原点对应的就是显示窗口的中心点，在这里就是我们的`MyOpenGLWidget`的中心点。我们可以想象面前有一个小房间，我们只能通过这个小窗口看到里面的物体。我们实际看到的平面图形，其实就是三维物体相对于我们所处的视野平面的正投影。

在OpenGL的世界里，我们可以认为有这样三个主体：世界坐标轴(XYZ)，物体，以及观察者。所谓“观察者”更专业的说法是“摄像机(camera)”。下面分别对坐标轴和摄像机做一下说明。

OpenGL的坐标系是右手坐标系。垂直屏幕向外的方向是Z轴正方向，指向屏幕右侧是X轴正方向，指向屏幕上方是Y轴正方向。一般在不做任何设置的情况下，摄像机位于Z轴>0的某个位置，看向原点。

摄像机有三个属性：位置、视野正方向和上方方向。通过调整这三个参数，可以改变窗口的显示效果。其实这三个向量构建了以摄像机自身为原点的一个坐标系。

#### 2. 模型旋转

模型旋转的功能实现无非有两种思路：旋转模型本身，和旋转摄像机。我一开始的思路就是旋转摄像机。这样做带来的好处是，当我们载入多个模型时，不用对每一个shader都进行旋转矩阵的计算，只需要变换摄像机的位置，并且将摄像机的朝向固定在一点、令摄像机到固定点的距离恒定即可。但是这方面的资料较少，并且在初期实验时我对坐标体系没什么理解，所以在NG数次后，走上了旋转模型的道路。

在OpenGL的世界里，旋转是通过将位置向量左乘一个旋转矩阵实现的。位置向量是一个4x1的向量：
$$
\begin{bmatrix}
x \newline y \newline z \newline 1.0
\end{bmatrix}
$$
至于最下面的哪个1.0是做什么的，我也不清楚(笑)，先不去管它，只要把它当作是一种convention就好辣\~ 类似地，位移矩阵是一个4x4的矩阵，它是在一个单位矩阵的基础上略加修改得来的：
$$
\begin{bmatrix}
1 & 0 & 0 & T_x \newline
0 & 1 & 0 & T_y \newline
0 & 0 & 1 & T_z \newline
0 & 0 & 0 & 1
\end{bmatrix}
$$
可以看到，对角线上是1，而最后一列的前三个数构成了$(T_x, T_y, T_z)$的位移向量。想象一下，$translate \times pos$，我们可以得到这样的向量：$(x+T_x, y+T_y, z+T_z, 1.0)^T$，恰好达到了位移的目的。

缩放矩阵，依然是在单位矩阵的基础上做一些变换：
$$
\begin{bmatrix}
S_x & 0 & 0 & 0 \newline
0 & S_y & 0 & 0 \newline
0 & 0 & S_z & 0\newline
0 & 0 & 0 & 1
\end{bmatrix}
$$
类似地，$scale \times pos = (xS_x, yS_y, zS_z, 1.0)^T$. 一般来说如果要保持原有图形的形状不变，缩放的三个分量都是一样的；反之，不同的分量比例可以实现图形的拉伸。

最后，就是旋转矩阵！旋转矩阵稍微不那么直观。我们先从二维开始。将一个向量$v=(x, y)^T$逆时针旋转$\theta$，我们需要在$v$的左边乘上这样一个矩阵：
$$
\begin{bmatrix}
cos\theta & -sin\theta \newline
sin\theta & cos\theta
\end{bmatrix}
$$
其实这是可以推导的。如果我们将这个公式拓展到三维，那么这个旋转矩阵就会长这个样子：
$$
rotate = 
\begin{bmatrix}
cos\theta & -sin\theta & 0 & 0 \newline
sin\theta & cos\theta & 0 & 0 \newline
0 & 0 & 1 & 0 \newline
0 & 0 & 0 & 1
\end{bmatrix}
$$
这样看来，上面的二维旋转就可以看作是将一个点绕着z轴旋转。

介绍完平移、缩放、旋转这三种矩阵坐标变换之后，就可以实现比较全面的坐标变换了\~ 所谓坐标变换，就是将平移矩阵、缩放矩阵和旋转矩阵与坐标向量左乘，但是不同的相乘顺序会达到不同的效果。

先讨论平移和旋转的先后问题：先平移后旋转会导致旋转中心改变，反之旋转中心会保持在世界原点。即：

-   $translation \times rotation \times position$旋转中心改变.
-   $rotation \times translation \times position$旋转中心不变.

再来看看平移和缩放的顺序问题。一般来说都是先平移后缩放，否则平移的距离也会乘上缩放的倍数。

至于缩放与旋转的先后，应该问题不大，我还没有试过QwQ.

目前本项目中我用到的shader program如下：

```glsl
#version 330
layout(location = 0) in vec3 posVertex;

uniform mat4 view;
uniform mat4 projection;
uniform mat4 rotation;
uniform mat4 translation;
uniform mat4 scale;

void main()
{
  gl_Position = projection * view * rotation * scale * translation * vec4(posVertex, 1.0f);
  gl_PointSize = 3.0f;
}
```

我这里所做的是先平移、再缩放、再旋转，从而达到平移模型位置而旋转中心不变的效果。最终的效果图如下：

![](https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/opengl-01-02.gif)

##### 遇到的奇怪问题\*：

使用`QMatrix4x4`的`translate`、`rotate`方法时，功能是正常的。

但是使用glm库的rotate函数时，旋转矩阵会变得过于灵敏，需要将旋转角缩小到1/50才能基本正常。最严重的是，在交叉进行互相垂直的方向旋转时，会发生闪烁，并且会突然丧失所有模型。

目前打算先用着`QMatrix`，并注意调试一下`glm`库的相应功能。总感觉`glm`才是OpenGL正统(笑)，争取最后还是用上`glm`库。
