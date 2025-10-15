---
title: 三种堆的插入效率比较
date: 2021-03-28 13:25:57
tags: [Algorithm]
categories: [Algorithm]
---

这个小Research是ADS课上老师的一个探索性问题，本周没有编程作业，所以自己想练习一下。

<!--more-->

### 问题描述

问题是这样的：

>In the first three weeks we have been trying everything to maintain a balanced tree, in order to get the operations done efficiently. So it seems that the balanced trees are the good guys and the skew trees are the bad guys.
>
>But this week, we are gonna find out that sometimes, a skew tree can be the good guy, while a balanced tree is the worst case...
>
>Although there is no programming problems to solve on PTA for this week, still I'd suggest you to do some coding -- try to implement the ordinary heap, the leftist heap, and the skew heap, to compare their performance on a sequence of insertions. You may test them for random, increasing, and decreasing sequences; and at the mean time, vary the size of input from 100 to 1,000,000.

总的来说就是比较Leftist Heap, Skew Heap和普通的Heap即Priority Queue之间，在进行不同序列的插入时，所花的时间。

一般的思路就是比较时间，如果有可能的话可以画图表示。

### 贴代码

主程序:

```C
// main.c
#include "Ordinary_Heap.c"
#include "Leftist_Heap.c"
#include "Skew_Heap.c"
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main()
{
	int t;
	puts("0: increase, 1: decrease, 2: random");
	scanf("%d", &t);
	puts("Please wait...");
	FILE *fp, *output;
	switch(t){
		case 0:
			fp = fopen("increase.txt", "r");
   			output = fopen("Result_increase.txt", "w");
   			break;
   		case 1:
			fp = fopen("decrease.txt", "r");
   			output = fopen("Result_decrease.txt", "w");
   			break;
   		case 2:
			fp = fopen("random.txt", "r");
   			output = fopen("Result_random.txt", "w");
   			break;
   		default:
   			fp = fopen("random.txt", "r");
   			output = fopen("Result_random.txt", "w");
   			break;
	}

	if(!fp){
		puts("Cannot open file!");
		exit(1);
	}
	
	int M;
	for(M=0; M<100; M++){
		fseek(fp, 0, SEEK_SET);
	    clock_t start, finish;
	    double time;
	    /* Leftist Heap */
	    LHeap LH = NULL;
	    int N, i;
	    fscanf(fp, "%d", &N);
	    start = clock();
	    for(i=0; i<N; i++){
	        int t;
	        fscanf(fp, "%d", &t);
	        LH = LInsert(t, LH);
	    }
	    finish = clock();
	    time = (double) (finish-start)/CLOCKS_PER_SEC;
	    //LLevelOrderTraversal(LH, N);
	    fprintf(output, "%d    %f    ", M, time);
	    /* Leftist Heap ends */
	
	    /* Skew Heap */
	    fseek(fp, 0, SEEK_SET);
	     SHeap SH = NULL;
	//     int N, i;
	     fscanf(fp, "%d", &N);
	     start = clock();
	     for(i=0; i<N; i++){
	         ElementType t;
	         fscanf(fp, "%d", &t);
	         SH = SInsert(t, SH);
	     }
	     finish = clock();
	     time = (double) (finish-start)/CLOCKS_PER_SEC;
	     //SLevelOrderTraversal(SH, N);
	     fprintf(output, "%f    ", time);
	    /* Skew Heap ends */
	
	    /* Ordinary Heap */
	    fseek(fp, 0, SEEK_SET);
	     Heap OH = (Heap)malloc(sizeof(struct heap_struct));
	     fscanf(fp, "%d", &OH->Capacity);
	     OH->Elements = (ElementType*)malloc(sizeof(ElementType) * (OH->Capacity + 1));
	     OH->Size = OH->Capacity;
	     start = clock();
	     for(i=1; i<=OH->Size; i++){
	         fscanf(fp, "%d", &OH->Elements[i]);
	     }
	     for(i=OH->Size/2; i>0; i--){
	         Percolate_down(OH, i);
	     }
	     finish = clock();
	    // for(i=1; i<=OH->Size; i++)
	    //     printf("%d ", OH->Elements[i]);
	     time = (double) (finish-start)/CLOCKS_PER_SEC;
	     fprintf(output, "%f\n", time);
	     free(OH->Elements);
	     free(OH);
	    /* Ordinary Heap ends */
	}
	
	puts("Please check \"Result_xxx.txt\" for the results generated.");

    fclose(fp);
    fclose(output);
}
```

