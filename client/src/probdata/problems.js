export const problems = [
  {
    id: 1,
    statement: `You are given a positive integer **N**. Your task is to find the **sum of digits** of N.

**Input:**
A single integer N.

**Output:**
Print the sum of digits of N.

**Example:**
Input:
1234
Output:
10`,
    points: 20,
    sampleTests: [
      { input: "1234\n", expected: "10\n" },
      { input: "999\n", expected: "27\n" },
    ],
    hiddenTests: [
      { input: "123456789\n", expected: "45\n" },
      { input: "100000\n", expected: "1\n" },
    ],
  },
  {
    id: 2,
    statement: `You are given an array of integers of size **N**.  
Your task is to print the **second largest** element in the array.

**Input:**
The first line contains an integer N.  
The second line contains N space-separated integers.

**Output:**
Print the second largest element in the array.

**Example:**
Input:
5
2 8 7 1 9
Output:
8`,
    points: 40,
    sampleTests: [
      { input: "5\n2 8 7 1 9\n", expected: "8\n" },
      { input: "4\n1 2 3 4\n", expected: "3\n" },
    ],
    hiddenTests: [
      { input: "6\n9 9 9 8 8 7\n", expected: "8\n" },
      { input: "3\n10 5 7\n", expected: "7\n" },
    ],
  },
  {
    id: 3,
    statement: `You are given a string **S** consisting of lowercase English letters.  
Your task is to determine whether the string is a **palindrome** or not.

**Input:**
A single string S.

**Output:**
Print "YES" if the string is a palindrome, otherwise print "NO".

**Example:**
Input:
level
Output:
YES`,
    points: 60,
    sampleTests: [
      { input: "level\n", expected: "YES\n" },
      { input: "hello\n", expected: "NO\n" },
    ],
    hiddenTests: [
      { input: "madam\n", expected: "YES\n" },
      { input: "abcba\n", expected: "YES\n" },
    ],
  },
  {
    id: 4,
    statement: `You are given a number **N**.  
Print a **right-angled triangle pattern** of stars having N rows.

**Input:**
A single integer N.

**Output:**
Print a triangle pattern with N rows, where i-th row contains i stars.

**Example:**
Input:
4
Output:
*
**
***
****`,
    points: 80,
    sampleTests: [
      { input: "3\n", expected: "*\n**\n***\n" },
      { input: "5\n", expected: "*\n**\n***\n****\n*****\n" },
    ],
    hiddenTests: [
      { input: "2\n", expected: "*\n**\n" },
      { input: "6\n", expected: "*\n**\n***\n****\n*****\n******\n" },
    ],
  },
  {
    id: 5,
    statement: `You are given a positive integer **N**.  
Print all prime numbers from **1 to N** (inclusive).

**Input:**
A single integer N.

**Output:**
Print all prime numbers up to N separated by spaces.

**Example:**
Input:
10
Output:
2 3 5 7`,
    points: 100,
    sampleTests: [
      { input: "10\n", expected: "2 3 5 7\n" },
      { input: "5\n", expected: "2 3 5\n" },
    ],
    hiddenTests: [
      { input: "20\n", expected: "2 3 5 7 11 13 17 19\n" },
      { input: "2\n", expected: "2\n" },
    ],
  },
];
