# 算法

## 动态规划

体感动态规划的题碰上的特别多，dp 的连续子数组问题，一般都是使用子数组末尾下标做为 i,j。然后去比较 list[i] 和 list[j] 是否符合条件，比较的是包括这个末尾的连续子数组。

### 718. 最长重复子数组

[LeetCode](https://leetcode-cn.com/problems/maximum-length-of-repeated-subarray/)

```js
var findLength = function(nums1, nums2) {
  let dp = [];
  let ans = -Infinity;

  for(let i = 0; i < nums1.length; i++) {
    dp[i] = [];
    for(let j = 0; j < nums2.length; j++) {
      dp[i][j] = 0;
      if (nums1[i] === nums2[j]) {
        dp[i][j] = 1;
        if (i - 1 >= 0 && j - 1 >= 0) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        }
      }
      ans = Math.max(ans, dp[i][j]);
    }
  }

  return ans;
}

// test
findLength([1,2,3,2,1], [3,2,1,4,7]);
```

### 53. 最大子序和

[LeetCode](https://leetcode-cn.com/problems/maximum-subarray/)

```js
var maxSubArray = function(nums) {
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
  if (!s || s.length < 2) {
    return s
  }

  const len = s.length;
  let maxLen =  0;
  let start, end;

  for (let  i = 0; i < len; i ++) {
    let left = right = i;

    while ( right + 1 < len && s[i] == s[right + 1]) {
        right ++
    }


    while (left > 0 && right < len - 1 && s[left -  1] === s[right + 1]) {
        left --
        right ++
    }
    
    if (right - left + 1 > maxLen) {
        start = left
        end = right
        maxLen = right - left + 1

    }
  }

  return s.slice(start, end + 1)
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