---
title: "Gentoo基本系统安装(systemd)"
date: 2022-11-16T12:41:47+08:00
draft: false
tags: ["Gentoo", "折腾", "Linux"]
categories: ["Gentoo", "折腾", "Linux"]
---

在我的“因为嫌麻烦而一直没有做的事情”的清单上少了一项，因为这几天我安装了Gentoo系统\~

很久以前就听说了Gentoo Linux，它与Arch Linux一样是滚动更新的系统，且最大的区别是：前者是从远程仓库获取源代码包、本地编译安装，而后者是像绝大多数发行版一样安装二进制包。说实话，Gentoo的这一特性对于大多数用户带来了很大的管理负担，比如说要编译Firefox，逛逛很可能要编译3小时以上，常规操作是让电脑熬夜干活、自己睡觉，第二天一早就编译好了QAQ。不过我不是很在意这一点，因为这种大型软件更新的频率较低。

<!--more-->

从另一个角度来看，Gentoo从源码编译的策略给用户带来了极大的可操作空间。事实上，这也是大多数Gentoo用户选择Gentoo的理由。在这一维度上来看，Arch在软件管理的过程中，用户可以彻底控制哪些功能或模块是自己真正需要的，并尽可能地减少不必要的依赖和冗余，最终得到一个较轻量、功能齐全的系统。比如说，我在安装了基本系统后，可以在安装Xorg时指定只安装`xorg-base`, `xorg-server`等基础组件和我需要的一些小工具。这又涉及到Gentoo的包管理系统，我还不太懂，具体请查阅官方Wiki，有中文版的哦\~

综上，我选择Gentoo的理由有二：

1)   滚动更新。常见的滚动更新的发行版有Arch(Manjaro), OpenSUSE Tumbleweed, Gentoo. 这三个我都尝试过——Arch较激进，怕滚挂；Manjaro团队不太靠谱的样子；OpenSUSE对我的电脑适配不太好。而Gentoo虽然是滚动更新，但是其代码审查较严格，事实上，Gentoo的内核版本可能比同期的Ubuntu LTS还要老，如我在2022/11/14安装的的内核版本就是5.15.75，而Ubuntu 22.04在2022年4月发布时的内核版本是5.15.0. 而Arch和OpenSUSE Tumbleweed的内核版本都是6.0.5. 说实话，我挺馋OpenSUSE的BTRFS文件系统的备份功能，但是这可以通过软件实现，问题不大。
2)   最小化安装。我稍微有一点环境洁癖，不希望系统中闲逛着大量用途不明的包。而且我想尝试一下更轻量级的Window Manager而非Desktop Environment.

## 1. 安装镜像的选择

关于init系统，Gentoo自己开发了一款叫作OpenRC的初始化系统，据说它比systemd要快，但是我更关心兼容性而不是速度，因为有些软件只适配systemd，所以选择systemd版本的安装镜像。关于这一点，Gentoo提供了相对方便的OpenRC与systemd之间互换的机制，所以即使后期想用一用openrc的话也不是不可以。

关于镜像，还有一个小坑。我最初使用了最小化镜像，但是这个livecd系统中没有提供我使用的无线网卡的驱动，而我又不方便使用有线网络。所以迫不得已之下弃用了500+MB的最小化安装镜像，改用了4+GB的livegui. 不得不感叹，这个livegui使用的KDE真绚丽，最令人欣喜的是我的无线网卡能用了QwQ! 于是很愉快地进行了接下来的安装步骤。

其实镜像不一定要使用Gentoo livecd的！没错，其实很多老鸟都是用的Arch livecd，因为上面提供了较好用的自动化工具，且Gentoo的stage3基本系统是以`tar.xz`压缩包的形式提供的。但是我为了与官方文档保持一致，还是乖乖用了Gentoo livecd.

## 2. 基本系统安装

一切以官方文档为准\~ 仅供参考。

### 2.1 网络

在livegui环境中在右下角选择无线网络即可。`ping baidu.com`检验网络是否可用。如果没有无线网络，也可以使用有线网络，`dhcpcd`命令自动获取地址。

### 2.2 磁盘分区

可以用`cfdisk`或`fdisk`工具，分配好boot，swap，root分区。有人说最好给`/home`单独分区，方便迁移系统，这就见仁见智了。

