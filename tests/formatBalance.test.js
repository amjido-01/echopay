import assert from 'node:assert';

function formatBalance(balance) {
  return balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

assert.strictEqual(formatBalance(1234), '1,234.00');
