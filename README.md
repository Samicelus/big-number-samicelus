# big-number

# Install

```
$npm install big-number-samicelus
```

# Usage

```
const BIGNUMBER = require('big-number-samicelus');

const big_1 = new BIGNUMBER("87.708");

const big_2 = new BIGNUMBER("-198.996");

console.log(`${big_1.toString()} + ${big_2.toString()} = ${big_1.add(big_2).toString()}`);

console.log(`${big_1.toString()} - ${big_2.toString()} = ${big_1.subtract(big_2).toString()}`);
```