我这里选择的是UEFI+GPT引导方式，EFI分区至少256M，swap至少是物理内存的大小，剩余的全给了根目录。

`lsblk`查看分区结果。

### 2.3 格式化，挂载分区

```bash
mkfs.vfat -F 32 /dev/sda1
mkfs.ex4 /dev/sda3
mkswap /dev/sda2
swapon /dev/sda2
```

```bash
mount /dev/sda3 /mnt/gentoo
mkdir -p /mnt/gentoo/boot
mount /dev/sda1 /boot
mount --types proc /proc /mnt/gentoo/proc
mount --rbind /sys /mnt/gentoo/sys
mount --make-rslave /mnt/gentoo/sys
mount --rbind /dev /mnt/gentoo/dev
mount --make-rslave /mnt/gentoo/dev
mount --bind /run /mnt/gentoo/run
mount --make-rslave /mnt/gentoo/run
```

需要注意的是，在挂载分区的过程中，`--make-rslave`选项是systemd要求的，openrc不需要。

### 2.4 stage3

所谓“stage”是指构建Gentoo系统中的各个阶段。

-   Stage 1: 从`package.build`生成的系统包，在`/var/db/repos/gentoo`目录下。
-   Stage 2: 在stage 1基础上编译得到的可以自举的工具链。
-   Stage 3: 在stage 2基础上继续编译，以包含一个系统集（system set）系统集可以通过@system来调用(如`emerge @system`)。

相当于Gentoo的安装镜像中已经替我们做好了stage 1-2，stage 3则根据我们的需求自己准备。stage 3中没有内核、引导程序等，这也是后续工作的重点。

```bash
cd /mnt/gentoo
wget https://bouncer.gentoo.org/fetch/root/all/releases/amd64/autobuilds/20221106T170545Z/stage3-amd64-systemd-20221106T170545Z.tar.xz
tar xpvf stage3-*.tar.xz --xattrs-include="*.*" --numeric-owner
```

### 2.5 配置`/mnt/gentoo/etc/portage/make.conf`

```bash
nano -w /mnt/gentoo/etc/portage/make.conf
```

首先需要修改`COMMON_FLAGS`，一般加上`-march=native`，也可以直接写出CPU架构名称，比如我使用的i5-12500H对应的就是`-march=alderlake`.

加上`MAKEOPTS="-j8"`，用于并发任务加速编译。

`CPU_FLAGS_*`: 用于指定CPU特定的编译选项，如alderlake中取消了`avx512`指令。这时需要`cpuid2cpuflags`工具：

```bash
emerge --ask app-portage/cpuid2cpuflags --quiet
cpuid2cpuflags >> /mnt/gentoo/etc/portage/make.conf
```

然后需要改一改，将冒号改为等于号，并将右侧的内容加上引号。

`ACCEPT_LICENSE="*"`. 如果不这么做，就只能使用GPL等开源协议，不能下载二进制包等。这不是最好的做法，但是我对开源协议的要求不高QwQ.

### 2.6 Portage镜像

```bash
mirrorselect -i -o >> /mnt/gentoo/etc/portage/make.conf
```

### 2.7 Ebuild软件仓库

```bash
mkdir --parents /mnt/gentoo/etc/portage/repos.conf
cp /mnt/gentoo/usr/share/portage/config/repos.conf /mnt/gentoo/etc/portage/repos.conf/gentoo.conf
```

然后修改`gentoo.conf`，将`sync-uri`改为`rsync://rsync.mirrors.ustc.edu.cn/gentoo-portage`. 这个镜像有一定延迟，不过我不在乎QwQ.

### 2.8 DNS

```bash
cp --dereference /etc/resolv.conf /mnt/gentoo/etc
```

### 2.9 `chroot`

```bash
chroot /mnt/gentoo /bin/bash
source /etc/profile
export PS1="(chroot) $PS1"
```

### 2.10 更新软件源

```bash
emerge-webrsync
emerge --sync
```

### 2.11 选择系统配置

由于我想安装DWM，所以只需要基本的桌面环境。选择最新版本的同时带有desktop和systemd字样的一项。

```bash
eselect profile list
eselect profile set <number>
```

### 2.12 更新系统

This would take quite some time... 我编译了好几个小时QAQ.

