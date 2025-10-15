---
title: OpenGL-learn-02-着色器和光照
date: 2022-01-19 15:46:23
tags: [OpenGL]
categories: [OpenGL]
mathjax: true
---

正如上次提到的，Qt提供的OpenGL功能逻辑很有特点，为大多数OpenGL API构造了封装类，这同时为我们将代码从原生OpenGL迁移到Qt带来了一定的困难。本文主要介绍一下我用到的Qt-OpenGL在着色器和光照渲染方面的功能\~

<!--more-->

首先抛出一个链接：Learn OpenGL with Qt——必备知识（易出错导致绘图失败的地方）：https://blog.csdn.net/qq_40946921/article/details/108041536?spm=1001.2014.3001.5501

这位博主[@Italink](https://blog.csdn.net/qq_40946921)还有其他的几篇文章，介绍了Qt-OpenGL的基本用法，也很有用。当我面对DDL而焦头烂额之时，他的分享给予了我莫大的帮助！特此感谢\~ |ヽ(*￣▽￣*)ノミ|Ю

### 1. 上下文(OpenGL Context)

Qt-OpenGL需要一个上下文来管理VAO、VBO等数据对象。如果所有的操作都在`paintGL()`函数中完成，系统实际上会默认分配一个上下文，那么就不需要手工设置上下文了。但是如果在`paintGL()`之外调用了绘图函数，如`glDrawArrays()`和`glDrawElements()`，就需要通过`QOpenGLFunctions`对象来调用这些函数，即`QOpenGLFunctions`对象是与上下文紧密相联的。

此外，如果要除了`paintGL()`外部函数中定义VAO对象，一定要在前后添加定**创建上下文**的逻辑语句块，如：

```cpp
{
    //...
    w->makeCurrent();
    VAO = new QOpenGLVertexArrayObject(w);
    VAO->create();
    VAO->bind();
    VAO->release();
    w->doneCurrent();
}
```

其中`w`是`QOpenGLWidget`类型的变量指针。如果不这样做，就相当于在OpenGL上下文之外创建了VAO。后续绑定VAO时，系统就找不到VAO以及与其绑定的buffer对象了。

为了让我们自定义的`MyOpenGLWidget`能够同兼顾`QOpenGLWidget`和上下文，我这里进行了一个多继承：

```cpp
class MyOpenGLWidget : public QOpenGLWidget, public QOpenGLExtraFunctions
    ...
```

后面如果要传递上下文，就只需要传递`MyOpenGLWidget`对象指针即可。

### 2. VAO与VBO, EBO

渲染上下文保存了VAO的id，而VAO保存了VBO和EBO的id。在将VAO与VBO、EBO绑定时，一般的顺序是：

```cpp
VAO->bind();
VBO->create();
VBO->bind();
// Prepare data
```

当然良好的代码习惯是在分配内存后将这两个对象`release`掉，就像原生OpenGL中所做的那样。一个比较直接（但并不正确）的做法如下：

```cpp
//...
VBO->release();
VAO->release();
```

这种想法很正常，按照先入后出的原则。但是在这里，如果先释放了VBO，就会导致VAO绑定的VBO缓冲区数据丢失。所以VBO应该在**VAO释放之后**再释放，或者根本就不释放。

### 3. 着色器

#### (1) 创建和初始化

Qt-OpenGL中定义了`QOpenGLShaderProgram`对象。一般来说，创建着色器的流程如下：

```cpp
QOpenGLShaderProgram *shader = new QOpenGLShaderProgram(parent);
shader->addShaderFromSourceFile(QOpenGLShader::Vertex, "...");
shader->addShaderFromSourceFile(QOpenGLShader::Fragment, "...");
if(shader->link()){
    printf("Shader link success\n");
}else{
    printf("Shader link failure\n");
}
```

其中的`addShaderFromSourceFile()`方法还可以替换成`addShaderFromSourceCode()`，只不过着色器程序需要写成字符串。

为了能够更好地使用着色器类，我对`QOpenGLShaderProgram`进行了继承，定义了`Shader`类，其中只包含了一个函数上下文指针。

#### (2) Mesh+Shader

在此次大程序设计中，我将Shader作为Mesh的成员变量来使用，这样渲染模型时就直接调用自己的着色器。（不过更好的做法也许是将二者分开，但是我没有这样做QwQ）这样设计的考虑主是为了方便在准备好模型的顶点、面片索引和边框索引后，直接利用着色器变量绑定VAO、VBO和EBO.

在Qt-OpenGL中，顶点属性数组(VAO)是与着色器绑定的。(合理推测，原生OpenGL也是这样的，只不过没有在代码上写得那么清楚) 将VAO与其VBO绑定的基本代码如下：

```cpp
context->makeCurrent();

if(VAO){
    VAO->destroy();
    delete VAO;
}
VAO = new QOpenGLVertexArrayObject(context);
QOpenGLVertexArrayObject::Binder{VAO};

if(VBO){
    VBO->destroy();
    delete VBO;
}
VBO = new QOpenGLBuffer(QOpenGLBuffer::VertexBuffer);
VBO->create();
VBO->bind();
VBO->allocate(&vertices[0], vertices.size() * sizeof(Vertex));
shader_vertex->setAttributeBuffer(0, GL_FLOAT, 0, 3, sizeof(Vertex));
shader_vertex->enableAttributeArray(0);
shader_vertex->setAttributeBuffer(0, GL_FLOAT, sizeof(glm::vec3), 3, sizeof(Vertex));
shader_vertex->enableAttributeArray(1);

if(func->glGetError() != GL_NO_ERROR){
    QMessageBox::warning(context, "Warning", "Error in shader face");
}

context->doneCurrent();
```

可以看到，设置VBO buffer参数的函数是通过shader调用的。

此外，上面有一个非常特别的类：`QOpenGLVerteArrayObject::Binder{VAO}`. Qt帮助文档这样介绍：

>The QOpenGLVertexArrayObject::Binder class is a convenience class to help with the binding and releasing of OpenGL Vertex Array Objects.
>
>...
>
>This class implements the RAII principle which helps to ensure behavior in complex code or in the presence of exceptions.
>The constructor of this class accepts a QOpenGLVertexArrayObject (VAO) as an argument and attempts to bind the VAO, calling QOpenGLVertexArrayObject::create() if necessary. The destructor of this class calls QOpenGLVertexArrayObject::release() which unbinds the VAO.
>If needed the VAO can be temporarily unbound with the release() function and bound once more with rebind().

这段话说得很清楚了。这个类创建后，会自动调用`create()`和`bind()`方法；析构时会自动`release()`。由于在函数中我们只需要绑定一次VAO，这就意味着在创建`Binder`类后就可以撒手不管了\~

而如果要绘图，在调用绘图函数之前还需要先绑定VAO，可以很方便地通过`Binder`类绑定：

```cpp
void DrawVertex()
{
    QOpenGLVertexArrayObject::Binder{VAO};
    func->glDrawArrays(GL_POINTS, 0, vertices.size());
}
```

### 4. 光照

漫反射、镜面反射以及与其相关的物体材质属性之类的理论，说实话我是一知半解——大概明白理论，却说不清也没法闭眼写代码。这里简要讨论几点好了。

#### (1) 法向量

反射时需要提供物体表面的法向量，光线从某个角度射向平面后就会依据反射定律发生反射。这个原理还好理解。问题主要出在模型和代码数据的转换上。

我们知道，PLY, OBJ等模型都会给出顶点和面的法向量，并且面的法向量是法向量的索引。在OBJ模型中，有时会出现这样的情况：有顶点，有法向量，也有面，面引用了法向量，但是没有直接给出顶点的法向量。这时就需要手工计算一下。经查阅资料得知，顶点法向量等于包含了该顶点的面的法向量之和：
$$
Normal_{vertex}(v)=normalize(\sum_{v\in f}(f.normal))
$$
在此次大程序中由我VCGLib库提供的输入/输出功能处理，可以直接得到顶点的法向量，省了很多麻烦QwQ.

#### (2) 光照着色器

本次大程中我没有用到环境光照，原因是在使用了对面片叠加了环境光照渲染后，整个模型就都变成了光照的颜色，如果用的是白色光照就会及其刺眼QAQ. 在短暂的实验后，我发现如果只需要为物体提供光照是不需要额外添加着色器的，所以果断抛弃了环境光照，后续也没有进行更多的尝试。依稀记得当时的想法是将环境光照着色器作为`MyOpenGLWidget`的成员，在需要的时候调用。



----

### 附录：着色器程序代码

着色器程序上我也没少花心思，索性把我用到的代码放上来。代码挺straight-forward的，不用什么说明。

#### Vertex

```glsl
#version 330
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;

uniform mat4 view;
uniform mat4 projection;
uniform mat4 model;

out vec3 fragPos;
out vec3 Normal;

void main()
{
  gl_Position = projection * view * model * vec4(aPos, 1.0f);
  fragPos = vec3(model * vec4(aPos, 1.0f));
  Normal = mat3(transpose(inverse(model))) * aNormal;
  gl_PointSize = 3.0f;
}
```

#### Fragment

Vertex:

```glsl
#version 330
out vec4 fragColor;

void main()
{
  fragColor = vec4(0.0f, 0.5f, 0.0f, 1.0f); // 顶点颜色为绿色
}
```

Edge:

```glsl
#version 330
out vec4 fragColor;
void main()
{
  fragColor = vec4(0.5f, 0.5f, 0.0f, 1.0f); // 面片颜色为黄色
}
```

Face:

```glsl
#version 330
out vec4 fragColor;

uniform vec3 objectColor;
uniform vec3 lightColor;
uniform vec3 lightPos;
uniform vec3 viewPos;
in vec3 fragPos;
in vec3 Normal;

void main()
{
  // fragColor = vec4(1.0f);
  float ambientStrength = 0.1f;
  vec3 ambient = ambientStrength * lightColor;
  vec3 norm = normalize(Normal);
  vec3 lightDir = normalize(lightPos - fragPos);
  float diff = max(dot(norm, lightDir), 0.0f);
  vec3 diffuse = diff * lightColor;

  float specularStrength = 0.5f;
  vec3 viewDir = normalize(viewPos - fragPos);
  vec3 reflectDir = reflect(-lightDir, norm);
  float spec = pow(max(dot(viewDir, reflectDir), 0.0f), 32);
  vec3 specular = specularStrength * spec * lightColor;

  vec3 result = (ambient + diffuse + specular) * objectColor;
  fragColor = vec4(result, 1.0f);
}
```



PS: 希望Qt的OpenGL示例代码能更加完善:pray:!
