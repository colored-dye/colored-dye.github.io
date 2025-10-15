---
title: "LeetCode-004 最长回文子串"
date: 2021-09-23 20:07:24
tags: [Algorithm, LeetCode]
categories:	[Algorithm, LeetCode]
mathjax: true
---

最长回文子串(https://leetcode-cn.com/problems/longest-palindromic-substring/) 是一道很经典的题目\~ 我们比较容易想到的就是动态规划的方法，但是在动态规划的基础上可以进一步（其实是进两步）优化！本文主要就来介绍最长回文子串的三种解题思路\~

<!--more-->

#### 1. 简单粗暴的动态规划

如果我们有了一个回文子串，并用其首尾下标`i`、`j`来表示：`s[i:j]`，那么在此基础上，可以检验更长的字符串`s[i-1:j+1]`是不是回文字符串。这就是本题中动态规划转移方程的基本思想。

为了能够用首尾的下标来表示一个字符串，我们可以利用布尔类型的二维数组`dp[][]`，`dp[i][j]`表示以`i`开头、以`j`结尾的字符串是否是回文字符串。但是需要注意的是$i \le j$，否则就没有意义了。

转移方程：$dp[i][j] = dp[i+1][j-1] \and (s[i] == s[j])$.

由于计算`dp[i][j]`时用到了`dp[i+1][j-1]`，所以需要注意计算过程中`i`的顺序。

至于初值，单个字母肯定是回文字符串。但是只给出单个字母是不够的，因为在转移方程中，我们每次最多只能增加两个字符，结果就只会产生奇数长度的字符串。所以还需要对相邻两个字符是回文的情况做初始化处理。

本人的代码虽然用到了动态规划，但是速度很慢QAQ：

```c++
class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size();
        vector<vector<bool>> dp(n, vector<bool>(n));
        int start, end;
        start = end = 0;
        for(int i=0; i<n; i++){
            dp[i][i] = true;
            if(i < n-1){
                if((dp[i][i+1] = (s[i] == s[i+1])) && end-start == 0){
                    start = i;
                    end = i+1;
                }
            }
        }
        // dp[i][j] = dp[i+1][j-1] && (s[i] == s[j])
        for(int i=n-2; i>=0; i--){
            for(int j=i+1; j<n; j++){
                if(i+1 <= j-1 && (dp[i][j] = dp[i+1][j-1] && (s[i] == s[j])) && j-i > end-start){
                    start = i;
                    end = j;
                }
            }
        }
        // for(int i=0; i<n; i++){
        //     for(int j=0; j<n; j++){
        //         printf("%d ", dp[i][j]? 1 : 0);
        //     }
        //     putchar('\n');
        // }
        return s.substr(start, end-start+1);
    }
};
```

而下面是题解中给出的代码：

```c++
#include <iostream>
#include <string>
#include <vector>

using namespace std;

class Solution {
public:
    string longestPalindrome(string s) {
        int n = s.size();
        if (n < 2) {
            return s;
        }

        int maxLen = 1;
        int begin = 0;
        // dp[i][j] 表示 s[i..j] 是否是回文串
        vector<vector<int>> dp(n, vector<int>(n));
        // 初始化：所有长度为 1 的子串都是回文串
        for (int i = 0; i < n; i++) {
            dp[i][i] = true;
        }
        // 递推开始
        // 先枚举子串长度
        for (int L = 2; L <= n; L++) {
            // 枚举左边界，左边界的上限设置可以宽松一些
            for (int i = 0; i < n; i++) {
                // 由 L 和 i 可以确定右边界，即 j - i + 1 = L 得
                int j = L + i - 1;
                // 如果右边界越界，就可以退出当前循环
                if (j >= n) {
                    break;
                }

                if (s[i] != s[j]) {
                    dp[i][j] = false;
                } else {
                    if (j - i < 3) {
                        dp[i][j] = true;
                    } else {
                        dp[i][j] = dp[i + 1][j - 1];
                    }
                }

                // 只要 dp[i][L] == true 成立，就表示子串 s[i..L] 是回文，此时记录回文长度和起始位置
                if (dp[i][j] && j - i + 1 > maxLen) {
                    maxLen = j - i + 1;
                    begin = i;
                }
            }
        }
        return s.substr(begin, maxLen);
    }
};
```

应该是由于我对第二个循环的内循环做了更严格的限制，所以本人的代码运行了608ms，而题解代码运行了676ms.

以上两段代码的时间复杂度均为$O(n^2)$，空间复杂度均为$O(n^2)$. 如此看来，要想进一步优化，还需要在核心思想上下功夫。

#### 2. 中心扩展算法

所谓“中心扩展算法”，指的就是从单个字符或相邻一对字符出发，按照动态规划的方式，在现有的回文字符串两端增加字符，直到新字符不满足回文条件为止。

```c++
class Solution {
public:
    pair<int, int> expandAroundCenter(const string& s, int left, int right) {
        while (left >= 0 && right < s.size() && s[left] == s[right]) {
            --left;
            ++right;
        }
        return {left + 1, right - 1};
    }

    string longestPalindrome(string s) {
        int start = 0, end = 0;
        for (int i = 0; i < s.size(); ++i) {
            auto [left1, right1] = expandAroundCenter(s, i, i);
            auto [left2, right2] = expandAroundCenter(s, i, i + 1);
            if (right1 - left1 > end - start) {
                start = left1;
                end = right1;
            }
            if (right2 - left2 > end - start) {
                start = left2;
                end = right2;
            }
        }
        return s.substr(start, end - start + 1);
    }
};
```

可以看出，时间复杂度没有明显提高，但是空间复杂度缩小到了$O(1)$.

#### 3. Manacher算法

先讨论长度为奇数的字符串。这里需要定义一个概念：臂长(arm length)，就是指以一个字符为中心，两边分别延伸相同的长度。如位置`j`的臂长为`len`，那么这个字符串长度为`2*len + 1`. 臂长的概念放在上面的中心扩展算法中可能会更好理解。

```c++
class Solution {
public:
    int expand(const string& s, int left, int right) {
        while (left >= 0 && right < s.size() && s[left] == s[right]) {
            --left;
            ++right;
        }
        return (right - left - 2) / 2;
    }

    string longestPalindrome(string s) {
        int start = 0, end = -1;
        string t = "#";
        for (char c: s) {
            t += c;
            t += '#';
        }
        t += '#';
        s = t;

        vector<int> arm_len;
        int right = -1, j = -1;
        for (int i = 0; i < s.size(); ++i) {
            int cur_arm_len;
            if (right >= i) {
                int i_sym = j * 2 - i;
                int min_arm_len = min(arm_len[i_sym], right - i);
                cur_arm_len = expand(s, i - min_arm_len, i + min_arm_len);
            } else {
                cur_arm_len = expand(s, i, i);
            }
            arm_len.push_back(cur_arm_len);
            if (i + cur_arm_len > right) {
                j = i;
                right = i + cur_arm_len;
            }
            if (cur_arm_len * 2 + 1 > end - start) {
                start = i - cur_arm_len;
                end = i + cur_arm_len;
            }
        }

        string ans;
        for (int i = start; i <= end; ++i) {
            if (s[i] != '#') {
                ans += s[i];
            }
        }
        return ans;
    }
};
```

`right`变量记录了字符串的最大下标。由于`right`最大为`n`，所以时间复杂度为$O(n)$，而空间复杂度为$O(n)$. 时间复杂度相比于前两种算法有显著提高。

`i_sym`表示`i`关于`j`对称的位置。`arm_len[]`数组记录了某个回文字符串首字母处对应的臂长。

该算法的核心在于，臂长的计算可以通过动态规划的思想得到简化。如果我们已经有了位置`j`处的臂长`len`，下一位置为`i`，并且`j + len > i`，如下图：

<img src="https://assets.leetcode-cn.com/solution-static/5/5_fig1.png" style="zoom: 50%;" />

`i`关于`j`的对称点`2*j-i`处的臂长`n = arm_len[2*j-i]`，那么可以推测得出，`i`处的臂长至少为`min(j+len-i, n)`，并在此基础上进行臂长的扩展。

代码中加了`‘#’`的特殊处理，是为了使得算法适用于偶数长度的字符串，因为偶数长度的字符串会添加奇数个`‘#’`，而奇数长度的字符串会添加偶数个`‘#’`，从而避免了算法不适用的问题。

#### 小小总结

前两个算法的思路基本相同，并且比较直观易懂，而第三个算法明显较复杂、难以理解，尤其是利用对称点求最小可能臂长的思想，技巧性太强了QAQ。就个人来讲，从第一种算法到第二种算法的空间复杂度优化是很值得借鉴的。
