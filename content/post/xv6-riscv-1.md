---
title: xv6-riscv学习1-Chapter1
date: 2021-05-01 12:34:23
tags: [OS, RISC-V, xv6-riscv]
categories: [OS, RISC-V, xv6-riscv]

---

### Chapter 1: Operating System Interfaces

第一章讲的是操作系统接口。“接口”这个概念在计算机领域挺常见的，它使得代码规范标准化，并使得在保持参数传递不变的情况下对接口底层功能进行修改成为了可能。

<!-- more -->

在这里，接口与**系统调用** (**system call**)是紧密相关的。系统调用就是操作系统内核向用户程序提供的访问内核功能的接口。实际上，系统调用在操作系统分层模型的实现中是极其重要的。书中有一幅图呈现了user space和kernel space之间的关系：

<img src="https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/xv6layered-view" style="zoom:50%;" />

这其实带来了一个问题：系统调用的功能是不是越复杂、越丰富越好呢？书中给出的答案是否定的，并给出了一个目标：“Design interfaces that rely on a few mechanisms that can be combined to provide much generality.”这大概就是说“大而全不如小而精”吧。

同时可以注意到，上图中shell是在用户空间里的，也就是说shell在xv6系统中是用户程序。这样一来，其实可以使得用户更换shell变得很方便，只要使用同样的接口就可以了。现实中常用的Linux系统也都是这样的。

接下来仍遵循书中的结构~

#### 1. 进程与内存

在操作系统中，一般会有多个进程“同时”运行，每个进程在内核中被分配有一个唯一的进程标识符(process identifier)，缩写`PID`。真正意义上的“同时”只有在多核CPU上才能实现，而对于单核CPU，操作系统会通过进程调度机制轮流执行各个进程，由于切换的速度非常快，给人的感觉就像是同时一样。

创建新进程的方法一般通过`fork()`或`exec()`系统调用实现。`fork`会给新创建的子进程复制一份父进程的内存，内容完全一样，如果从标准的ELF格式来看的话，从text, data, bss到stack都是一样的。`fork`很特殊的一点是其有两个返回值：向父进程返回子进程的`PID`，向子进程返回0. 

一个经典的`fork`测试程序大致如下：

```c
void testfork()
{
    int pid;
    pid = fork();
    if(pid > 0){
        printf("parent: child PID = %d\n", pid);
        pid = wait(0);
        printf("child %d terminates\n", pid);
    }else if(pid == 0){
        printf("child exiting\n");
        exit(0);
    }else{
        printf("fork error\n");
    }
}
```

有意思的是“child xxx terminating”和“parent: child PID = xxx”的先后顺序是不一定的。

而`exec`系统调用直接将文件加载到内存中，文件通常是ELF(Executable and Linkable Format)格式。在Linux系统中文件类型可以通过`file [filename]`命令查看。

书中给了一小段程序用于帮助解释`exec`的功能：

```c
char *argv[3];
argv[0] = "echo";
argv[1] = "hello";
argv[2] = 0;
exec("/bin/echo", argv);
printf("exec error\n");
```

之所以在`exec()`的下一行输出错误信息，是因为当exec执行成功时，会将当前进程的内存空间覆盖掉，原程序的代码自然就无法执行了。

`fork`如果每创建一个新进程时都复制父进程的所有内存，其实是很浪费时间的。现在大多数操作系统采取的是**写时复制**(**copy-on-write**) ，也就是说，子进程刚创建时，是与父进程共用地址空间的。如果子进程只进行读操作，那就是最划算的了。而当子进程需要写入一段内存时，才会给子进程将要写入的对应页表进行复制，其余部分仍共享。

#### 2. I/O与文件描述符

文件描述符为文件、目录和设备提供了统一的表示方法，从而将它们都抽象为文件流的形式。所以，文件也是一个抽象，而系统为访问和操纵文件提供了统一的接口。

每一个进程都会维护一个open-file table（不知道怎么翻译了XD），其中包含了这个进程所访问的文件描述符。

