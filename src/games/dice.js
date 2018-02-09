const crypto = require('crypto');
const BigNumber = require('bignumber.js');

const targets = Object.freeze({
  hi: 1,
  lo: 0
});

const hashServerSeed = function (serverSeed) {
  const hash = crypto.createHash('sha512');
  hash.update(serverSeed);
  return hash.digest('hex');
};

const generateServerSeed = function () {
  return crypto.randomBytes(48).toString('base64');
};

const calculateDiceRoll = function (serverSeed, clientSeed, nonce) {
  const cs = `${nonce}:${clientSeed}:${nonce}`;
  const ss = `${nonce}:${serverSeed}:${nonce}`;

  const hash = crypto.createHmac('sha512', ss).update(cs)
    .digest('hex');
  let i = 0;
  let roll = -1;

  while (roll === -1) {
    if (i === 25) {
      const l3 = hash.substring(125, 128);
      const l3p = l3.parseInt(l3, 16);
      roll = l3p / 10000;
    } else {
      const f5 = hash.substring(5 * i, 5 + 5 * i);
      const f5p = parseInt(f5, 16);
      if (f5p < 1000000) {
        roll = f5p / 10000;
      }
      i++;
    }
  }
  return roll;
};

const calculateProfit = function (roll, chance, betAmount, target) {
  let profit = 0;

  if ((target === targets.hi && roll > 99.9999 - chance) || (target === targets.lo && roll < chance)) {
    // player win
    const multiplier = new BigNumber(99).dividedBy(chance);
    profit = new BigNumber(betAmount)
      .times(multiplier)
      .minus(betAmount)
      .dividedToIntegerBy(1)
      .toString();
  } else {
    // player lost
    profit = new BigNumber(betAmount)
      .times(-1)
      .toString();
  }
  return profit;
};

module.exports = {
  hashServerSeed,
  generateServerSeed,
  targets,
  calculateDiceRoll,
  calculateProfit
};
