---
title: "CoLinux-Cooperative Linux 01: 总览"
date: 2022-03-19T21:45:33+08:00
draft: false
tags: [CoLinux, OS]
categories: [CoLinux, OS]
---

[CoLinux(Cooperative Linux)](http://www.colinux.org/)是一款用于模拟Linux系统环境的跨平台的开源软件。尽管它已经十分古老且不再维护(最后一次更新为2011年的0.7.9版，仅支持32位系统)，但是其思想是值得后人学习和研究的。个人理解，它的新颖之处在于成功地实现了“Linux as a Driver”，即以驱动的形式嵌入以Windows NT为代表的正在运行的宿主机当中，通过不断地切换用户态和内核态，来实现对Linux内核的完全控制，同时还能保证不逊色于虚拟机的运行效率。

<!--more-->

官网的目录栏中给出了这个项目的相关研究论文(是的，还有paper :astonished:) 在研究代码之前，我想先从理论层面理解一下CoLinux的设计思想与思路。所以本文主要做的就是阅读和整理[这篇论文(Cooperative Linux, from Proceedings of the Linux Symposium Volume 1, July 21th-24th, 2004)](https://www.kernel.org/doc/ols/2004/ols2004v1-pages-23-32.pdf)\~

文中主要介绍了关于CoLinux的以下几个方面：

-   上下文切换(CPU-complete context switch code)
-   硬件中断转发(Hardware interrupt forwarding)
-   宿主操作系统与Linux之间的接口
-   虚拟机伪物理内存的管理

此外还介绍了CoLinux当前和将来的实现细节，以及与其他Linux虚拟化手段的比较。

后文的结构尽量与原文保持一致\~

# 1. Abstract

作者为CoLinux给出的总体描述是“a port of the Linux Kernel that allows it to run as an unprivileged lightweight virtual machine in kernel mode, on top of another OS kernel”. 这指出了CoLinux必须依托于一个现有的操作系统，并可以在内核模式下作为非特权轻量虚拟机运行。也就是说它与一个真正意义上完整的操作系统有根本上的区别。

# 2. Introduction

作者首先指出了CoLinux与传统虚拟机之间总体路线上的区别，走的是比较冷门的、与VM完全不同的路径。

接下来点题: **Cooperative到底是什么含义？**它描述的是两个并行工作的实体，如协程。从这个角度看来，**CoLinux的原理可以描述为**：将两个操作系统内核转化成两个协程，每个内核都有各自完整的CPU上下文、地址空间，并可以通过调度算法决定何时将控制转交给另一方。二者最大的**区别在于**：宿主内核(host kernel)拥有对物理硬件完全的控制权，而客户内核(guest kernel)仅能控制虚拟硬件。宿主可以是任何操作系统内核，只要它能够让CoLinux portable driver以**CPL0**(Current Privilege Level，当前特权等级，数值越小越靠近内核、权限越高)**模式**运行并为其分配内存。

CPL0级别的权限是CoLinux与传统虚拟机方案的重要区别之一——传统虚拟机方案中客户内核的权限是低于宿主机的。这同时也使得CoLinux的设计和开发得以大幅简化。另一方面，CPL0的缺点在于稳定性和安全性。稳定性隐患在于：由于客户内核和宿主内核属于同一级别，一旦客户内核崩溃，整个系统都会崩溃。而安全性问题在于，一旦CoLinux以root模式运行，攻击者有可能向系统中加载恶意模块或利用系统漏洞，从而威胁整体系统。

最后，CoLinux是在Linux内核的i386分支上编写的补丁，主要的改动是初始化设置代码和虚拟硬件驱动等。在实际的实现当中，作者都尽力将使改动的规模更小并局限在较小的范围内。

# 2. Uses

这里选择比较有特点的几个用途简要介绍。

1.   用户态Linux的功能：virtual hosting, 内核开发环境，测试软件等。

     这里强调的是CoLinux功能的完整性和可靠性。

2.   在Linux集群中添加Windows机器。

     CoLinux可以与MOSIX或OpenMOSIX结合起来(不知道是什么)，能够将运行Windows系统的机器加入到超级计算机集群中。

3.   将Linux作为Windows上的防火墙。

     个人理解是将CoLinux当作一个沙盒，流量就不会直接与宿主机交互。

# 3. Design Overview

这一部分介绍了上下文切换、转发硬件中断、硬件地址转化和虚拟物理内存。

## 3.1 Minimum changes

这里作者将修改后的代码与原本的Linux内核做了一个比较，结果还是很惊人的：之改动了50个文件、3828处插入和74处删除。这很大程度上体现了这一设计的可扩展性和与Linux内核的兼容性。

## 3.2 Device Driver

这里就是最开始所说的“Linux as a Port”的由来：CoLinux的驱动端口用于访问内核模式，并使用宿主操作系统提供的内核原语，包括页表分配、输出debug信息、与用户空间交互等。这些相关功能的代码是操作系统无关的。

在CoLinux开始运行时，会首先从vmlinux加载内核镜像，但是其本身不包含任何跨平台的工具，只是单纯的内核镜像文件，可以在任何相同CPU架构的机器上运行。在具体的宿主操作系统上，CoLinux VM的实例就是一个驱动，在Linux上是一个文件描述符，在Windows上是一个设备句柄。也就是说，CoLinux的最高管理权限还是归宿主操作系统所有的。当其异常退出时，资源会被宿主操作系统回收。

我认为这一小节所表达的意思是：CoLinux的跨平台特性，主要是通过驱动实现的。这个结论在本节中没有明文指出，但是综合多方面来看就是这个意思 :stuck_out_tongue_winking_eye:

## 3.3 Pseudo Physical RAM

在原生的Linux系统中，MM(Memory Manager)默认整个物理内存空间都是可用的。而在CoLinux中这显然是无法实现的，因为那一部分系统启动需要的地址一半已经被宿主操作系统占用了。所以CoLinux在启动之初所能操纵的只是宿主操作系统给它分配的一段内存区域，让它将其当作是所有的物理内存空间。

分配内存时使用的具体的API是操作系统特定的：Linux中是`alloc_pages()`，Windows中是`MmAllocatePagesForMdl()`.

VM地址空间有着特定的地址不变的区域：页表映射到`0xfef00000`，从PPRAM(Pseudo-Physical RAM)映射到物理地址，用来为用户空间创建PTE和`vmalloc()`；还有一段映射表在`0xff000000`，从物理地址映射到PPRAM，用来加速page fault等需要地址翻译的事件。

为了实现PPRAM，只需要在Linux内核代码中MMU相关部分作很少的修改。文中展示的是Linux-2.4.23的内核代码，路径为`linux/include/asm-i386/pgtable-2level.h`，顾名思义这个是针对两层页表相关参数的定义。下图是https://elixir.bootlin.com上面的代码。文中删去了第61行。

<img src="https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/CoLinux/pgtable-2level.png" style="zoom:50%;" />

```c
--- linux/include/asm-i386/pgtable-2level.h 2004-04-20 08:04:01.000000000 +0300
+++ linux/include/asm-i386/pgtable-2level.h 2004-05-09 16:54:09.000000000 +0300
@@ -58,8 +58,14 @@
}
#define ptep_get_and_clear(xp) __pte(xchg(&(xp)->pte_low, 0))
#define pte_same(a, b) ((a).pte_low == (b).pte_low)
-#define pte_page(x) (mem_map+((unsigned long)(((x).pte_low >> PAGE_SHIFT))))
#define pte_none(x) (!(x).pte_low)
+
+#ifndef CONFIG_COOPERATIVE
+#define pte_page(x) (mem_map+((unsigned long)(((x).pte_low >> PAGE_SHIFT))))
#define __mk_pte(page_nr,pgprot) __pte(((page_nr) << PAGE_SHIFT) | pgprot_val(pgprot))
+#else
+#define pte_page(x) CO_VA_PAGE((x).pte_low)
+#define __mk_pte(page_nr,pgprot) __pte((CO_PA(page_nr) & PAGE_MASK) | pgprot_val(pgprot))
+#endif
#endif /* _I386_PGTABLE_2LEVEL_H */
```

可以看到，修改部分使用`CONFIG_COOPERATIVE`宏作为选项参数，准备了两套`pte_page`和`__mk_ptr`. 后者返回一个PTE，而前者接受这个PTE并返回对应的页结构。此外需要修改的还有`pmd_page`和`load_cr3`.

## 3.4 Context Switching

`colinux-daemon`维护着自己和子进程的上下文，可以看作是“Super Process”，频繁地在Linux内核和宿主kernel之间做着上下文切换。为了做到这一点，作者采用的设计是在客户机和宿主机中间用一个中间地址空间(称其为“Passage Page”)作为桥梁，这个中间地址空间同时存在于客户机和宿主机的地址空间中。从而将同一物理地址的代码映射到不同的虚拟地址。当上下文切换发生时，CR3首先指向中间地址空间中，然后EIP通过跳转指令指向passage code在中间地址空间中的另一处映射，最后，CR3会指向另一内核的顶层页表入口处。

发生上下文切换时，当前状态会保存在中间地址空间中，包括通用寄存器、段寄存器、中断描述符表寄存器(IDTR)、全局描述符表(GDTR)、本地描述符寄存器(LDR)、TR、FPU/MMX/SSE寄存器等。同时中断会被禁用。

当发生硬件中断时，控制总要交给宿主机，而宿主机应当把coLinux当作一个普通的进程一样分配时间片。



## 3.5 Interrupt Handling and Forwarding

coLinux中必须设置好中断向量表以处理硬件中断，其中内部异常(0x0 - 0x1F)和系统调用(0x80)被保留，其余的都指向特殊的代理：ISR(Interrupt Service Routines). 当硬件中断发生时，控制会通过中间地址空间交给宿主内核，而宿主内核会通过IDT来检查ISR的相对地址。

# 4. Benchmarks and Performance

比较了原生Linux、UML(User-Mode Linux)和coLinux，结果coLinux的表现位于两者之间:laughing:.

# 5. Planned Features

## 5.1 Suspension

基本思路就是保存全部的内部状态，如将伪物理内存线性化等。

## 5.2 Miscellaneous

-   Virtual frame buffer support
-   Incorporating features from UML, e.g. humfs.
-   Support for more host OSes.





















