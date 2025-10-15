---
title: LeetCode-005-Binary Search
date: 2021-10-04 19:30:42
tags: [Algorithm, LeetCode]
categories: [Algorithm, LeetCode]
mathjax: true
---

当我磕磕绊绊地从“算法入门”学习计划中走入“算法基础”学习计划时，本被看作是简单题型的二分查找给我难住了(ノへ￣、) 特此记录一下遇到困难的二分查找题目以供日后参考学习\~

<!--more-->

#### 1. Search in Rotated Sorted Array

https://leetcode-cn.com/problems/search-in-rotated-sorted-array/

题目的说法有一点别扭：所谓的“rotated”到底是什么意思呢？这个翻转可与红黑树的红黑树没有半毛钱关系，就将它理解为是将一个数组`arr[n]`向左循环移位`k`次即可($1 \le k \lt n$).

一个数组初始时已经按照升序排好序了，然后经过上述的“翻转”过程后作为输入。比如说，一个数组本来是`[1, 2, 3, 4, 5]`，结果给我们的是`[4, 5, 1, 2, 3]`。要求我们在$O(logn)$的时间复杂度下，找到目标元素在数组中的下标，如果找不到就返回-1.

既然是$O(logn)$的时间复杂度，很容易想到的就是二分查找。但是由于给定数组的特殊结构，我们需要对二分查找的算法加亿点改动。

首先可以得到这样一个结论：任何一个翻转过的数组，从中间分开成两部分中总有其中一个是排好序的。比如说给定`[5, 6, 7, 1, 2]`，可以把他从中间分成两部分：`[5, 6]`和`[7, 1, 2]`。而分辨一个数组是翻转数组还是有序数组很简单：只需要比较首末两个元素的大小。如果`arr[0] <= arr[n-1]`，那么就是有序的，反之就是无序的。

我们接下来要做的，就是想办法找到一个包含着目标元素、且有序的子序列(sub-array)。

首先找到有序的那一半序列。如果目标在有序的一部分中，就可以将范围缩小到有序的那一半中；反之，就需要继续在翻转序列中缩小范围。其实与二分查找的思想别无二致。

放代码\~

```c++
class Solution {
public:
    int search(vector<int>& nums, int target) {
        if(nums.size() == 0)
            return -1;
        if(nums.size() == 1)
            return (target == nums[0]) ? 0 : -1;
        int left, right, mid;
        left = 0, right = nums.size() - 1;
        while(left <= right){
            mid = (left + right) >> 1;
            if(nums[mid] == target)
                break;
            if(nums[0] <= nums[mid]){
                if(nums[0] <= target && target < nums[mid])
                    right = mid - 1;
                else left = mid + 1;
            }else{
                if(nums[mid] < target && target <= nums[nums.size() - 1])
                    left = mid + 1;
                else right = mid - 1;
            }
        }
        if(left <= right)
            return mid;
        else
            return -1;
    }
};
```

其中很tricky的地方就是等号的位置。需要仔细的思考和测试才能决定。比如说`if(nums[0] <= nums[mid])`这里的小于等号，如果换成小于号，就无法处理`[3, 1]`这样的情况。类似地还有`if(nums[0] <= target && target< nums[mid])`和`if(nums[mid] < target && target <= nums[nums.size() - 1])`当中的小于等于号，都是为了能够处理边界位置。

