---
title: "Java 01: JavaSE"
date: 2022-10-20T09:19:24+08:00
draft: false
tags: ["Java"]
categories: ["Java"]
---

<!--more-->

## 0. 数据类型/关键字

1.   `char`

     在保存Unicode字符时，有时需要1个`char`，有时需要多个`char`. 所以Unicode的基本单位是“code point”，以“U+”开头，共分为17个“code plane”，其中经典的字符(U+0000 - U+FFFF)在第一个code plane中。

     `char`描述的就是UTF-16编码中的“code unit”.

2.   `strictfp`

     要求一个方法或一个类中的所有方法在所有的浮点数运算中执行严格的浮点数运算。如果不添加这个关键字，则Java会将浮点数运算的中间结果截断，以避免指数溢出，但是这一操作会影响执行效率。

3.   `short`, `int`, `long`

     Java无unsigned类型。

4.   `BigInteger`

     ```java
     BigInteger a = BigInteger.valueOf(100);
     BigInteger b = BigInteger.valueOf(1);
     BigInteger c = a.add(b);
     ```

5.   

## 1. 运算符和表达式

1.   算术右移和逻辑右移

     `>>>`是逻辑右移，`>>`是算术右移。

2.   运算符连接性

     |                   操作符                    |      连接性       |
     | :-----------------------------------------: | :---------------: |
     |     [] . () (method call) Left to right     |   Left to right   |
     | ! ~ ++ -- + (unary) - (unary) () (cast) new | **Right to left** |
     |                    * / %                    |   Left to right   |
     |                     + -                     |   Left to right   |
     |                  << >> >>>                  |   Left to right   |
     |            < <= > >= instanceof             |   Left to right   |
     |                    == !=                    |   Left to right   |
     |                      &                      |   Left to right   |
     |                      ^                      |   Left to right   |
     |                     \|                      |   Left to right   |
     |                     &&                      |   Left to right   |
     |                    \|\|                     |   Left to right   |
     |                     ?:                      | **Right to left** |
     |   = += -= \*= /= %= &= = ^= <<= >>= >>>=    | **Right to left** |

     


## 2. 字符串类

`String`类是Unicode字符序列，不可变。

1.   Substring: `String t = s.substring(start, len);`

2.   Concatenation:

     ```java
     String s = s1 + s2;
     String r = String.join(s1, s2, s3, s4);
     ```

3.   Equality: 不能直接使用`==`.

     ```java
     s.equals(t);
     s.equalsIgnoreCase(t);
     s.compareTo(t); // 类似于strcmp(s, t)
     ```

4.   空字符串：`s.equals("");` / `s.length() == 0`

5.   Index: `s.charAt(i)`

6.   Code points and code units:

     `length()`方法返回的是UTF-16编码的code unit数量，即`char`的数量。

     `codePointCount(start, len)`方法返回的是UTF-16编码的code point个数。

     `offsetByCodePoint(index, offset)`返回的是从index处偏移offset个code point的索引。

7.   构建字符串：`StringBuilder`/`StringBuffer`.

     `StringBuffer`适合多线程。

     ```java
     StringBuilder builder = new StringBuilder();
     builder.append(char/String);
     builder.insert(offset, char/String);
     String result = builder.toString();
     // StringBuffer用法类似
     ```

## 3. Input & Output

1.   Input: `java.util.Scanner`

     ```java
     Scanner in = new Scanner(System.in);
     String s = in.nextLine();
     s = in.next(); // delimited by whitespace
     int i = in.nextInt();
     while(in.hasNext) {
         s = in.next();
     }
     ```

2.   File input & output

     ```java
     Scanner in = new Scanner(Paths.get("1.txt"), "UTF-8");
     PrintWriter out = new PrintWriter("2.txt", "UTF-8");
     ```

## 4. 控制流

1.   循环

     可以`break label;`，跳出嵌套循环。

     ```java
     label1:
     while(true){
         while(true) {
             if(...) {
                 break label1;
             }
         }
     }
     ```

2.   

## 5. Array

1.   Ragged arrays

     可以创建多维不同长度的数组。

     ```java
     int[][] a = new int[2][];
     a[0] = new int[10];
     a[1] = new int[3];
     ```

2.   Array copying

     ```java
     int[] copied = Arrays.copyOf(arr, len);
     ```

3.   Array sorting

     ```java
     Arrays.sort(arr);
     ```

4.   