```bash
emerge --ask --verbose --update -deep --newuse -quiet @world
```

### 2.13 配置时区和区域设置

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

nano -w /etc/locale.gen
# 启用en_US.UTF-8 UTF-8和zh_CN.UTF-8 UTF-8
locale-gen
eselect locale list
eselect locale set <number> # 我选择了en_US.UTF-8
env-update && source /etc/profile && export PS1="(chroot) $PS1"
```

### 2.14 安装固件和CPU微码

CPU微码很有意思，在系统启动之初加载进内存，参与到CPU指令解码的过程，可以用来解决CPU bug。

```bash
emerge --ask sys-kernel/linux-firmware
emerge --ask sys-firmware/intel-microcode
```

### 2.15 配置、编译内核

```bash
emerge --ask sys-kernel/gentoo-sources
eselect kernel list
eselect kernel set <number> # 创建/usr/src/linux符号链接
```

配置磁盘文件系统挂载点：

```bash
nano -w /etc/fstab
----
/dev/sda1	/boot	vfat	defaults	0 2
/dev/sda2	none	swap	sw	0 0
/dev/sda3	/	ext4	noatime	0 1
/dev/cdrom	/mnt/cdrom	auto	noauto,user	0 0
```

由于我的无线网卡较特殊，所以我想要编译相应的驱动模块。经查阅Gentoo论坛得知，还需要修改一下驱动代码：

```c
// drivers/net/wireless/mediatek/mt76/mt7921/pci.c
static const struct pci_device_id mt7921_pci_device_table[] = {
    { PCI_DEVICE(PCI_VENDOR_ID_MEDIATEK, 0x7961) },
    { PCI_DEVICE(PCI_VENDOR_ID_MEDIATEK, 0x7922) },
    { PCI_DEVICE(PCI_VENDOR_ID_MEDIATEK, 0x0608) },
    { PCI_DEVICE(PCI_VENDOR_ID_MEDIATEK, 0x0616) },
    { },
 }; 
```

然后使用menuconfig tui选择我需要的驱动：

```bash
genkernel --menuconfig all
```

### 2.16 配置引导程序

```bash
echo 'GRUB_PLATFORMS="efi-64"' >> /etc/portage/make.conf
emerge --ask --quiet sys-boot/grub
grub-install --target=x86_64-efi --efi-directory=/boot
grub-mkconfig -o /boot/grub/grub.cfg
```

### 2.17 网络组件

网络相关的软件必须在此时安装，否则进入新系统后既没网络，又没法下载用来配置网络的工具，只能重新进入livecd安装了(血与泪的教训).

```bash
emerge --ask net-misc/dhcpcd
emerge --ask net-wireless/iw net-wireless/wpa_supplicant
```

### 2.18 密码

同理，root密码需要配置。可以顺便添加新用户。

```bash
passwd
useradd -m -G users,wheel,portage,usb,video,audio,cdrom,plugdev colored-dye
passwd colored-dye
```

### 2.19 systemd相关

```bash
systemd-firstboot --prompt --setup-machine-id
systemctl preset-all
# 还可以顺便设置dhcpcd等自动启动
```

### 2.20 系统日志

```bash
emerge --ask app-admin/sysklogd
systemctl enable syslogd
```

----

重启即可！恭喜你，基本系统安装完成，可以进入纯命令行的Gentoo系统了\~

后续还会安装DWM Window Manager，不过这就与Gentoo关系不大了。也可以安装较受欢迎的KDE Plasma, Gnome, Xfce, Budgie等Desktop Environment.



## 结语

>   Q: 为什么要花这么大力气安装Gentoo呢？Gentoo有什么好的？真的值得吗？
>
>   A: 可以说Gentoo的安装复杂性仅次于LFS(Linux From Scratch)，在安装系统的过程中，我对系统的架构、设计理念和内部的一些细节有了更深刻的认识，所以我认为是值得的。即使我未必会长期使用Gentoo，但是Linux系统架构是大同小异的，这会有助于我在使用其余绝大多数的发行版。
>
>   虽然折腾的过程很有意思，但是我并不提倡为了折腾而折腾。事实上，除非特别需要，否则我不建议任何人使用Gentoo —— 系统维护的心智和时间开销不是开玩笑的。

