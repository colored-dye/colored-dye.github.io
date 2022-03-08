---
title: LeetCode-003-DP-02
date: 2021-09-22 14:48:18
tags: [Algorithm, LeetCode]
categories: [Algorithm, LeetCode]
mathjax: true
---

这几天又做了几道动态规划的题，在这里记录一下个人感觉比较有价值的思路~

<!--more-->

##### 1. Word Break

链接：https://leetcode-cn.com/problems/word-break/

这道题先给出了一个字符串`s`和一个“字典”向量`wordDict[]`，要求使用给出的字典对字符串进行匹配。如果字符串能且仅能完全被字典中的字符串表示，那么要求结果返回`true`，否则返回`false`. 需要注意的是，字典中的字符串可以使用多次。  

这里题目给出了一个非常有意思的样例：

```
Input: s = "catsandog"
wordDict = [
	"cats", "dog", "sand", "and", "cat"
]
Output: false
```

像“catsandog”这样的，前一个字符串的最后一个字符作为后一个字符串开头的字符，的字符串是不符合要求的。

我们可以用一个布尔类型的`dp[]`数组，`dp[i]`的含义是：下标从0到`i-1`的字符串是否可以被字典表示。为了得到`dp[i]`，我们需要依次检验`0 ~ j-1`和`j ~ i-1` ($1 \le j \le i$) 是否能被字典表示。如果`dp[j] == false`，那么就不需要检验`j ~ i-1`子串了。

初值`dp[0]`表示空字符串，应当为`true`，否则下面代码就无法检验从0开始的子串了。

抛代码：

```c++
class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> wordDictSet(wordDict.begin(), wordDict.end());

        vector<bool> dp(s.size() + 1);
        dp[0] = true;

        for (int i=1; i<=s.size(); i++){
            for (int j=i; j>=0; j--){
                if(dp[j] && wordDictSet.find(s.substr(j, i-j)) != wordDictSet.end()){
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[s.size()];
    }
};
```

在题解的用户评论里，我看到有人提到一种优化：在上面的解法的基础上，其实不需要检查`0 ~ i-1`的所有子串，只需要看`i - maxlen ~ i-1`就好了，其中`maxlen`为字典里最大子串长度。对应到代码里，只需要替换一下循环的条件即可：

```c++
for(int j=i; j>=0 && j > i-maxlen; j--){
    // ...
}
```

##### 2.  Decode Ways

https://leetcode-cn.com/problems/decode-ways

A-Z的26个字母可以被依次编码为1~26的数字，但是给出一个数字串，我们不能保证解码的结果唯一（其实这里涉及到编码学的问题了，因为不太懂所以不做展开OwO）。比如给出“10921”，可以按照“10 9 2 1”、“10 9 21”解码，但是“0”无法对应任何字母。

题目要求判断给出的一个数字串可以以多少种不同的方式解码。

这道题在当初学动态规划时做过类似的，但是当时的题编码是从0到25，不存在无法解码的情况。但是基本的思路是一致的。

我们可以把解码的几种情形列举一下：

1.   “0”：不能解码。
2.   “x”：1~9，都可以单独解码为一个字母。
3.   “1x”：10~19的任何数字都可以解码为一个字母。
4.   “2x”：这里又有两种情况：
     1.   20~26：单独解码为一个字母。
     2.   27~29：只能解码为两个字母。

如果使用数组`dp[n]`，其中`dp[i]`表示`0 ~ i`的解码方式数量，那么可以给出下面的状态转移方程：

1.   `s[i] == 0`
     1.   `s[i-1] == 1 / 2`：$dp[i] = dp[i-2]$，0必须与前面的数字组合。
     2.   `s[i-1] >= 2`：$dp[i] = 0$，错误编码。
2.   `s[i] != 0`
     1.   `s[i-1] == 1`：$dp[i] = dp[i-1] + dp[i-2]$，对应情况3.
     2.   `s[i-1] == 2 && s[i] <= 6`：$dp[i] = dp[i-1] + dp[i-2]$，对应情况4.1.
     3.   `s[i-1] == 2 && s[i] >= 7 `或`s[i-1] == 0`或`s[i-1] >= 3`：$dp[i] = dp[i-1]$，其他情况，编码方式不增加。

代码如下：

```c++
class Solution {
public:
    int numDecodings(string s) {
        // 102427
        int n = s.size();
        vector<int> dp(n + 1);
        int i, j;
        if(s[0] != '0')
            dp[0] = dp[1] = 1;

        for(i=2, j=1; i<=n; i++, j++){
            if(s[j] == '0'){
                if(s[j-1] >= '1' && s[j-1] <= '2')
                    dp[i] = dp[i-2];
                else dp[i] = 0;
            }else{
                if(s[j-1] == '1'){
                    dp[i] = dp[i-1] + dp[i-2];
                }else if(s[j-1] == '2' && s[j] <= '6')
                    dp[i] = dp[i-2] + dp[i-1];
                else
                    dp[i] = dp[i-1];
            }
        }
        return dp[n];
    }
};
```