## 6. Java运行环境

1.   命令行参数

     第0个参数不是类名，而是类之后的第一个参数。

2.   Static import

     加上`static`后import，就不需要前缀了。

     ```java
     import static java.lang.System.*;
     //...
     out.println("Hello");
     //...
     ```

3.   Package

     在代码第一行写`package xxx;`，并将代码文件按照路径保存。

     如`Employee.java`是`package com.horstmann.corejava`的类，则路径为`cpm/horstmann/corejava/Employee.java`.

4.   

## 7. OOP

1.   类与类之间的关系

     1.   Dependence: 使用关系

          `Order`类使用`Account`类的信息。

     2.   Aggregation: 包含关系

          `Order`类包含有`Item`类的对象。

     3.   Inheritance: 继承关系

          `RushOrder`类是`Order`类的派生类。

2.   Mutator and Accessor Methods

     两种方法的区别在于是否会改变对象本身。Accessor method类似于C++中的`const`方法。

3.   Constructor

     -   在一个构造器内部可以调用重载的另一个构造器。

     -   派生类可以调用父类构造器：`super(...);`

4.   Initialization Blocks

     在类内部定义的一个代码块，在构造器调用之前调用它。

     也可以将其修饰为`static`，则只会在第一个实例创建时调用一次。

5.   Final instance fields

     要求在构造器结束运行时必须设置这个成员。

6.   Destruction and finalize method

     `finalize`方法会在对象资源释放前调用，但是无法保证gc何时回收。

7.   权限

     private < default < protected < public.

     |   范围    | 同一类 | 同包中类 | 不同包子类 | 其他包中类 |
     | :-------: | :----: | :------: | :--------: | :--------: |
     |  private  |   √    |          |            |            |
     |  default  |   √    |    √     |            |            |
     | protected |   √    |    √     |     √      |            |
     |  public   |   √    |    √     |     √      |     √      |

8.   Class path

     设置搜索class文件的路径。

     `java -cp xxx:xxx:xxx` MyClass

9.   Overriding methods(Polymorphism)

     基类指针指向派生类，自动调用的是派生类的同名方法。

10.   阻止继承：Final classes/methods

      ```java
      public final class Executive entends Manager {
          //...
      }
      ```

      如果用`final`修饰方法，则这个方法无法被子类重载。

11.   `instanceof`: 判断一个对象是否是一个类的实例

      ```java
      if(staff instanceof Manager) {
          //...
      }
      ```

      常用于在强制类型转换前检查。

12.   Abstract Classes

      抽象类可以定义抽象方法，强制要求其派生类实现该方法。

13.   

## 8. 反射

反射指的是程序可以分析类的能力。可以用来：

-   在运行时分析类的能力
-   在运行时查看对象，如写出单个适用于所有类的`toString()`方法
-   实现通用的数组操纵代码
-   像C++中操纵函数指针一样利用Method对象

1.   `Class`类

     Java运行时会为所有对象维护runtime type identification，用来跟踪每个对象属于哪个类。

     `Class`类用于描述一个类型/类。

     可以通过类名获得一个对应`Class`类的对象：

     ```java
     Class cl = Class.forName("java.util.Random");
     ```

     

2.   

## 9. 容器

1.   Generic Array Lists

     ```java
     ArrayList<Employee> staff = new ArrayList<Employee>();
     ArrayList<Employee> staff = new ArrayList<>(); // 可以自动推断类型
     staff.ensureCapacity(100); // 预分配内存
     staff.add(new Employee("foo", ...));
     Employee e = staff.get(index);
     staff.set(index, obj);
     staff.remove(index);
     ```

     **Boxing**

     ```java
     ArrayList<Integer> list = new ArrayList<>();
     list.add(3); // 实际为list.add(Integer.valueOf(3));
     int n = list.get(i) // 实际为list.get(i).intValue();
     ```

     第二行的行为叫作auto-boxing，第三行为auto-unboxing.

2.   Enumeration class

     枚举类型也可以实现为类。

     ```java
     public enum Size {
     	SMALL("S"), MEDIUM("M"), LARGE("L");
     	public String abbr;
     	private Size(String abbr) { this.abbr = abbr; }
     }
     ```

     所有的枚举类型都会继承`toString()`方法，可以将类型转换为枚举常量的名字。

     `Size.values()`方法会返回所有枚举值的array.

3.   

## 10. IO Stream

## 11. 多线程





