Leftist Heap:

```C
// Leftist_Heap.c
#include <stdio.h>
#include <stdlib.h>

typedef int ElementType;

struct lheap_node{
    ElementType Element;
    struct lheap_node *Left;
    struct lheap_node *Right;
    int Npl;
};
typedef struct lheap_node *LHeap;

LHeap LMerge(LHeap H1, LHeap H2);
LHeap LMerge1(LHeap H1, LHeap H2);
LHeap LInsert(ElementType X, LHeap H);
ElementType LDeletemin(LHeap H);
void LLevelOrderTraversal(LHeap H, int N);


LHeap LMerge(LHeap H1, LHeap H2)
{
    if(H1 == NULL)  return H2;
    if(H2 == NULL)  return H1;
    if(H1->Element < H2->Element)
        return LMerge1(H1, H2);
    else return LMerge1(H2, H1);
}
LHeap LMerge1(LHeap H1, LHeap H2)
{
    if(H1->Left == NULL)
        H1->Left = H2;
    else{
        H1->Right = LMerge(H1->Right, H2);
        if(H1->Left->Npl < H1->Right->Npl){
            LHeap t = H1->Right;
            H1->Right = H1->Left;
            H1->Left = t;
        }
        H1->Npl = H1->Right->Npl + 1;
    }
    return H1;
}
ElementType LDeletemin(LHeap H)
{
    ElementType ret = H->Element;
    LHeap tmp = H;
    H = LMerge(H->Left, H->Right);
    free(tmp);
    return ret;
}
LHeap LInsert(ElementType X, LHeap H)
{
    LHeap tH = (LHeap)malloc(sizeof(struct lheap_node));
    tH->Element = X;
    tH->Left = tH->Right = NULL;
    tH->Npl = 0;
    return LMerge(H, tH);
}
void LLevelOrderTraversal(LHeap H, int N)
{
    LHeap Q[N];
    int head, tail, size=0;
    if(H)
        Q[0] = H, size++, head=tail=0;
    while(size>0){
        LHeap t = Q[head];
        head = (head+1)%N;
        size--;

        if(t){
            printf("%d ", t->Element);
        }else{
            printf(". ");
        }
        if(t){
            tail = (tail+1)%N;
            Q[tail] = t->Left;
            tail = (tail+1)%N;
            Q[tail] = t->Right;
            size+=2;
        }
    }
}
```

Skew Heap:

