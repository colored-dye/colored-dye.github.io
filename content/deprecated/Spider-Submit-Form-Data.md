---
title: '爬虫:提交表单数据'
date: 2021-08-29 16:00:29
tags: [Spider]
categories: [Spider]
---

最近有这样的需求：从excel表格读取数据、逐条发送到网站查询信息、并将结果存到excel文件中。在需求方面，由于(1) 数据规模达到了1000以上，手动复制粘贴十分费时耗力；(2) 并且每年都有这样的工作；(3) 政府网站在相当长的一段时间内不会大改，所以为其编写程序很值得。在交换使用方面，而因为用户对Python并不太了解，所以需要制作单独的`exe`可执行文件。

<!--more-->

**计划** ：先用编写Python脚本文件，再利用工具将脚本编译为`exe`可执行文件。

### 0. 分析目标网站

目标网站是技术等级证书网站: `http://zscx.osta.org.cn`.

![](https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/zscx_front_page.png)

任务是根据一个人的名字和身份证号查询他/她所拥有的证书编号和职业资格类型。

如果查询姓名为“hhh”、身份证号为“123”的证书，肯定是查询不到的：

![](https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/zscx_no_result.png)

但是可以查看源代码：

![](https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/zscx_no_result_source.png)

提交的是`POST`类型的数据。

请求头：

```html
POST /jiandingApp/command/buzhongxin/ecCertSearchAll HTTP/1.1
Host: zscx.osta.org.cn
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Referer: http://zscx.osta.org.cn/
Content-Type: application/x-www-form-urlencoded
Content-Length: 89
Origin: http://zscx.osta.org.cn
Connection: keep-alive
Cookie: JSESSIONID=89F493D88xxx; Hm_lvt_5e21f0d47312f3be133220d325fc2xxx; Hm_lvt_52a88c3e9ecd4f7af925dc34xxxxx; Hm_lpvt_5e21f0d47312f3be133220d325xxxxx; Hm_lpvt_52a88c3e9ecd4f7af925dc3400f43xxxx
Upgrade-Insecure-Requests: 1
Cache-Control: max-age=0
```

最重要的是`User-Agent`，用于模仿浏览器行为。`Accept`, `Referer`, `Content-Type`也需要。

表单数据的格式：

```html
tableName=CERT_T&tableName1=000000&CertificateID=&CID=123&Name=hhh&x=256&y=14&province=-1
```

### 1. 脚本

##### (1) 库

脚本需要的库有：`requests`, `lxml`, `urllib`, `lxrd`, `lxwt`, `os`.

-   `requests`库用于向网站发送`POST`消息。

-   `lxml`用于解析返回的HTML代码。

-   `urllib`用于编码转换。

-   `lxrd`用于excel表格读取，`lxwt`用于excel表格写入。
-   `os`用于操作系统相关操作，这里只用了`os.system("pause")`.

##### (2) 代码

话不多说，上代码！

