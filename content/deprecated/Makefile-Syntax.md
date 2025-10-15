---
title: Makefile语法
date: 2021-07-11 18:04:36
tags: [Makefile]
categories: [Makefile]
---

Makefile在C/C++工程中是必不可少的管理工具\~ 最初有编写Makefile的需求还是做操作系统lab的时候呢q(≧▽≦q) 后来在Linux相关的工程和IDE的工程管理中也会接触到很多Makefile，但是后者的可读性往往很差（那是后话了）

<!--more-->

#### Makefile中使用变量

```makefile
objects = main.o kbd.o command.o display.o \
    insert.o search.o files.o utils.o

edit : $(objects)
    cc -o edit $(objects)
main.o : main.c defs.h
    cc -c main.c
kbd.o : kbd.c defs.h command.h
    cc -c kbd.c
command.o : command.c defs.h command.h
    cc -c command.c
display.o : display.c defs.h buffer.h
    cc -c display.c
insert.o : insert.c defs.h buffer.h
    cc -c insert.c
search.o : search.c defs.h buffer.h
    cc -c search.c
files.o : files.c defs.h buffer.h command.h
    cc -c files.c
utils.o : utils.c defs.h
    cc -c utils.c
clean :
    rm edit $(objects)
```

#### 让make自动推导

只要make看到一个`.o`文件，就会自动把对应的`.c`文件加载到依赖关系中。

```makefile
objects = main.o kbd.o command.o display.o \
    insert.o search.o files.o utils.o

edit : $(objects)
    cc -o edit $(objects)

main.o : defs.h
kbd.o : defs.h command.h
command.o : defs.h command.h
display.o : defs.h buffer.h
insert.o : defs.h buffer.h
search.o : defs.h buffer.h
files.o : defs.h buffer.h command.h
utils.o : defs.h

.PHONY : clean
clean :
    rm edit $(objects)
```

#### 关于清空目标文件的规则

```makefile
.PHONY: clean
clean:
	-rm edit $(objects)
```

`rm`命令前加了`-`的意思是，忽略问题，继续运行。

#### 引用其他的makefile

```makefile
include foo.make *.mk $(bar)
```

如果在当前目录下找不到，make还会再下面几个目录里找：

1.  如果make执行时，有`-I`或`--include-dir`参数，那么make就会在这个参数所指定的目录下去寻找。
2.  如果目录`<prefix>/include`（一般是：`/usr/local/bin`或`/usr/include`）存在的话，make也会去找。

#### 文件搜寻：`VPATH`

如果没有指明这个变量，make只会再当前目录寻找。

一般可以定义为：`VPATH = src:../headers`，用冒号分隔。

还可以用小写vpath设置，需要使用`%`字符，意思时匹配0或若干字符。

如：`vpath %.h ../headers`.

#### 多目标

自动化变量`$@`，表示目前规则中所有的目标的集合。

```makefile
bigoutput littleoutput: text.g
	generate text.g -$(subst output,,$@) > $@
```

`subst`为makefile的一个函数，表示替换字符串。

#### 静态模式

一个例子：

```makefile
objects = foo.o bar.o
all: $(objects)
$(objects): %.o: %.c
	$(CC) -c $(CFLAGS) $< -o $@
```

`$<`表示第一个依赖文件，`$@`表示目标集。

#### 自动生成依赖

```makefile
cc -M main.c
```

如果使用GNU的C/C++编译器，要用`-MM`参数，否则`-M`参数会把一些标准库的头文件也包含进来。

#### 变量赋值

`+=`: 追加：`objects += another.o`.

如果变量之前没有定义过，`+=`会自动变成`=`. 如果前面有变量定义，`+=`会继承前一次的赋值符。

所以分别以`:=`和`=`定义的变量，运用`+=`时，结果可能会有所不同。

对于`=`，变量的值会是最终值：

```makefile
x = foo
y = $(x) bar
x = xyz
```

那么y会是`xyz bar`，而不是`foo bar`.

而`:=`表示变量的值取决于其位置：

```makefile
x := foo
y := $(x) bar
x := xyz
```

在这里，y的值会是`foo bar`而不是`xyz bar`.

------



### 使用函数

#### 一、函数的调用语法

```
$(<function> <arguments>)
```

或：

```
${<function> <arguments>}
```

`<arguments>`为函数的参数，参数间以逗号分隔，而函数名和参数之间以空格分隔。

#### 二、字符串处理函数

1.  subst

    ```
    $(subst <from>,<to>,<text>)
    ```

    字符串替换函数：将字串`<text>`中的`<from>`字串替换成`<to>`。

    函数返回被替换过后的字符串。

2.  patsubst

    ```
    $(patsubst <pattern>,<replacement>,<text>)
    ```

    模式字符串替换函数：查找 `<text>` 中的单词（单词以“空格”、“Tab”或“回车”“换行”分隔）是否符合模式`<pattern>` ，如果匹配的话，则以`<replacement>`替换。这里， 可以包括通配符 `%` ，表示任意长度的字串。如果`<replacement>`中也包含 `%` ，那么这个 `%` 将是 `<pattern>`中的那个 `%` 所代表的字串。（可以用 `\`来转义，以 `\%` 来表示真实含义的 `%` 字符）

    返回：函数返回被替换过后的字符串。

    示例：

    >   ```
    >   > $(patsubst %.c,%.o,x.c.c bar.c)
    >   >
    >   ```

    又如：

    ```
    objects = foo.o bar.o baz.o
    ```

    那么`$(objects:.o=.c)`和`$(oatsubst %.o,%.c,$(objects))`是一样的。

3.  strip

    ```
    $(strip <string>)
    ```

    去空格函数：去掉`<string>`字串开头和结尾的空字符，返回被去掉空格的字符串值。

4.  filter函数

    ```
    $(filter <pattern...>,<text>)
    ```

    过滤函数：以模式过滤`<text>`字符串中的单词，保留符合模式`<pattern>`的单词。可以有多个模式。返回符合模式`<pattern>`的字串。

    示例：

    ```
    sources := foo.c bar.c baz.s ugh.h
    foo: $(sources)
    	cc $(filter %.c %.s,$(sources)) -o foo
    ```

#### 三、文件名操作函数

1.  dir

    ```
    $(dir <names...>)
    ```

    去目录函数：从文件名序列`<names>`中取出目录部分。目录部分是指最后一个反斜杠之前的部分。如果没有反斜杠，则返回`./`。

2.  notdir

    取出文件名序列`<names>`中非目录部分。

3.  suffix

    ```
    $(suffix <names...>)
    ```

    取后缀函数：从文件名序列`<names>`中取出各个文件名的后缀。如果文件没有后缀，则返回空字串。

#### 四、foreach函数

```
$(foreach <var>,<list>,<text>)
```

把参数`<list>`中的单词逐一取出放到参数`<var>`所指定的变量中，再执行`<text>`所包含的表达式。每一次`<text>`会返回一个字符串，以空格分隔。

如：

```
names := a b c d
files := $(foreach n,$(names),$(n).o)
```

注意：`<var>`参数是一个**临时的局部变量**。

#### 五、if函数

```
$(if <condition>,<then-part>,<else-part>)
```

可以不包含else部分。

#### 六、call函数

唯一一个可以用来创建新的参数化的函数。

```
$(call <expression>,<parm1>,<parm2>,...,<parmn>)
```

`<expression>`参数中的变量会被参数`<param1>`,`<param2>`依次取代。