```C
// Skew_Heap.c
#include <stdio.h>
#include <stdlib.h>

typedef int ElementType;
typedef struct sheap_node{
    ElementType Element;
    struct sheap_node *Left;
    struct sheap_node *Right;
} *SHeap;

SHeap SMerge(SHeap H1, SHeap H2);
SHeap SMerge1(SHeap H1, SHeap H2);
SHeap SInsert(ElementType X, SHeap H);
void SLevelOrderTraversal(SHeap H, int N);

SHeap SMerge(SHeap H1, SHeap H2)
{
    if(H1 == NULL)  return H2;
    if(H2 == NULL)  return H1;
    if(H1->Element < H2->Element)
        return SMerge1(H1, H2);
    else return SMerge1(H2, H1);
}
SHeap SMerge1(SHeap H1, SHeap H2)
{
    if(H1->Left == NULL)
        H1->Left = H2;
    else{
        H1->Right = SMerge(H1->Right, H2);
        
        SHeap t = H1->Right;
        H1->Right = H1->Left;
        H1->Left = t;
    }
    return H1;
}
SHeap SInsert(ElementType X, SHeap H)
{
    SHeap tmp = (SHeap)malloc(sizeof(struct sheap_node));
    tmp->Element = X;
    tmp->Left = tmp->Right = NULL;
    return SMerge(H, tmp);
}
void SLevelOrderTraversal(SHeap H, int N)
{
    SHeap Q[N];
    int head, tail, size=0;
    if(H)
        Q[0] = H, size++, head=tail=0;
    while(size>0){
        SHeap t = Q[head];
        head = (head+1)%N;
        size--;

        if(t){
            printf("%d ", t->Element);
        }else{
            printf(". ");
        }
        if(t){
            tail = (tail+1)%N;
            Q[tail] = t->Left;
            tail = (tail+1)%N;
            Q[tail] = t->Right;
            size+=2;
        }
    }
}
```

Ordinary Heap:

```C
// Ordinary_Heap.c
typedef int ElementType;
struct heap_struct{
    int Capacity;
    int Size;
    ElementType *Elements;
};
typedef struct heap_struct *Heap;
void Percolate_down(Heap H, int p)
{
    ElementType key=H->Elements[p];
    int i, child;
    for(i=p; i*2<=H->Size; i=child){
        child=i*2;
        if(child<H->Size && H->Elements[child+1]<H->Elements[child])
            child++;
        if(H->Elements[child]<key)
            H->Elements[i]=H->Elements[child];
        else break;
    }
    H->Elements[i]=key;
}
void Percolate_up(Heap H, int p)
{
    ElementType key=H->Elements[p];
    int i;
    for(i=p; key<H->Elements[i/2]; i/=2){   // H->Elements[0]=min(H->Elements[1~H->Size])
        H->Elements[i]=H->Elements[i/2];
    }
    H->Elements[i]=key;
}
```

最后还有一个生成大量测试数据的小程序：

```C
// TestCaseGenerator.c
#include <stdio.h>
#include <stdlib.h>
#define NUM (100000)
int main()
{
    // Random
    FILE *fp = fopen("random.txt", "w");
    int i;
    fprintf(fp, "%d\n", NUM);
    for(i=0; i<NUM; i++){
        fprintf(fp, "%d ", rand());
    }
    fclose(fp);

    // Increasing
    fp = fopen("increase.txt", "w");
    fprintf(fp, "%d\n", NUM);
    for(i=0; i<NUM; i++){
        fprintf(fp, "%d ", i);
    }
    fclose(fp);

    //Decreasing
    fp = fopen("decrease.txt", "w");
    fprintf(fp, "%d\n", NUM);
    for(i=NUM; i>0; i--){
        fprintf(fp, "%d ", i);
    }
    fclose(fp);
}
```

如果要改变数据的规模，只要修改宏就好了。

---

最后可以生成三个文件：`Result_increase.txt`, `Result_decrease.txt`, `Result_random.txt`.

将三个文件分别导入Origin的普通Workbook中，并选择生成Line图像。

Increase:

![Increase](https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/Increase.png)

Decrease:

![Decrease](https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/Decrease.png)

Random:

![](https://cdn.jsdelivr.net/gh/colored-dye/Pics@main/Random.png)

### 结论

1.  Priority Queue在每种输入序列下，速度都是最快的。
2.  总的来说，Leftist Heap与Skew Heap在处理三种输入序列的情况下速度无显著差异。尤其是递减序列，两者几乎重合。处理递增序列时，Skew Heap有极其微弱的优势；而处理随机序列时，Leftist Heap又稍占上风。



P.S: 好像并没有得到什么明显的结论。虽然Skew Heap实现起来稍微简单一些，但是与Leftist Heap的代码几乎没什么差别啊！我实现Skew Heap就是把Leftist Heap的代码拿过来删了点而已……桑心QAQ

