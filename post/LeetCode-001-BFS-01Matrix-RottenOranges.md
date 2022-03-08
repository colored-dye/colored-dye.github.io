---
title: 'LeetCode做题记录001 BFS: 01Matrix&RottenOranges'
date: 2021-09-15 16:53:38
tags: [Algorithm, LeetCode]
categories: [Algorithm, LeetCode]
mathjax: true
---

最近开始刷Leetcode辣\~在一周前，我开始了“算法”和“动态规划”学习计划(希望能够坚持住QwQ)今天做到了两道基本思路一致的BFS相关的题，感觉比较典型，特此记录\~

<!--more-->

#### 01Matrix

第一道题叫做“01Matrix” (https://leetcode-cn.com/problems/01-matrix/). 顾名思义，题目给出m×n的矩阵`mat[][]`，矩阵中的每个元素都是0或1.要求给出一个相同规模的矩阵，暂且命名为`ret[][]`，`ret[i][j]`的含义是`mat[i][j]`到最近的0元素的距离。这个距离不是直线距离，而是一个一个格子走的距离。

比如说下面这个矩阵：

<img src="https://assets.leetcode.com/uploads/2021/04/24/01-2-grid.jpg" style="zoom:67%;" />

返回值的矩阵为：

```c
ret[][] = {
    {0, 0, 0},
    {0, 1, 0},
    {1, 2, 1}
}
```

我最初的思路是对每一个元素都进行一次完整的BFS，但是题解给出的思路有点类似动态规划。话不多说，先上代码：

```c++
class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& matrix) {
        const int dx[] = {1, 0, 0, -1};
        const int dy[] = {0, 1, -1, 0};
        int m = matrix.size(), n = matrix[0].size();
        vector<vector<int>> dist(m, vector<int>(n));
        vector<vector<int>> seen(m, vector<int>(n));
        queue<pair<int, int>> q;
        // 将所有的 0 添加进初始队列中
        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (matrix[i][j] == 0) {
                    q.emplace(i, j);
                    seen[i][j] = 1;
                }
            }
        }

        // 广度优先搜索
        while (!q.empty()) {
            auto [i, j] = q.front();
            q.pop();
            for (int d = 0; d < 4; ++d) {
                int ni = i + dx[d];
                int nj = j + dy[d];
                if (ni >= 0 && ni < m && nj >= 0 && nj < n && !seen[ni][nj]) {
                    dist[ni][nj] = dist[i][j] + 1;
                    q.emplace(ni, nj);
                    seen[ni][nj] = 1;
                }
            }
        }

        return dist;
    }
};
```

上面的代码使用了`dist[][]`和`seen[][]`矩阵，前者是返回值，而后者表示某一元素是否已被计算，以避免重复。

代码的关键之处在于，先将所有的0元素入队并标记已处理，再按队列顺序依次处理每次出队的元素周围（四个方向上）的元素，而这些新加入的元素在距离上一定是比当前元素大1的。即：$dist[ni][nj] = dist[i][j] + 1, \forall (ni, nj) adjacent \space to (i, j)$. 或者也可以把0元素看作一个整体，BFS的过程其实就是“一层一层”地远离这个整体同时记录距离的过程。

----

#### Rotten Oranges

接下来来看另一道题：“Rotten Oranges” (https://leetcode-cn.com/problems/rotting-oranges/). 同样，题目给出了mxn的矩阵，其中至少有一个烂橘子，有几个新鲜橘子，还有几个空位什么都不放。烂橘子每分钟可以把四个方向上相邻的新鲜橘子变成烂橘子，随着时间推移，会有越来越多的橘子烂掉，但是也有可能有一些橘子不会烂。如果橘子可以全烂掉，就需要给出所需的时间；否则就返回-1.(2表示烂橘子，1表示新鲜橘子，0表示空位)

联系之前的01矩阵问题，其中`dist[][]`矩阵中的最大值其实就是所需的时间，那么便有了题解中的答案：

```c++
class Solution {
    int cnt;
    int dis[10][10];
    int dir_x[4]={0, 1, 0, -1};
    int dir_y[4]={1, 0, -1, 0};
public:
    int orangesRotting(vector<vector<int>>& grid) {
        queue<pair<int,int> >Q;
        memset(dis, -1, sizeof(dis));
        cnt = 0;
        int n=(int)grid.size(), m=(int)grid[0].size(), ans = 0;
        for (int i = 0; i < n; ++i){
            for (int j = 0; j < m; ++j){
                if (grid[i][j] == 2){
                    Q.push(make_pair(i, j));
                    dis[i][j] = 0;
                }
                else if (grid[i][j] == 1) cnt += 1;
            }
        }
        while (!Q.empty()){
            pair<int,int> x = Q.front();Q.pop();
            for (int i = 0; i < 4; ++i){
                int tx = x.first + dir_x[i];
                int ty = x.second + dir_y[i];
                if (tx < 0|| tx >= n || ty < 0|| ty >= m|| ~dis[tx][ty] || !grid[tx][ty]) continue;
                dis[tx][ty] = dis[x.first][x.second] + 1;
                Q.push(make_pair(tx, ty));
                if (grid[tx][ty] == 1){
                    cnt -= 1;
                    ans = dis[tx][ty];
                    if (!cnt) break;
                }
            }
        }
        return cnt ? -1 : ans;
    }
};
```

总体思路是总将烂橘子入队，并逐渐记录传播的距离（也就是时间）。

我的结构与题解不太一样，但是基本思路是一致的：

```c++
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        const int dx[] = {1, 0, 0, -1};
        const int dy[] = {0, 1, -1, 0};
        const int m = grid.size();
        const int n = grid[0].size();
        int num = 0;
        int tmpnum = 0;
        vector<vector<int>> rotten(grid);
        int minutes = 0;
        queue<pair<int, int>> q;
        int i, j;
        for(i=0; i<m; i++){
            for(j=0; j<n; j++){
                if(grid[i][j]){
                    if(grid[i][j] == 2){
                        tmpnum++;
                    }
                    num++;
                }
            }
        }

        int old_tmpnum = -1;
        while(tmpnum < num && old_tmpnum != tmpnum){
            old_tmpnum = tmpnum;
            for(i=0; i<m; i++){
                for(j=0; j<n; j++){
                    if(rotten[i][j] == 2){
                        q.emplace(i, j);
                    }
                }
            }
            while(!q.empty()){
                auto [i, j] = q.front();
                q.pop();
                int d;
                if(rotten[i][j] == 2){
                    for(d=0; d<4; d++){
                        int x = i + dx[d];
                        int y = j + dy[d];
                        if(x >= 0 && x < m && y >= 0 && y < n && rotten[x][y] == 1){
                            rotten[x][y] = 2;
                            tmpnum++;
                        }
                    }
                }
            }
            minutes++;
        }

        if(old_tmpnum == tmpnum)
            return -1;
        else return minutes;
    }
};
```

上面代码其实有一点问题：我用了`tmpnum`变量记录上一轮循环中烂橘子的数量，当进行最后一轮循环时，橘子数量不会增加，以此作为结束判定条件之一。但是这样一来就会多进行一轮计算（至少答案提交是正确的~，就是慢了点~(～￣▽￣)～

#### 小小总结

1.   学习了C++`vector`变量初始化方法。
2.   复习了BFS算法的思想和基本结构。
3.   学习解题思路转换（1到0的距离问题转化成0到1的距离问题）。
