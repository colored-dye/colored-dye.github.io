---
title: Hexo图片显示
date: 2021-03-22 22:07:39
tags: [Hexo]
categories: [Hexo]
---



这两天捣鼓Hexo的各种基本配置，结果在发布图片上发生了一点困难。现在已知的以Hexo + Github为框架的博客发布图片有几种方法：

<!--more-->

1.  作为网页源文件之一的实体文件，通过`images/xxx.jpg`在Markdown语法下引用。

2.  利用图床生成URL并引用外链。

    图床又有几种常用的：

    1.  `sm.ms`：看起来有点怪怪的网站名(>v<)。优点是免费，有10G存储空间；缺点是需要翻墙。

    2.  `Github` Repository：现在初期决定采取的方法。建立一个Repository专门用来保存图片。由于引用链接时会访问`raw.githubusercontent.com`，所以采用`cdn.jsdelivr.net/gh/[Github_username]/[Repo_name]@[Version]/[Filename]`的方式加速加载。jsdelivr yyds！

        在本机上还可以采用修改host文件的方式。先通过

        [ipaddress]: www.ipaddress.com

        查询`raw.githubusercontent.com`的IP，再添加到host文件中就可以啦！但是在移动端就没办法了。所以还是jsdelivr比较好！（虽然麻烦一点需要改链接）

    3.  七牛云：免费10G存储。但是需要有个人域名，否则在一个月之后会回收测试域名！

    4.  腾讯COS：比较便宜也很稳定。但是需要花钱的还是多考虑考虑hhh.

此外还采用了一个简单易用的图床链接生成工具PicGo，并支持以上提到的所有图床。目前用着感觉还挺好用的。



现在在申请一个阿里云的域名的实名认证，以后就可以有自己的域名啦哈哈哈哈~



最后插一个图片再次测试一下~

<img src="https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/Kotaro_Holding_Guitar" style="zoom: 33%;" />