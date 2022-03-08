---
title: LeetCode-006-265th周赛记录
date: 2021-10-31 16:01:32
tags: [Algorithm, LeetCod]
categories: [Algorithm, LeetCode]
---

在CC98的@27rabbit的鼓励下，我还是鼓起勇气，第一次去参加了Leetcode周赛\~QwQ 做题过程很波折，在这里记录一下向大神们学习到的新知识\~

<!--more-->

第一道题大概是测试考生是不是机器人的hhh. 第二道题稍微有些难度，题目给出一个单链表，要求找到临界点之间的最小和最大距离。所谓临界点，对应数学上的概念应该是极值点，有极大值和极小值。我的做法是记录两个相邻结点之间的差值，如果符号相反就记为极值点，并从第一个极值点开始记录最新的两个极值点之间的距离，这些距离之和就是结果的最大距离，最小值就是结果的最小距离。

重点在我没做出来的3、4两题上QAQ. 

#### 转化数字的最小运算数

https://leetcode-cn.com/problems/minimum-operations-to-convert-number/

题目给出一个数组`nums[]`，还有两个整数`start`和`goal`。要求从`start`开始，利用`nums[]`中的任意数、以任意次数和任意顺序，通过加、减、异或任意运算，获得`goal`，最终得到这个过程中需要的最小运算次数。

看到这里我一下子就来劲了：暴力破解呗。然后就大刀阔斧地写出了引起`stack overflow`的算法：

```c++
class Solution {
public:
    int minimumOperations(vector<int>& nums, int start, int goal) {
        Found = false;
        temp = 0;
        n = start;
        ans = -1;
        BackTrack(nums, goal);
        return ans;
    }
private:
    int temp, ans;
    int n;
    bool Found;
    void BackTrack(vector<int>& nums, int goal){
        if(n == goal){
            if(ans == -1)
                ans = temp;
            else ans = min(ans, temp);
            return;
        }
        for(int i=0; i<nums.size(); i++){
            temp ++;
            n += nums[i];
            BackTrack(nums, goal);
            n -= nums[i];
            n -= nums[i];
            BackTrack(nums, goal);
            n += nums[i];
            n ^= nums[i];
            BackTrack(nums, goal);
            n ^= nums[i];
            temp --;
        }
    }
};
```

为什么会爆栈呢？一眼就可以看出，只要结果不等于`goal`，程序就会一直递归地执行第一条加法的`BackTrack()`。但是在此基础上实在不好给出其他的退出条件。大概也许这个思路就是错误的。

在结束后，我开始研究起来大神的代码。我选中的是排名第二的 @汪乐平 的代码，因为他用的时间最短。他的代码是这样子的：

```c++
class Solution {
    int d[1005];
public:
    int minimumOperations(vector<int>& nums, int start, int goal) {
        memset(d,-1,sizeof(d));
        queue<int> q;
        q.push(start);
        d[start]=0;
        int i,j,ans;
        while(!q.empty())
        {
            i=q.front();
            q.pop();
            for(auto &c:nums)
            {
                j=i+c;
                if(j==goal)return d[i]+1;
                else if(j>=0&&j<=1000&&!~d[j])
                {
                    d[j]=d[i]+1;
                    q.push(j);
                }
                j=i-c;
                if(j==goal)return d[i]+1;
                else if(j>=0&&j<=1000&&!~d[j])
                {
                    d[j]=d[i]+1;
                    q.push(j);
                }
                j=i^c;
                if(j==goal)return d[i]+1;
                else if(j>=0&&j<=1000&&!~d[j])
                {
                    d[j]=d[i]+1;
                    q.push(j);
                }
            }
        }
        return -1;
    }
};
```

一眼看上去就是一个BFS。还有一个`d[1005]`的数组，因为大于1000的数是无效的，直接忽略就可以了（这么说来`d[1001]`就够了，实测确实如此）。`d[i]`记录的是从`start`获得该数所需要的运算次数，默认为`-1`。

这样一来题目的结构就一目了然了。初始情况下将`start`入栈，此后每一轮循环都弹出顶部的值，对其与`nums[]`中的每一个数进行三则运算，将每一个数所需要的运算次数记录下来，并将结果入栈。这样采取循环的结构而非递归，能够大幅节约函数调用所需要的栈空间。

代码中`!~d[j]`的奇怪表示令我很不熟悉，经过一番思考，才明白这是判断`d[j]`是否为-1.

其实还可以对代码进行一下优化。我们只需要记录某一个数是否是经过运算得来的，并不需要显式地一一记录所需要的运算次数。因为每一轮外循环都只进行了一次运算。所以只需要一个计数变量记录即可。

简单优化后的代码如下：

```c++
class Solution {
    bool d[1001];
public:
    int minimumOperations(vector<int>& nums, int start, int goal) {
        memset(d,false,sizeof(d));
        queue<int> q;
        q.push(start);
        d[start] = true;
        int i,j,ans;
        int count = 1;
        while(!q.empty())
        {
            int size = q.size();
            for(int k=0; k<size; k++){
                i=q.front();
                q.pop();
                for(auto &c:nums)
                {
                    j=i+c;
                    if(j==goal)return count;
                    else if(j>=0&&j<=1000&&!d[j])
                    {
                        d[j]=true;
                        q.push(j);
                    }
                    j=i-c;
                    if(j==goal)return count;
                    else if(j>=0&&j<=1000&&!d[j])
                    {
                        d[j]=true;
                        q.push(j);
                    }
                    j=i^c;
                    if(j==goal)return count;
                    else if(j>=0&&j<=1000&&!d[j])
                    {
                        d[j]=true;
                        q.push(j);
                    }
                }
            }
            count++;
        }
        return -1;
    }
};
```

表面上是多加了一层循环，其实只是将弹栈的操作放到了中层循环而已。之所以这样做，是因为本轮开始时栈中元素经过运算的次数是相同的。如果额外加上一个计数变量来记录应该也是可以的。

小小总结：BFS+动态规划，解决看似不可能の暴力破解问题！

#### 同源字符串检测

To be continued...