##### 3. Matrix Block Sum

https://leetcode-cn.com/problems/matrix-block-sum

题目给出mxn的矩阵`mat[][]`，并给定一个常数`k`，要求返回一个相同规模的矩阵`answer[][]`，其中`answer[i][j]`是满足下列条件的所有`mat[r][c]`的和：

-   $i - k \le r \le i + k$.
-   $j - k \le c \le j + k$.
-   $(r, c)$是矩阵中合法的下标.

其实就是求`mat[][]`中以`(r, c)`为中心的、边长为`2k`的正方形内所有元素的和。

这道题的特殊之处在于介绍了 **“前缀和(Prefix Sum)”** 的算法。下面先来介绍一下前缀和到底是什么。

最简单的就是一维前缀和，比如给出数组`arr[n]`，那么我们可以得到相应的前缀和数组`sum[n]`，其中$sum[i] = \sum_{0 \le j \le i}{arr[j]}$. 而求`sum[]`的过程很自然地可以运用到动态规划的思想，因为$sum[i] = sum[i-1] + arr[i]$.

二维前缀和可以表示成`sum[m][n]`，对应的初始矩阵是`mat[m][n]`. 仿照一维前缀和可以写出：$sum[i][j] = \sum_{0 \le p \le i, 0 \le q \le j}{mat[p][q]}$. 二维前缀和同样可以运用动态规划思想。为了解决这个问题，我们可以用几何语言来表示。

<img src="https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/LeetCode-003/mat.png" style="zoom:50%;" />

如上图所示，蓝色部分为`dp[i-1][j-1]`，为了求较大的`dp[i][j]`，我们可以适当利用一下容斥原理。蓝色和绿色部分为`dp[i][j-1]`，蓝色和红色部分为`dp[i-1][j]`，所以`dp[i][j] = dp[i-1][j] + dp[i][j-1] - dp[i-1][j-1] + mat[i][j]`.

以上的公式只适用于一般情况。当`i == 0`时，`dp[i][j] = dp[i][j-1] + mat[i][j]`；当`j == 0`时，`dp[i][j] = dp[i-1][j] + mat[i][j]`.

而前缀和的用处，主要在于利用已求得的前缀和，在$O(1)$的时间内求出想要的单项结果。这对于静态查询是很有效的。

接下来回到原题上来\~ 我们想要得到的是某个元素周围、边长为`2k`的正方形范围内的所有元素和，那么我们可以给出这样的公式：

$$
answer[i][j] = dp[i+k][j+k] - dp[i+k][j-k-1] - dp[i-k-1][j+k] + dp[i-k-1][j-k-1]
$$

在以上前缀和以及公式的基础上，写出代码就很简单了：

```c++
class Solution {
private:
    int m, n;
public:
    int get(vector<vector<int>> &prefixSum, int x, int y) {
        if(x < 0 || y < 0)
            return 0;
        if(x >= m)
            x = m-1;
        if(y >= n)
            y = n-1;
        return prefixSum[x][y];
    }
    vector<vector<int>> matrixBlockSum(vector<vector<int>>& mat, int k) {
        m = mat.size(), n = mat[0].size();
        vector<vector<int>> prefixSum(m, vector<int>(n));
        int i, j;
        for(i=0; i<m; i++){
            for(j=0; j<n; j++){
                if(i && j)
                    prefixSum[i][j] = prefixSum[i-1][j] + prefixSum[i][j-1] - prefixSum[i-1][j-1] + mat[i][j];
                else if(i && !j)
                    prefixSum[i][j] = prefixSum[i-1][j] + mat[i][j];
                else if(!i && j)
                    prefixSum[i][j] = prefixSum[i][j-1] + mat[i][j];
                else
                    prefixSum[i][j] = mat[i][j];
            }
        }

        vector<vector<int>> ans(m, vector<int>(n));
        for(i=0; i<m; i++){
            for(j=0; j<n; j++){
                ans[i][j] = get(prefixSum, i+k, j+k) - get(prefixSum, i+k, j-k-1) - get(prefixSum, i-k-1, j+k) + get(prefixSum, i-k-1, j-k-1);
            }
        }
        return ans;
    }
};
```

这里加了一个`get()`函数，用于处理`i+k`和`i-k-1`超出矩阵范围的情况。