关于`fork`和`exec`还有很特殊的特性：`fork`会复制父进程的file table给子进程，而`exec`会保留调用者进程的file table。这就使得**I/O重定向**(**I/O redirection**) 很容易实现：先fork，再exec.

(其实这一节还有一些比较复杂的，但是我看不太懂就不贴上来了)

#### 3. 管道(Pipe)

`pipe`用于将一个进程的输出流作为另一个进程的输入流。如常用的：

```sh
sudo apt-cache search vim | grep vim
```

其实有点类似于重定向，但是它在更广泛的意义上提供了进程间通信的方法。当需要传输的数据量不太大时，可以通过重定向来实现管道的功能，如`echo hello world | wc`可以实现为：`echo hello world > /tmp/xyz; wc < /tmp/xyz`. 但是管道的一个优点就是它可以传递任意长度的数据流。

管道有一个写端、一个读端。当两个进程通过一个管道进行通信时，它们的读端和写端都是一样的。

接下来的示例程序就有点复杂了：

```c
int p[2];
char *argv[2];
argv[0] = "wc";
argv[1] = 0;

pipe(p);
if(fork() == 0){
    close(0);
    dup(p[0]);
    close(p[0]);
    close(p[1]);
    exec("/bin/wc", argv);
}else{
    close(p[0]);
    write(p[1], "hello world!\n", 12);
    close(p[1]);
}
```

书中是这样解释这段程序的功能的：`fork`之后，父进程和子进程共用管道`p[]`所指的文件描述符。子进程调用`close`和`dup`使得管道的读端为文件描述符0，关闭了`p[]`中的文件描述符，并调用`exec`运行`wc`。当`wc`从标准输入（即文件描述符0）读取输入时，它就会从管道中读。父进程关闭了管道的读端，向管道中写入“hello world!\n”，后关闭了管道的写端。

关于管道，书中提到了一个神奇的用法。管道的右侧还可以包含管道！比如：`a | b | c |...`，从而可以构建一个进程树，在这样的树中，父节点需要等待所有的子节点执行完毕才能开始执行。

书中还提到管道的一个优点是允许流水线的并行执行，然而采用文件重定向的方法就必须等前一个程序写入文件完成后才能让下一个程序执行。想一想还是挺有道理的，毕竟数据流的特点就是可以实时处理。

#### 4. 文件系统

与文件操作相关的系统调用有很多，如`chdir`, `open`, `mkdir`, `close`, `mknod`等。前四个还比较直接明了，第四个`mknod`创建一个指代着设备的特殊文件，与这个文件直接相关的是两个设备号：major device number和minor device number，暂且翻译成“主、次设备号”好了。一般的使用方式是：`mknod("/console", 1, 1)`.

书中还提到了部分与文件系统相关的概念：`inode`和`link`。`inode`保存了文件的元数据(metadata)，包括文件类型（文件/目录/或设备）、文件内容在磁盘上的地址和指向该文件的链接数。每个inode可以有多个链接，而每个链接都包含了目录中的一个条目(entry)，条目中包含了文件名和inode号。所以文件名不是文件内容的一部分！

记录一个文件的数据结构长这个样子：

```c
#define T_DIR 		1	// Directory
#define T_FILE		2	// File
#define T_DEVICE	 3	// Device

struct stat{
    int dev;	// File system's disk device
    uint ino;	// Inode number
    short type;	// Type of file
    short nlink;// Number of links
    uint64 size;// Size of file in bytes
};
```



关于`link`系统调用，这里实现的应该是软链接(soft link)，即新创建的链接并不是保存在额外的文件中，而是直接指向了被引用的文件。以下是一段创建链接的示例：

```c
open("a", O_CREATE | O_WRONLY);
link("a", "b");
```

在此之后，文件名“a”和“b”都指的是同一个文件，使用这两个文件名会得到相同的inode number，而对应的`struct stat`变量中的nlink值为2.

如果调用`ulink("a")`，那么这个文件名便只剩下了b，nlink值又变回了1.