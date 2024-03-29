# 算法

## 动态规划

体感动态规划的题碰上的特别多，dp 的连续子数组问题，一般都是使用子数组末尾下标做为 i,j。然后去比较 list[i] 和 list[j] 是否符合条件，比较的是包括这个末尾的连续子数组。

- [最长重复子数组]((https://leetcode-cn.com/problems/maximum-length-of-repeated-subarray/))：i, j 分别表示两个数组中 [0, i] 和 [0, j] 最长重复子数组
- [最大子序合](https://leetcode-cn.com/problems/maximum-subarray/)：i 表示以 nums[i] 结尾的数组最大子序合
- [最长递增子序列](https://leetcode-cn.com/problems/longest-increasing-subsequence/)：i 表示已 nums[i]结尾的最长递增子序列
- [最长回文子串](https://leetcode-cn.com/problems/longest-palindromic-substring/)
- [长度最小的子数组](https://leetcode-cn.com/problems/minimum-size-subarray-sum/)：活动窗口，左右两个指针，小于是 end++，否则 start++，sum 减值，更新最小长度

### 718. 最长重复子数组

[LeetCode](https://leetcode-cn.com/problems/maximum-length-of-repeated-subarray/)

```js
var findLength = function(nums1, nums2) {
  // 两个数组最大连续公共子数组

  // i, j 分别表示两个数组中 [0, i] 和 [0, j] 最大连续子数组
  let dp = [];
  let res = -Infinity;

  for (let i = 0; i < nums1.length; i++) {
    dp[i] = []
    for(let j = 0; j < nums2.length; j++) {
      dp[i][j] = 0
      if (i === 0 || j === 0) {
        dp[i][j] = nums1[i] === nums2[j] ? 1 : 0
      } else if (nums1[i] === nums2[j]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = 0
      }

      res = Math.max(res, dp[i][j])
    }
  }
  return res
}

// test
findLength([1,2,3,2,1], [3,2,1,4,7]);
```

### 53. 最大子序和

[LeetCode](https://leetcode-cn.com/problems/maximum-subarray/)

```js
var maxSubArray = function(nums) {
  // 连续子数组的合最大值

  // i 表示以 nums[i] 结尾的数组最大值，所以 dp[i] 的值取的是 dp[i - 1] + nums[i] 和 nums[i] 较大的值

  let dp = [];
  let ans = -Infinity;

  for(let i = 0; i < nums.length; i++) {
    if (i === 0) { 
      dp[i] = nums[i];
    } else {
      dp[i] = Math.max(dp[i - 1] + nums[i], nums[i]);
    }
    ans = Math.max(dp[i], ans);
  }
  
  return ans;
};

//test
maxSubArray([-2,1,-3,4,-1,2,1,-5,4]);
```

### 152. 乘积最大子数组

[LeetCode](https://leetcode-cn.com/problems/maximum-product-subarray/)

```js
var maxProduct = function(nums) {
  let dpT = [];
  let dpB = [];
  let ans = -Infinity;

  for(let i = 0; i < nums.length; i++) {
    if (i === 0) { 
      dpT[i] = nums[i];
      dpB[i] = nums[i];
    } else {
      dpT[i] = Math.max(dpT[i - 1] * nums[i], dpB[i - 1] * nums[i], nums[i]);
      dpB[i] = Math.min(dpB[i - 1] * nums[i], dpT[i - 1] * nums[i], nums[i]);
    }
    ans = Math.max(dpT[i], ans);
  }
  
  return ans;
};

//test
maxProduct([2,3,-2,4]);
```

### 121. 买卖股票的最佳时机

[LeetCode](https://leetcode-cn.com/problems/best-time-to-buy-and-sell-stock/)

```js
var maxProfit = function(prices) {
  let s = Infinity;
  let ans = 0;
  for(let i = 0; i < prices.length; i++) {
    if (prices[i] < s) {
      s = prices[i];
      continue;
    }
    if (s !== Infinity) {
      ans = Math.max(prices[i] - s, ans);
    }
  }

  return ans;
};

// test
maxProfit([7,1,5,3,6,4]);
```

### 300. 最长递增子序列

[LeetCode](https://leetcode-cn.com/problems/longest-increasing-subsequence/)

```js
var lengthOfLIS = function(nums) {
  // 最长递增子序列，非连续

   // dp[i] 表示以 nums[i] 结尾的最长递增子序列
  // dp[j] = for(0..i) if (nums[j] > nums[i]) dp[j] = Max(dp[j], dp[i] + 1)

  let dp = [];
  for(let i = 0; i < nums.length; i++) {
    dp[i] = 1;
    for(let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
  }

  return Math.max(...dp);
};

//test
lengthOfLIS([10,9,2,5,3,7,101,18]);
```

### 5. 最长回文子串

这题用 dp 复杂度和暴力都一样是 O(n^2)，还不如暴力取一个起始点开始往两边走判断是否是回文。

[LeetCode](https://leetcode-cn.com/problems/longest-palindromic-substring/)

```js
var longestPalindrome = function(s) {
  // 找到 s 中最长的回文子串，子串是连续的

  // s[i] 开始往两边扩散，
  // s[i] === s[i + 1] 时开始往两边扩散，
  let res = ''
  function check(l, r) {
    while(l >= 0 && r < s.length && s[l] === s[r]) {
      if (r - l + 1 > res.length) {
        res = s.slice(l, r + 1)
      }
      l--
      r++
    }
  }

  for(let i = 0; i< s.length; i++) {
    check(i, i)
    check(i, i + 1)
  }

  return res
};

//test
longestPalindrome('babad');
```

## 滑动窗口

### 209. 长度最小的子数组

[LeetCode](https://leetcode-cn.com/problems/minimum-size-subarray-sum/)

```js
var minSubArrayLen = function(target, nums) {
  let start = 0, end = 0;
  let ans = Infinity;
  let sum = 0;
  // 左右两个指针，小于是 end++，否则 start++，sum 减值，更新最小长度
  while(end < nums.length){
    sum += nums[end];
    while(sum >= target){
      ans = Math.min(ans, end - start + 1);
      sum -= nums[start];
      start++;
    }
    end++;
  }

  return ans === Infinity ? 0 : ans;
};

//test
minSubArrayLen(7, [2,3,1,2,4,3]);
```

## 字符串

### 14.最长公共前缀

可别和最长公共子串搞混了

[LeetCode](https://leetcode-cn.com/problems/longest-common-prefix/submissions/)

```js
function longestCommonPrefix(strs) {
  let target = strs[0];
  
  for(let i = 1; i < strs.length; i++) {
    let str = strs[i];
    let j = 0;
    for(; j < str.length; j++) {
      if (str[j] !== target[j]) {
        break;
      }
    }
    target = target.slice(0, j);
    if (target === '') break;
  }

  return target;
}

//test
longestCommonPrefix(["flower","flow","flight"]);

```

### 415. 字符串相加

[LeetCode](https://leetcode-cn.com/problems/add-strings/)

```js
var addStrings = function(num1, num2) {
  let len = Math.max(num1.length, num2.length);
  let nl1 = num1.padStart(len, '0');
  let nl2 = num2.padStart(len, '0');
  let res = [];
  let flag = 0;
  for(let i = len - 1; i >=0; i--) {
    let b = parseInt(nl1[i]) + parseInt(nl2[i]) + flag;

    res.push(String(b % 10));
    flag = b >= 10 ? 1 : 0;
  }
  if (flag) res.push('1');

  return res.reverse().join('');
};
```

## 多数和问题

这类问题有两数和、三数和到 n 数和，n 数合通用解法就是先排序，然后 n-2 个数必须 for 套 for，最后 2 个数用双向指针。

### 1. 两数之和

[LeetCode](https://leetcode-cn.com/problems/two-sum/)

```js
var twoSum = function(nums, target) {
  let map = new Map();

  for(let i = 0; i < nums.length; i++) {
    let c = nums[i];
    let w = target - c;

    if (map.has(w)) {
      return [map.get(w), i]; 
    }

    map.set(c, i);
  }

};
```

### 167. 两数之和 II - 输入有序数组

[LeetCode](https://leetcode-cn.com/problems/two-sum-ii-input-array-is-sorted/)

```js
var twoSum = function(numbers, target) {
  let l = 0;
  let r = numbers.length - 1;
  while(l < r) {
    if (numbers[l] + numbers[r] === target) {
      return [l + 1, r + 1]; // 题目要求下标从 1 开始
    } else if (numbers[l] + numbers[r] > target) {
      r--;
    } else {
      l++;
    }
  }
};
```

### 15. 三数之和

[LeetCode](https://leetcode-cn.com/problems/3sum/)

```js
var threeSum = function(nums) {
  let ans = [];

  nums.sort((a, b) => a - b) // [-4, -1, -1, 0, 1, 2]

  for(let i = 0; i < nums.length - 2; i++) {
    let l = i + 1;
    let r = nums.length - 1;
    
    if (nums[i] === nums[i - 1]) continue;

    while(l < r) {
      let a = nums[l];
      let b =  nums[r];
      if (nums[i] + a + b === 0) {
        ans.push([nums[i], a, b]);

        while(nums[l] === a) {
          l++
        }

        while(nums[r] === b) {
          r--;
        }
      } else if (nums[i] + a + b > 0) {
        r--;
      } else {
        l++;
      }
    }
  }

  return ans;
};
```