```python
import requests
from lxml import etree
import urllib
import xlrd
import xlwt
import os

payload = {
    'tableName': 'CERT_T',
    'tableName1': '000000',
    'CertificateID': '',
    'CID': '000000000000000000',
    'Name': '是谁呢',
    # 'x': '113',
    # 'y': '31',
    'province': '-1'
}
phead = {
	# 'Host': 'zscx.osta.org.cn',
	'Connection': 'keep-alive',
	'Content-Type': 'application/x-www-form-urlencoded',
	'Cache-Control': 'max-age=0',
	# 'Upgrade-Insecure-Requests': '1',
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
	'Origin': 'http://zscx.osta.org.cn',
	'Content-Type': 'application/x-www-form-urlencoded',
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
	'Referer': 'http://zscx.osta.org.cn/',
	'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6'
}

url = 'http://zscx.osta.org.cn/jiandingApp/command/buzhongxin/ecCertSearchAll'
# 下载超时
timeOut = 25
# 输出表格行
Index = 1

def parse(i, content, outsheet):
	global Index
	html = etree.HTML(content)
	# 无结果
	res = html.xpath("/html/body/div[@id='wrap']/div[@id='center_jg']/div[@class='jg_con_2']/div[@class='zscxsj']/div[@class='zscxsj_1 back_f5']/div[@id='nores_con']/div[@id='nores_txt']/h2/text()")
	if len(res) != 0:
		print(i, ":无结果")
		# print(res)
	else:
		print(i, ":查询成功")
		result = html.xpath("/html/body/div[@id='wrap']/div[@id='center_jg']/div[@class='jg_con_2']/div[@class='zscxsj']/div[@class='zscxsj_1 back_f5']/div[@class='table_1']/table[@class='tab_info1']/tr/td/text()")
		# print("证书编号: {}\n职业资格: {}".format(result[11], result[7]))
		outsheet.write(Index, 0, payload['Name'])
		outsheet.write(Index, 1, payload['CID'])
		outsheet.write(Index, 2, result[7])
		outsheet.write(Index, 3, result[11])
		Index += 1
		# print("Index: {}".format(Index))


def lookup(i, outsheet):
	p_utf8 = urllib.parse.urlencode(payload, encoding='utf8')
	# print(p_utf8)
	res = requests.post(url, data=p_utf8, headers=phead, timeout=timeOut, allow_redirects=True)
	parse(i, res.text, outsheet)

def main():
	infile = input("请输入源文件名: ")
	workbook = xlrd.open_workbook(infile)
	sheet1 = workbook.sheets()[0]
	nrows = sheet1.nrows
	print("数据行数: {}".format(nrows-1))

	output = xlwt.Workbook()
	outsheet = output.add_sheet('结果')
	outsheet.write(0, 0, "姓名")
	outsheet.write(0, 1, "身份证号")
	outsheet.write(0, 2, "职业资格")
	outsheet.write(0, 3, "证书编号")

	for i in range(nrows-1):
		payload['Name'] = sheet1.row_values(i+1)[0]
		payload['CID'] =  sheet1.row_values(i+1)[1]
		lookup(i+1, outsheet)
	
	output.save("查询结果.xls")
	print("结束,共有{}条结果".format(Index-1))
	os.system("pause")

if __name__ == '__main__':
	main()

```

### 2. 生成可执行文件

这里用的是Python的`pyinstaller`工具，需要使用pip下载。

在实际使用中遇到了点困难：`pyinstaller.exe`所在的路径不在PATH当中，所以还要先将对应的路径添加到环境变量中。

之后运行`pyinstaller -F spider.py`. 可以在`dist`路径下找到可执行文件。

### 3. 困难

最大的困难是在测试POST表单数据时的编码问题。服务器接受的表单数据需要是URL编码的，所以需要调用`urllib.parse.urlencode()`方法(`urllib3`用法同上，但是`urllib`的使用方法是`urllib.urlencode()`).

其次，我还复习了`xpath`的基本语法，用于解析HTML中的标签。

---

### 新问题

今天实战时发现了问题：当查询了1000条左右的数据后，程序崩溃了。进一步查询发现，原来是网站拒绝了我的访问。进一步查看源代码发现，提交的表单数据中还包含了我的IP地址。原因是网站采取了反爬虫手段，封禁了我的IP(QAQ)，希望不是永久封……

我上网查了一下解决方法，大概有以下三种：

1.   维护代理IP池，每次提交数据随机挑选IP。
2.   延长每次提交之间的间隔。
3.   更换`User-Agent`标签的内容。

经过实际测试，只有第一种是实际有效的。我使用了`Clash`客户端上的`GlaDos`用于科学上网，并选择了`Global`模式以开启全局代理。每次准备60-200条不等的数据，并运行爬虫。当爬虫报错后，更换连接信道，重新运行。（是的，这种方法好麻烦……但是我懒得搞代理IP池管理了\~(￣▽￣)\~）

##### 2020/09/04 更新：

今天突然想起来被封这回事，于是再次尝试——IP解封辣！看来省事的办法就是每天间隔较长时间查询较少规模的数据~ ~~这样就可以把省下来的时间用来摸鱼咯~~
